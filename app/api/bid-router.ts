import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createRouter, adminQuery, vendorQuery, anyRoleQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { bids, tenders, users, vendorProfiles, barredVendors, agentDownloads } from "@db/schema";
import { sql } from "drizzle-orm";

export const bidRouter = createRouter({
  // ── Place a bid (vendor) ──
  place: vendorQuery
    .input(
      z.object({
        tenderId: z.number(),
        bidAmount: z.string(),
        currency: z.string().default("USD"),
        description: z.string().min(10),
        documentUrl: z.string().optional(),
        documentName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const vendorId = ctx.user.id;

      // Check if vendor is barred from this tender
      const barred = await db
        .select()
        .from(barredVendors)
        .where(
          and(
            eq(barredVendors.vendorId, vendorId),
            eq(barredVendors.tenderId, input.tenderId)
          )
        )
        .limit(1);

      if (barred[0]) {
        return {
          success: false,
          message: "You are barred from bidding on this tender",
        };
      }

      // Check if tender is open
      const tender = await db
        .select()
        .from(tenders)
        .where(eq(tenders.id, input.tenderId))
        .limit(1);

      if (!tender[0]) {
        return { success: false, message: "Tender not found" };
      }

      if (tender[0].status !== "open" && tender[0].status !== "published") {
        return { success: false, message: "This tender is not accepting bids" };
      }

      // Check if vendor already placed a bid
      const existingBid = await db
        .select()
        .from(bids)
        .where(and(eq(bids.tenderId, input.tenderId), eq(bids.vendorId, vendorId)))
        .limit(1);

      if (existingBid[0]) {
        return {
          success: false,
          message: "You have already placed a bid on this tender",
        };
      }

      const result = await db.insert(bids).values({
        ...input,
        vendorId,
      });

      return { success: true, id: Number(result[0].insertId) };
    }),

  // ── List my bids (vendor) ──
  myBids: vendorQuery.query(async ({ ctx }) => {
    const db = getDb();
    const results = await db
      .select({
        id: bids.id,
        tenderId: bids.tenderId,
        bidAmount: bids.bidAmount,
        currency: bids.currency,
        status: bids.status,
        description: bids.description,
        documentUrl: bids.documentUrl,
        documentName: bids.documentName,
        technicalScore: bids.technicalScore,
        financialScore: bids.financialScore,
        notes: bids.notes,
        submittedAt: bids.submittedAt,
        tenderTitle: tenders.title,
        tenderRefId: tenders.tenderId,
        tenderStatus: tenders.status,
      })
      .from(bids)
      .innerJoin(tenders, eq(bids.tenderId, tenders.id))
      .where(eq(bids.vendorId, ctx.user.id))
      .orderBy(desc(bids.submittedAt));

    return results;
  }),

  // ── Get all bids for a tender (admin) ──
  byTender: adminQuery
    .input(z.object({ tenderId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select({
          id: bids.id,
          bidAmount: bids.bidAmount,
          currency: bids.currency,
          status: bids.status,
          description: bids.description,
          documentUrl: bids.documentUrl,
          documentName: bids.documentName,
          technicalScore: bids.technicalScore,
          financialScore: bids.financialScore,
          notes: bids.notes,
          submittedAt: bids.submittedAt,
          vendorName: users.name,
          vendorEmail: users.email,
          vendorCompany: vendorProfiles.companyName,
          agentDownloadCount: sql<number>`(SELECT COUNT(*) FROM ${agentDownloads} WHERE ${agentDownloads.bidId} = ${bids.id})`.as("agentDownloadCount"),
        })
        .from(bids)
        .innerJoin(users, eq(bids.vendorId, users.id))
        .leftJoin(vendorProfiles, eq(bids.vendorId, vendorProfiles.userId))
        .where(eq(bids.tenderId, input.tenderId))
        .orderBy(desc(bids.submittedAt));

      return results;
    }),

  // ── Update bid status (admin) ──
  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          "submitted",
          "under_review",
          "shortlisted",
          "rejected",
          "accepted",
          "withdrawn",
        ]),
        technicalScore: z.string().optional(),
        financialScore: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(bids).set(data).where(eq(bids.id, id));
      return { success: true };
    }),

  // ── Get bid by ID ──
  getById: anyRoleQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(bids)
        .where(eq(bids.id, input.id))
        .limit(1);
      return result[0] ?? null;
    }),

  // ── Withdraw bid (vendor) ──
  withdraw: vendorQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db
        .update(bids)
        .set({ status: "withdrawn" })
        .where(and(eq(bids.id, input.id), eq(bids.vendorId, ctx.user.id)));
      return { success: true };
    }),
});
