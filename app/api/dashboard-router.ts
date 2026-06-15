import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { createRouter, adminQuery, anyRoleQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { tenders, bids, users, activityLogs } from "@db/schema";

export const dashboardRouter = createRouter({
  // ── Admin dashboard stats ──
  adminStats: adminQuery.query(async () => {
    const db = getDb();

    const totalTenders = await db.select({ count: sql<number>`count(*)` }).from(tenders);
    const totalBids = await db.select({ count: sql<number>`count(*)` }).from(bids);
    const totalVendors = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "vendor"));
    const totalAgents = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "agent"));

    const openTenders = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenders)
      .where(eq(tenders.status, "open"));

    const recentActivity = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(10);

    const bidsByStatus = await db
      .select({
        status: bids.status,
        count: sql<number>`count(*)`,
      })
      .from(bids)
      .groupBy(bids.status);

    return {
      totalTenders: totalTenders[0]?.count ?? 0,
      totalBids: totalBids[0]?.count ?? 0,
      totalVendors: totalVendors[0]?.count ?? 0,
      totalAgents: totalAgents[0]?.count ?? 0,
      openTenders: openTenders[0]?.count ?? 0,
      recentActivity,
      bidsByStatus,
    };
  }),

  // ── Vendor dashboard stats ──
  vendorStats: anyRoleQuery.query(async ({ ctx }) => {
    const db = getDb();
    const vendorId = ctx.user.id;

    const myBids = await db
      .select({ count: sql<number>`count(*)` })
      .from(bids)
      .where(eq(bids.vendorId, vendorId));

    const myActiveBids = await db
      .select({ count: sql<number>`count(*)` })
      .from(bids)
      .innerJoin(tenders, eq(bids.tenderId, tenders.id))
      .where(eq(bids.vendorId, vendorId));

    const availableTenders = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenders)
      .where(eq(tenders.status, "open"));

    return {
      myBids: myBids[0]?.count ?? 0,
      myActiveBids: myActiveBids[0]?.count ?? 0,
      availableTenders: availableTenders[0]?.count ?? 0,
    };
  }),

  // ── Agent dashboard stats ──
  agentStats: anyRoleQuery.query(async () => {
    const db = getDb();

    const totalTenders = await db.select({ count: sql<number>`count(*)` }).from(tenders);
    const openTenders = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenders)
      .where(eq(tenders.status, "open"));
    const closedTenders = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenders)
      .where(eq(tenders.status, "closed"));
    const totalBids = await db.select({ count: sql<number>`count(*)` }).from(bids);

    return {
      totalTenders: totalTenders[0]?.count ?? 0,
      openTenders: openTenders[0]?.count ?? 0,
      closedTenders: closedTenders[0]?.count ?? 0,
      totalBids: totalBids[0]?.count ?? 0,
    };
  }),

  // ── Recent activity ──
  recentActivity: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(20);
  }),

  // ── Log activity ──
  logActivity: adminQuery
    .input(
      z.object({
        action: z.string(),
        entityType: z.string().optional(),
        entityId: z.number().optional(),
        details: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.insert(activityLogs).values({
        ...input,
        userId: ctx.user.id,
      });
      return { success: true };
    }),
});
