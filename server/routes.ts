import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs/promises";
import bcrypt from "bcryptjs";
import multer from "multer";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import {
  loginUserSchema,
  registerUserSchema,
  insertUserSchema,
  insertCompanyProfileSchema,
  insertCreatorProfileSchema,
  insertCampaignSchema,
  insertAdSchema,
  insertVideoSchema,
} from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

// Set up file storage for uploads
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = file.fieldname === 'adVideo' ? 'ads' : 'videos';
    const dir = path.join(__dirname, '..', 'uploads', type);
    
    // Create directory if it doesn't exist
    fs.mkdir(dir, { recursive: true })
      .then(() => cb(null, dir))
      .catch(err => cb(err, dir));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storageConfig,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB limit for videos
  },
  fileFilter: (req, file, cb) => {
    // Accept only video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session management
  const memoryStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "advidsecret123",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: false, // Set to false for development, important for cookie to work
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      },
      store: new memoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // ===== AUTH ROUTES =====

  // Register user
  app.post(
    "/api/auth/register",
    validateRequest({
      body: registerUserSchema,
    }),
    async (req, res) => {
      try {
        // Check if user with email already exists
        const existingUserByEmail = await storage.getUserByEmail(req.body.email);
        if (existingUserByEmail) {
          return res.status(400).json({ message: "Email already in use" });
        }

        // Check if username already exists
        const existingUserByUsername = await storage.getUserByUsername(req.body.username);
        if (existingUserByUsername) {
          return res.status(400).json({ message: "Username already taken" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create user
        const newUser = await storage.createUser({
          ...req.body,
          password: hashedPassword,
        });

        // Create profile based on user type
        if (req.body.userType === "company") {
          await storage.createCompanyProfile({
            userId: newUser.id,
            companyName: req.body.fullName, // Use fullName as initial company name
            industry: "",
            website: "",
            description: "",
          });
        } else {
          await storage.createCreatorProfile({
            userId: newUser.id,
            bio: "",
            niche: "",
            youtubeChannel: "",
          });
        }

        res.status(201).json({
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          fullName: newUser.fullName,
          userType: newUser.userType,
        });
      } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Failed to register user" });
      }
    }
  );

  // Login user
  app.post(
    "/api/auth/login",
    validateRequest({
      body: loginUserSchema,
    }),
    async (req, res) => {
      try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // Verify password
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // Set user in session
        if (req.session) {
          req.session.userId = user.id;
          req.session.userType = user.userType;
        }

        res.status(200).json({
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          userType: user.userType,
        });
      } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Failed to login" });
      }
    }
  );

  // Logout user
  app.post("/api/auth/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.clearCookie("connect.sid");
        res.status(200).json({ message: "Logged out successfully" });
      });
    } else {
      res.status(200).json({ message: "No active session" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        userType: user.userType,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to retrieve user" });
    }
  });

  // Check auth status
  app.get("/api/auth/status", (req, res) => {
    if (req.session && req.session.userId) {
      return res.status(200).json({
        isAuthenticated: true,
        userType: req.session.userType,
      });
    }
    res.status(401).json({ isAuthenticated: false });
  });

  // ===== CAMPAIGN ROUTES =====

  // Get all campaigns for current user
  app.get("/api/campaigns", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const campaigns = await storage.getCampaignsByUserId(req.session.userId);
      
      // Add some derived properties for the frontend
      const enhancedCampaigns = campaigns.map(campaign => ({
        ...campaign,
        views: Math.floor(Math.random() * 10000), // This should come from analytics in a real app
        performance: Math.floor(Math.random() * 100), // This should come from analytics in a real app
      }));
      
      res.status(200).json(enhancedCampaigns);
    } catch (error) {
      console.error("Get campaigns error:", error);
      res.status(500).json({ message: "Failed to retrieve campaigns" });
    }
  });

  // Create new campaign
  app.post(
    "/api/campaigns",
    validateRequest({
      body: insertCampaignSchema,
    }),
    async (req, res) => {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      try {
        const campaign = await storage.createCampaign({
          ...req.body,
          userId: req.session.userId,
        });
        res.status(201).json(campaign);
      } catch (error) {
        console.error("Create campaign error:", error);
        res.status(500).json({ message: "Failed to create campaign" });
      }
    }
  );

  // Get campaign by ID
  app.get("/api/campaigns/:id", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Check if user owns this campaign
      if (campaign.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to access this campaign" });
      }

      res.status(200).json(campaign);
    } catch (error) {
      console.error("Get campaign error:", error);
      res.status(500).json({ message: "Failed to retrieve campaign" });
    }
  });

  // Update campaign
  app.patch("/api/campaigns/:id", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Check if user owns this campaign
      if (campaign.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this campaign" });
      }

      const updatedCampaign = await storage.updateCampaign(campaignId, req.body);
      res.status(200).json(updatedCampaign);
    } catch (error) {
      console.error("Update campaign error:", error);
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  // Delete campaign
  app.delete("/api/campaigns/:id", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Check if user owns this campaign
      if (campaign.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this campaign" });
      }

      await storage.deleteCampaign(campaignId);
      res.status(200).json({ message: "Campaign deleted successfully" });
    } catch (error) {
      console.error("Delete campaign error:", error);
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });

  // ===== AD ROUTES =====

  // Get all ads for current user
  app.get("/api/ads", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const ads = await storage.getAdsByUserId(req.session.userId);
      res.status(200).json(ads);
    } catch (error) {
      console.error("Get ads error:", error);
      res.status(500).json({ message: "Failed to retrieve ads" });
    }
  });

  // Upload new ad
  app.post("/api/ads/upload", upload.single('file'), async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const { title, description, campaignId } = req.body;
      
      // Create ad record
      const ad = await storage.createAd({
        userId: req.session.userId,
        campaignId: campaignId ? parseInt(campaignId) : undefined,
        title,
        description,
        filePath: req.file.path,
        duration: 30, // This would be extracted from the video file in a real app
        status: "pending",
      });

      res.status(201).json(ad);
    } catch (error) {
      console.error("Upload ad error:", error);
      res.status(500).json({ message: "Failed to upload ad" });
    }
  });

  // Get ad by ID
  app.get("/api/ads/:id", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const adId = parseInt(req.params.id);
      const ad = await storage.getAd(adId);
      
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }

      // Check if user owns this ad
      if (ad.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to access this ad" });
      }

      res.status(200).json(ad);
    } catch (error) {
      console.error("Get ad error:", error);
      res.status(500).json({ message: "Failed to retrieve ad" });
    }
  });

  // Update ad
  app.patch("/api/ads/:id", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const adId = parseInt(req.params.id);
      const ad = await storage.getAd(adId);
      
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }

      // Check if user owns this ad
      if (ad.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this ad" });
      }

      const updatedAd = await storage.updateAd(adId, req.body);
      res.status(200).json(updatedAd);
    } catch (error) {
      console.error("Update ad error:", error);
      res.status(500).json({ message: "Failed to update ad" });
    }
  });

  // Delete ad
  app.delete("/api/ads/:id", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const adId = parseInt(req.params.id);
      const ad = await storage.getAd(adId);
      
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }

      // Check if user owns this ad
      if (ad.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this ad" });
      }

      // Delete file
      if (ad.filePath) {
        await fs.unlink(ad.filePath).catch(err => {
          console.error("Failed to delete ad file:", err);
        });
      }

      await storage.deleteAd(adId);
      res.status(200).json({ message: "Ad deleted successfully" });
    } catch (error) {
      console.error("Delete ad error:", error);
      res.status(500).json({ message: "Failed to delete ad" });
    }
  });

  // ===== VIDEO ROUTES =====

  // Get all videos for current user
  app.get("/api/videos", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const videos = await storage.getVideosByUserId(req.session.userId);
      res.status(200).json(videos);
    } catch (error) {
      console.error("Get videos error:", error);
      res.status(500).json({ message: "Failed to retrieve videos" });
    }
  });

  // Upload new video
  app.post("/api/videos/upload", upload.single('file'), async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const { title, description, category, adPlacement, adPreferences } = req.body;
      
      // Create video record
      const video = await storage.createVideo({
        userId: req.session.userId,
        title,
        description,
        category,
        rawFilePath: req.file.path,
        status: "processing", // Initially set to processing
        adPlacement,
        adPreferences: adPreferences ? JSON.parse(adPreferences) : {},
      });

      // In a real app, we would trigger a video processing job here
      // For demo purposes, we'll update the status after a short delay
      setTimeout(async () => {
        try {
          const processedFilePath = `${req.file.path}-processed`;
          const thumbnailPath = `${req.file.path}-thumbnail`;
          
          // Update video with processed info
          await storage.updateVideo(video.id, {
            status: "ready",
            processedFilePath,
            thumbnailPath,
            duration: Math.floor(Math.random() * 600) + 60, // Random duration between 1-10 minutes
          });
        } catch (error) {
          console.error("Error updating processed video:", error);
        }
      }, 10000); // 10 seconds delay to simulate processing

      res.status(201).json(video);
    } catch (error) {
      console.error("Upload video error:", error);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });

  // Get video by ID
  app.get("/api/videos/:id", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Check if user owns this video
      if (video.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to access this video" });
      }

      res.status(200).json(video);
    } catch (error) {
      console.error("Get video error:", error);
      res.status(500).json({ message: "Failed to retrieve video" });
    }
  });

  // Download video
  app.get("/api/videos/:id/download", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Check if user owns this video
      if (video.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to download this video" });
      }

      // Check if video is ready
      if (video.status !== "ready" && video.status !== "published") {
        return res.status(400).json({ message: "Video is not ready for download" });
      }

      // In a real app, we would check if the file exists and serve it
      // For demo purposes, just return success
      res.status(200).json({ 
        message: "Download started",
        url: video.processedFilePath || video.rawFilePath
      });
    } catch (error) {
      console.error("Download video error:", error);
      res.status(500).json({ message: "Failed to download video" });
    }
  });

  // Update video
  app.patch("/api/videos/:id", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Check if user owns this video
      if (video.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this video" });
      }

      const updatedVideo = await storage.updateVideo(videoId, req.body);
      res.status(200).json(updatedVideo);
    } catch (error) {
      console.error("Update video error:", error);
      res.status(500).json({ message: "Failed to update video" });
    }
  });

  // Delete video
  app.delete("/api/videos/:id", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Check if user owns this video
      if (video.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this video" });
      }

      // Delete files
      if (video.rawFilePath) {
        await fs.unlink(video.rawFilePath).catch(err => {
          console.error("Failed to delete raw video file:", err);
        });
      }
      
      if (video.processedFilePath) {
        await fs.unlink(video.processedFilePath).catch(err => {
          console.error("Failed to delete processed video file:", err);
        });
      }
      
      if (video.thumbnailPath) {
        await fs.unlink(video.thumbnailPath).catch(err => {
          console.error("Failed to delete thumbnail file:", err);
        });
      }

      await storage.deleteVideo(videoId);
      res.status(200).json({ message: "Video deleted successfully" });
    } catch (error) {
      console.error("Delete video error:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // ===== ANALYTICS ROUTES =====

  // Get analytics summary for company
  app.get("/api/analytics/summary", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // Check if user is a company
      const user = await storage.getUser(req.session.userId);
      if (!user || user.userType !== "company") {
        return res.status(403).json({ message: "Only company accounts can access this" });
      }

      // Get campaigns
      const campaigns = await storage.getCampaignsByUserId(req.session.userId);
      const activeCampaigns = campaigns.filter(c => c.status === "active").length;

      // In a real app, we would fetch actual analytics
      // For demo purposes, generate sample data
      const analyticsData = {
        activeCampaigns,
        campaignGrowth: Math.floor(Math.random() * 20),
        totalViews: Math.floor(Math.random() * 50000),
        viewsGrowth: Math.floor(Math.random() * 25),
        budgetUsed: Math.floor(Math.random() * 1000),
        budgetPercentage: Math.floor(Math.random() * 80),
      };

      res.status(200).json(analyticsData);
    } catch (error) {
      console.error("Analytics summary error:", error);
      res.status(500).json({ message: "Failed to retrieve analytics" });
    }
  });

  // Get analytics summary for creator
  app.get("/api/analytics/creator/summary", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // Check if user is a creator
      const user = await storage.getUser(req.session.userId);
      if (!user || user.userType !== "individual") {
        return res.status(403).json({ message: "Only creator accounts can access this" });
      }

      // Get videos
      const videos = await storage.getVideosByUserId(req.session.userId);
      const totalVideos = videos.length;
      const processingVideos = videos.filter(v => v.status === "processing").length;

      // In a real app, we would fetch actual analytics
      // For demo purposes, generate sample data
      const analyticsData = {
        totalVideos,
        newVideos: Math.floor(Math.random() * 5),
        totalViews: Math.floor(Math.random() * 50000),
        viewsGrowth: Math.floor(Math.random() * 25),
        totalEarnings: (Math.random() * 500).toFixed(2),
        earningsGrowth: Math.floor(Math.random() * 30),
        processingVideos,
        processingEta: processingVideos > 0 ? `${Math.floor(Math.random() * 30)} minutes` : "N/A",
      };

      res.status(200).json(analyticsData);
    } catch (error) {
      console.error("Creator analytics summary error:", error);
      res.status(500).json({ message: "Failed to retrieve analytics" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
