import {
  users, type User, type InsertUser,
  companyProfiles, type CompanyProfile, type InsertCompanyProfile,
  creatorProfiles, type CreatorProfile, type InsertCreatorProfile,
  campaigns, type Campaign, type InsertCampaign,
  ads, type Ad, type InsertAd,
  videos, type Video, type InsertVideo,
  videoAds, type VideoAd, type InsertVideoAd
} from "@shared/schema";

// Storage interface with all CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Company profile methods
  getCompanyProfile(id: number): Promise<CompanyProfile | undefined>;
  getCompanyProfileByUserId(userId: number): Promise<CompanyProfile | undefined>;
  createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile>;
  updateCompanyProfile(id: number, profileData: Partial<InsertCompanyProfile>): Promise<CompanyProfile>;
  deleteCompanyProfile(id: number): Promise<void>;

  // Creator profile methods
  getCreatorProfile(id: number): Promise<CreatorProfile | undefined>;
  getCreatorProfileByUserId(userId: number): Promise<CreatorProfile | undefined>;
  createCreatorProfile(profile: InsertCreatorProfile): Promise<CreatorProfile>;
  updateCreatorProfile(id: number, profileData: Partial<InsertCreatorProfile>): Promise<CreatorProfile>;
  deleteCreatorProfile(id: number): Promise<void>;

  // Campaign methods
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByUserId(userId: number): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaignData: Partial<InsertCampaign>): Promise<Campaign>;
  deleteCampaign(id: number): Promise<void>;

  // Ad methods
  getAd(id: number): Promise<Ad | undefined>;
  getAdsByUserId(userId: number): Promise<Ad[]>;
  getAdsByCampaignId(campaignId: number): Promise<Ad[]>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: number, adData: Partial<InsertAd>): Promise<Ad>;
  deleteAd(id: number): Promise<void>;

  // Video methods
  getVideo(id: number): Promise<Video | undefined>;
  getVideosByUserId(userId: number): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, videoData: Partial<InsertVideo>): Promise<Video>;
  deleteVideo(id: number): Promise<void>;

  // VideoAd methods
  getVideoAd(id: number): Promise<VideoAd | undefined>;
  getVideoAdsByVideoId(videoId: number): Promise<VideoAd[]>;
  getVideoAdsByAdId(adId: number): Promise<VideoAd[]>;
  createVideoAd(videoAd: InsertVideoAd): Promise<VideoAd>;
  updateVideoAd(id: number, videoAdData: Partial<InsertVideoAd>): Promise<VideoAd>;
  deleteVideoAd(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companyProfiles: Map<number, CompanyProfile>;
  private creatorProfiles: Map<number, CreatorProfile>;
  private campaigns: Map<number, Campaign>;
  private ads: Map<number, Ad>;
  private videos: Map<number, Video>;
  private videoAds: Map<number, VideoAd>;
  
  private userId: number;
  private companyProfileId: number;
  private creatorProfileId: number;
  private campaignId: number;
  private adId: number;
  private videoId: number;
  private videoAdId: number;

  constructor() {
    this.users = new Map();
    this.companyProfiles = new Map();
    this.creatorProfiles = new Map();
    this.campaigns = new Map();
    this.ads = new Map();
    this.videos = new Map();
    this.videoAds = new Map();

    this.userId = 1;
    this.companyProfileId = 1;
    this.creatorProfileId = 1;
    this.campaignId = 1;
    this.adId = 1;
    this.videoId = 1;
    this.videoAdId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const newUser: User = { ...user, id, createdAt: now };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    this.users.delete(id);
  }

  // Company profile methods
  async getCompanyProfile(id: number): Promise<CompanyProfile | undefined> {
    return this.companyProfiles.get(id);
  }

  async getCompanyProfileByUserId(userId: number): Promise<CompanyProfile | undefined> {
    return Array.from(this.companyProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile> {
    const id = this.companyProfileId++;
    const newProfile: CompanyProfile = { ...profile, id };
    this.companyProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateCompanyProfile(id: number, profileData: Partial<InsertCompanyProfile>): Promise<CompanyProfile> {
    const profile = await this.getCompanyProfile(id);
    if (!profile) {
      throw new Error(`Company profile with id ${id} not found`);
    }
    const updatedProfile: CompanyProfile = { ...profile, ...profileData };
    this.companyProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async deleteCompanyProfile(id: number): Promise<void> {
    const profile = await this.getCompanyProfile(id);
    if (!profile) {
      throw new Error(`Company profile with id ${id} not found`);
    }
    this.companyProfiles.delete(id);
  }

  // Creator profile methods
  async getCreatorProfile(id: number): Promise<CreatorProfile | undefined> {
    return this.creatorProfiles.get(id);
  }

  async getCreatorProfileByUserId(userId: number): Promise<CreatorProfile | undefined> {
    return Array.from(this.creatorProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createCreatorProfile(profile: InsertCreatorProfile): Promise<CreatorProfile> {
    const id = this.creatorProfileId++;
    const newProfile: CreatorProfile = { ...profile, id };
    this.creatorProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateCreatorProfile(id: number, profileData: Partial<InsertCreatorProfile>): Promise<CreatorProfile> {
    const profile = await this.getCreatorProfile(id);
    if (!profile) {
      throw new Error(`Creator profile with id ${id} not found`);
    }
    const updatedProfile: CreatorProfile = { ...profile, ...profileData };
    this.creatorProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async deleteCreatorProfile(id: number): Promise<void> {
    const profile = await this.getCreatorProfile(id);
    if (!profile) {
      throw new Error(`Creator profile with id ${id} not found`);
    }
    this.creatorProfiles.delete(id);
  }

  // Campaign methods
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getCampaignsByUserId(userId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(
      (campaign) => campaign.userId === userId
    );
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const id = this.campaignId++;
    const now = new Date();
    const newCampaign: Campaign = { ...campaign, id, createdAt: now };
    this.campaigns.set(id, newCampaign);
    return newCampaign;
  }

  async updateCampaign(id: number, campaignData: Partial<InsertCampaign>): Promise<Campaign> {
    const campaign = await this.getCampaign(id);
    if (!campaign) {
      throw new Error(`Campaign with id ${id} not found`);
    }
    const updatedCampaign: Campaign = { ...campaign, ...campaignData };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<void> {
    const campaign = await this.getCampaign(id);
    if (!campaign) {
      throw new Error(`Campaign with id ${id} not found`);
    }
    this.campaigns.delete(id);
  }

  // Ad methods
  async getAd(id: number): Promise<Ad | undefined> {
    return this.ads.get(id);
  }

  async getAdsByUserId(userId: number): Promise<Ad[]> {
    return Array.from(this.ads.values()).filter(
      (ad) => ad.userId === userId
    );
  }

  async getAdsByCampaignId(campaignId: number): Promise<Ad[]> {
    return Array.from(this.ads.values()).filter(
      (ad) => ad.campaignId === campaignId
    );
  }

  async createAd(ad: InsertAd): Promise<Ad> {
    const id = this.adId++;
    const now = new Date();
    const newAd: Ad = { ...ad, id, createdAt: now };
    this.ads.set(id, newAd);
    return newAd;
  }

  async updateAd(id: number, adData: Partial<InsertAd>): Promise<Ad> {
    const ad = await this.getAd(id);
    if (!ad) {
      throw new Error(`Ad with id ${id} not found`);
    }
    const updatedAd: Ad = { ...ad, ...adData };
    this.ads.set(id, updatedAd);
    return updatedAd;
  }

  async deleteAd(id: number): Promise<void> {
    const ad = await this.getAd(id);
    if (!ad) {
      throw new Error(`Ad with id ${id} not found`);
    }
    this.ads.delete(id);
  }

  // Video methods
  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getVideosByUserId(userId: number): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.userId === userId
    );
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const id = this.videoId++;
    const now = new Date();
    const newVideo: Video = { 
      ...video, 
      id, 
      createdAt: now,
      views: 0,
      thumbnailPath: undefined,
      processedFilePath: undefined,
      duration: undefined
    };
    this.videos.set(id, newVideo);
    return newVideo;
  }

  async updateVideo(id: number, videoData: Partial<InsertVideo>): Promise<Video> {
    const video = await this.getVideo(id);
    if (!video) {
      throw new Error(`Video with id ${id} not found`);
    }
    const updatedVideo: Video = { ...video, ...videoData };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  async deleteVideo(id: number): Promise<void> {
    const video = await this.getVideo(id);
    if (!video) {
      throw new Error(`Video with id ${id} not found`);
    }
    this.videos.delete(id);
  }

  // VideoAd methods
  async getVideoAd(id: number): Promise<VideoAd | undefined> {
    return this.videoAds.get(id);
  }

  async getVideoAdsByVideoId(videoId: number): Promise<VideoAd[]> {
    return Array.from(this.videoAds.values()).filter(
      (videoAd) => videoAd.videoId === videoId
    );
  }

  async getVideoAdsByAdId(adId: number): Promise<VideoAd[]> {
    return Array.from(this.videoAds.values()).filter(
      (videoAd) => videoAd.adId === adId
    );
  }

  async createVideoAd(videoAd: InsertVideoAd): Promise<VideoAd> {
    const id = this.videoAdId++;
    const now = new Date();
    const newVideoAd: VideoAd = { ...videoAd, id, createdAt: now };
    this.videoAds.set(id, newVideoAd);
    return newVideoAd;
  }

  async updateVideoAd(id: number, videoAdData: Partial<InsertVideoAd>): Promise<VideoAd> {
    const videoAd = await this.getVideoAd(id);
    if (!videoAd) {
      throw new Error(`VideoAd with id ${id} not found`);
    }
    const updatedVideoAd: VideoAd = { ...videoAd, ...videoAdData };
    this.videoAds.set(id, updatedVideoAd);
    return updatedVideoAd;
  }

  async deleteVideoAd(id: number): Promise<void> {
    const videoAd = await this.getVideoAd(id);
    if (!videoAd) {
      throw new Error(`VideoAd with id ${id} not found`);
    }
    this.videoAds.delete(id);
  }
}

// Create and export storage instance
export const storage = new MemStorage();
