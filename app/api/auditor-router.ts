import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, auditorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, activityLogs, tenders, bids } from "@db/schema";

export const auditorRouter = createRouter({
  // ── Get all activity logs ──
  getActivityLogs: auditorQuery
    .input(z.object({ limit: z.number().default(100) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const logs = await db
        .select({
          id: activityLogs.id,
          action: activityLogs.action,
          entityType: activityLogs.entityType,
          entityId: activityLogs.entityId,
          details: activityLogs.details,
          ipAddress: activityLogs.ipAddress,
          createdAt: activityLogs.createdAt,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
          },
        })
        .from(activityLogs)
        .leftJoin(users, eq(activityLogs.userId, users.id))
        .orderBy(desc(activityLogs.createdAt))
        .limit(input?.limit || 100);

      return logs;
    }),

  // ── Get high level stats ──
  getStats: auditorQuery.query(async () => {
    const db = getDb();
    
    // Quick and dirty stats just checking count lengths
    const tendersList = await db.select({ id: tenders.id }).from(tenders);
    const bidsList = await db.select({ id: bids.id }).from(bids);
    const usersList = await db.select({ id: users.id }).from(users);

    return {
      totalTenders: tendersList.length,
      totalBids: bidsList.length,
      totalUsers: usersList.length,
    };
  }),
});
