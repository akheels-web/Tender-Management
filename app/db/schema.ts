import {
  mysqlTable,
  mysqlEnum,
  varchar,
  text,
  timestamp,
  decimal,
  int,
  boolean,
} from "drizzle-orm/mysql-core";

// ─── Users ───
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["superadmin", "admin", "agent", "vendor"])
    .default("vendor")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  unlockOtp: varchar("unlockOtp", { length: 4 }),
  unlockOtpExpiry: timestamp("unlockOtpExpiry"),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Vendor Profiles ───
export const vendorProfiles = mysqlTable("vendor_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  contactPerson: varchar("contactPerson", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  crNumber: varchar("crNumber", { length: 50 }),
  vatNumber: varchar("vatNumber", { length: 50 }),
  occiNumber: varchar("occiNumber", { length: 50 }),
  registrationNumber: varchar("registrationNumber", { length: 100 }),
  yearsInBusiness: int("yearsInBusiness"),
  website: varchar("website", { length: 255 }),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type VendorProfile = typeof vendorProfiles.$inferSelect;
export type InsertVendorProfile = typeof vendorProfiles.$inferInsert;

// ─── Vendor Groups ───
export const vendorGroups = mysqlTable("vendor_groups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VendorGroup = typeof vendorGroups.$inferSelect;
export type InsertVendorGroup = typeof vendorGroups.$inferInsert;

export const vendorGroupMemberships = mysqlTable("vendor_group_memberships", {
  groupId: int("groupId").notNull(),
  vendorId: int("vendorId").notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
});

export type VendorGroupMembership = typeof vendorGroupMemberships.$inferSelect;
export type InsertVendorGroupMembership = typeof vendorGroupMemberships.$inferInsert;

// ─── Tenders ───
export const tenders = mysqlTable("tenders", {
  id: int("id").autoincrement().primaryKey(),
  tenderId: varchar("tenderId", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  status: mysqlEnum("status", [
    "draft",
    "published",
    "open",
    "closed",
    "awarded",
    "cancelled",
  ])
    .default("draft")
    .notNull(),
  budgetEstimate: decimal("budgetEstimate", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  location: varchar("location", { length: 255 }),
  department: varchar("department", { length: 255 }),
  publishDate: timestamp("publishDate"),
  closingDate: timestamp("closingDate").notNull(),
  openingDate: timestamp("openingDate"),
  contractPeriod: varchar("contractPeriod", { length: 255 }),
  eligibilityCriteria: text("eligibilityCriteria"),
  documentUrl: text("documentUrl"),
  documentName: varchar("documentName", { length: 255 }),
  isLocked: boolean("isLocked").default(true).notNull(),
  unlockedAt: timestamp("unlockedAt"),
  vendorGroupId: int("vendorGroupId"),
  unlockPassword: varchar("unlockPassword", { length: 255 }),
  lockReason: text("lockReason"),
  firstUnlockBy: int("firstUnlockBy"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Tender = typeof tenders.$inferSelect;
export type InsertTender = typeof tenders.$inferInsert;

// ─── Bids ───
export const bids = mysqlTable("bids", {
  id: int("id").autoincrement().primaryKey(),
  tenderId: int("tenderId").notNull(),
  vendorId: int("vendorId").notNull(),
  bidAmount: decimal("bidAmount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  description: text("description"),
  documentUrl: text("documentUrl"), // Legacy
  documentName: varchar("documentName", { length: 255 }), // Legacy
  quotationDocumentUrl: text("quotationDocumentUrl"),
  quotationDocumentName: varchar("quotationDocumentName", { length: 255 }),
  technicalDocumentUrl: text("technicalDocumentUrl"),
  technicalDocumentName: varchar("technicalDocumentName", { length: 255 }),
  status: mysqlEnum("status", [
    "submitted",
    "under_review",
    "shortlisted",
    "rejected",
    "accepted",
    "withdrawn",
  ])
    .default("submitted")
    .notNull(),
  technicalScore: decimal("technicalScore", { precision: 5, scale: 2 }),
  financialScore: decimal("financialScore", { precision: 5, scale: 2 }),
  notes: text("notes"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Bid = typeof bids.$inferSelect;
export type InsertBid = typeof bids.$inferInsert;

// ─── Barred Vendors ───
export const barredVendors = mysqlTable("barred_vendors", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendorId").notNull(),
  tenderId: int("tenderId"),
  reason: text("reason"),
  barredBy: int("barredBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BarredVendor = typeof barredVendors.$inferSelect;
export type InsertBarredVendor = typeof barredVendors.$inferInsert;

// ─── Tender Assignments ───
export const tenderAssignments = mysqlTable("tender_assignments", {
  id: int("id").autoincrement().primaryKey(),
  tenderId: int("tenderId").notNull().unique(),
  vendorId: int("vendorId").notNull(),
  assignedBy: int("assignedBy").notNull(),
  assignmentDate: timestamp("assignmentDate").defaultNow().notNull(),
  notes: text("notes"),
});

export type TenderAssignment = typeof tenderAssignments.$inferSelect;
export type InsertTenderAssignment = typeof tenderAssignments.$inferInsert;

// ─── Activity Log ───
export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: int("entityId"),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// ─── Agent Downloads ───
export const agentDownloads = mysqlTable("agent_downloads", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  tenderId: int("tenderId").notNull(),
  bidId: int("bidId"),
  downloadedAt: timestamp("downloadedAt").defaultNow().notNull(),
});

export type AgentDownload = typeof agentDownloads.$inferSelect;
export type InsertAgentDownload = typeof agentDownloads.$inferInsert;

// ─── Password Reset Tokens ───
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  used: boolean("used").default(false).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
