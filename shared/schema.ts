import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: varchar("uid", { length: 20 }).notNull().unique(),
  instagramUsername: text("instagram_username").notNull(),
  password: text("password").notNull(),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).default("0").notNull(),
  bonusClaimed: boolean("bonus_claimed").default(false).notNull(),
  hasClaimedDiscount: boolean("has_claimed_discount").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id", { length: 50 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id).notNull(),
  serviceName: text("service_name").notNull(),
  instagramUsername: text("instagram_username").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("Processing").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  utrNumber: text("utr_number").notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: varchar("status", { length: 20 }).default("Pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  minOrder: integer("min_order").notNull(),
  maxOrder: integer("max_order").notNull(),
  deliveryTime: text("delivery_time").notNull(),
  active: boolean("active").default(true).notNull(),
});

export const loginLogs = pgTable("login_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  instagramUsername: text("instagram_username").notNull(),
  loginCount: integer("login_count").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  referralCode: varchar("referral_code", { length: 20 }).notNull().unique(),
  referredUserId: integer("referred_user_id").references(() => users.id),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const discountRewards = pgTable("discount_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  hasClaimedDiscount: boolean("has_claimed_discount").default(false).notNull(),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  uid: true,
  instagramUsername: true,
  password: true,
  walletBalance: true,
  bonusClaimed: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  orderId: true,
  userId: true,
  serviceName: true,
  instagramUsername: true,
  quantity: true,
  price: true,
  status: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  userId: true,
  amount: true,
  utrNumber: true,
  paymentMethod: true,
  status: true,
});

export const insertServiceSchema = createInsertSchema(services).pick({
  name: true,
  category: true,
  rate: true,
  minOrder: true,
  maxOrder: true,
  deliveryTime: true,
  active: true,
});

export const insertLoginLogSchema = createInsertSchema(loginLogs).pick({
  userId: true,
  instagramUsername: true,
  loginCount: true,
});

export const insertReferralSchema = createInsertSchema(referrals).pick({
  userId: true,
  referralCode: true,
  referredUserId: true,
  isCompleted: true,
});

export const insertDiscountRewardSchema = createInsertSchema(discountRewards).pick({
  userId: true,
  hasClaimedDiscount: true,
  claimedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertLoginLog = z.infer<typeof insertLoginLogSchema>;
export type LoginLog = typeof loginLogs.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertDiscountReward = z.infer<typeof insertDiscountRewardSchema>;
export type DiscountReward = typeof discountRewards.$inferSelect;
