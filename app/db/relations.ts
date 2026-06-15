import { relations } from "drizzle-orm";
import {
  users,
  vendorProfiles,
  tenders,
  bids,
  barredVendors,
  tenderAssignments,
  activityLogs,
} from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  vendorProfile: one(vendorProfiles, {
    fields: [users.id],
    references: [vendorProfiles.userId],
  }),
  bids: many(bids),
  activityLogs: many(activityLogs),
}));

export const vendorProfilesRelations = relations(vendorProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [vendorProfiles.userId],
    references: [users.id],
  }),
  bids: many(bids),
  barredFrom: many(barredVendors),
  assignments: many(tenderAssignments),
}));

export const tendersRelations = relations(tenders, ({ many }) => ({
  bids: many(bids),
  barredVendors: many(barredVendors),
  assignment: many(tenderAssignments),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  tender: one(tenders, {
    fields: [bids.tenderId],
    references: [tenders.id],
  }),
  vendor: one(users, {
    fields: [bids.vendorId],
    references: [users.id],
  }),
}));

export const barredVendorsRelations = relations(barredVendors, ({ one }) => ({
  vendor: one(users, {
    fields: [barredVendors.vendorId],
    references: [users.id],
  }),
  tender: one(tenders, {
    fields: [barredVendors.tenderId],
    references: [tenders.id],
  }),
}));

export const tenderAssignmentsRelations = relations(tenderAssignments, ({ one }) => ({
  tender: one(tenders, {
    fields: [tenderAssignments.tenderId],
    references: [tenders.id],
  }),
  vendor: one(users, {
    fields: [tenderAssignments.vendorId],
    references: [users.id],
  }),
}));
