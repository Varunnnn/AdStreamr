import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for both company and individual users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  userType: text("user_type").notNull(), // 'company' or 'individual'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Company profile details
export const companyProfiles = pgTable("company_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
  website: text("website"),
  description: text("description"),
});

// Individual creator profile details
export const creatorProfiles = pgTable("creator_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bio: text("bio"),
  niche: text("niche"),
  youtubeChannel: text("youtube_channel"),
});

// Ad campaigns
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  status: text("status").notNull(), // active, paused, completed
  budget: numeric("budget").notNull(),
  spent: numeric("spent").default("0").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  targetAudience: text("target_audience"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ads uploaded by companies
export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  title: text("title").notNull(),
  description: text("description"),
  filePath: text("file_path").notNull(),
  duration: integer("duration").notNull(), // in seconds
  status: text("status").notNull(), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Videos uploaded by creators
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  rawFilePath: text("raw_file_path").notNull(),
  processedFilePath: text("processed_file_path"),
  thumbnailPath: text("thumbnail_path"),
  duration: integer("duration"), // in seconds
  status: text("status").notNull(), // uploaded, processing, ready, published
  adPreferences: jsonb("ad_preferences"),
  adPlacement: text("ad_placement"), // pre-roll, mid-roll, post-roll
  views: integer("views").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Video-Ad mapping for tracking which ads are in which videos
export const videoAds = pgTable("video_ads", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videos.id),
  adId: integer("ad_id").notNull().references(() => ads.id),
  placementTime: integer("placement_time"), // timestamp in video (seconds)
  views: integer("views").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  fullName: true,
  userType: true,
});

export const insertCompanyProfileSchema = createInsertSchema(companyProfiles).pick({
  userId: true,
  companyName: true,
  industry: true,
  website: true,
  description: true,
});

export const insertCreatorProfileSchema = createInsertSchema(creatorProfiles).pick({
  userId: true,
  bio: true,
  niche: true,
  youtubeChannel: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  userId: true,
  name: true,
  status: true,
  budget: true,
  spent: true,
  startDate: true,
  endDate: true,
  targetAudience: true,
});

export const insertAdSchema = createInsertSchema(ads).pick({
  userId: true,
  campaignId: true,
  title: true,
  description: true,
  filePath: true,
  duration: true,
  status: true,
});

export const insertVideoSchema = createInsertSchema(videos).pick({
  userId: true,
  title: true,
  description: true,
  category: true, 
  rawFilePath: true,
  processedFilePath: true,
  thumbnailPath: true,
  duration: true,
  status: true,
  adPreferences: true,
  adPlacement: true,
});

export const insertVideoAdSchema = createInsertSchema(videoAds).pick({
  videoId: true,
  adId: true,
  placementTime: true,
  views: true,
  clicks: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CompanyProfile = typeof companyProfiles.$inferSelect;
export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;

export type CreatorProfile = typeof creatorProfiles.$inferSelect;
export type InsertCreatorProfile = z.infer<typeof insertCreatorProfileSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type Ad = typeof ads.$inferSelect;
export type InsertAd = z.infer<typeof insertAdSchema>;

export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

export type VideoAd = typeof videoAds.$inferSelect;
export type InsertVideoAd = z.infer<typeof insertVideoAdSchema>;

// Extended schemas for registration and login
export const registerUserSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
