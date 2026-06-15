import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { createRouter, agentQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { tenders, bids, users, vendorProfiles } from "@db/schema";

export const agentRouter = createRouter({
  // ── View all tenders (agent - locked view) ──
  listTenders: agentQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: tenders.id,
        tenderId: tenders.tenderId,
        title: tenders.title,
        description: tenders.description,
        category: tenders.category,
        status: tenders.status,
        budgetEstimate: tenders.budgetEstimate,
        location: tenders.location,
        closingDate: tenders.closingDate,
        isLocked: tenders.isLocked,
        documentUrl: tenders.documentUrl,
        documentName: tenders.documentName,
      })
      .from(tenders)
      .orderBy(desc(tenders.createdAt));
  }),

  // ── View bids for a tender ──
  viewBids: agentQuery
    .input(z.object({ tenderId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select({
          id: bids.id,
          bidAmount: bids.bidAmount,
          currency: bids.currency,
          status: bids.status,
          description: bids.description,
          documentUrl: bids.documentUrl,
          documentName: bids.documentName,
          submittedAt: bids.submittedAt,
          vendorName: users.name,
          vendorCompany: vendorProfiles.companyName,
        })
        .from(bids)
        .innerJoin(users, eq(bids.vendorId, users.id))
        .leftJoin(vendorProfiles, eq(bids.vendorId, vendorProfiles.userId))
        .where(eq(bids.tenderId, input.tenderId))
        .orderBy(desc(bids.submittedAt));
    }),

  // ── View all applicants (vendors who placed bids) ──
  listApplicants: agentQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        companyName: vendorProfiles.companyName,
        isActive: vendorProfiles.isActive,
      })
      .from(users)
      .leftJoin(vendorProfiles, eq(users.id, vendorProfiles.userId))
      .where(eq(users.role, "vendor"));
  }),

  // ── Get tender summary (no details) ──
  tenderSummary: agentQuery.query(async () => {
    const db = getDb();
    const allTenders = await db
      .select({
        id: tenders.id,
        tenderId: tenders.tenderId,
        title: tenders.title,
        status: tenders.status,
        category: tenders.category,
        closingDate: tenders.closingDate,
      })
      .from(tenders)
      .orderBy(desc(tenders.createdAt));

    return allTenders;
  }),
});
