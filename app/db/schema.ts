import {
  mysqlTable,
  mysqlEnum,
  varchar,
  text,
  timestamp,
  decimal,
  int,
  date,
  boolean,
} from "drizzle-orm/mysql-core";

// ─── Users ───
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin", "agent", "vendor"])
    .default("user")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
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
  gstNumber: varchar("gstNumber", { length: 50 }),
  panNumber: varchar("panNumber", { length: 50 }),
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
  publishDate: date("publishDate"),
  closingDate: date("closingDate").notNull(),
  openingDate: date("openingDate"),
  contractPeriod: varchar("contractPeriod", { length: 255 }),
  eligibilityCriteria: text("eligibilityCriteria"),
  documentUrl: text("documentUrl"),
  documentName: varchar("documentName", { length: 255 }),
  isLocked: boolean("isLocked").default(true).notNull(),
  unlockPassword: varchar("unlockPassword", { length: 255 }),
  lockReason: text("lockReason"),
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
  documentUrl: text("documentUrl"),
  documentName: varchar("documentName", { length: 255 }),
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
