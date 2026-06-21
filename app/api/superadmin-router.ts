import { z } from "zod";
import { eq, desc, inArray } from "drizzle-orm";
import { createRouter, superadminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, activityLogs, tenders, bids } from "@db/schema";
import { hashPassword } from "./lib/auth";

export const superadminRouter = createRouter({
  // ── Get all activity logs ──
  getActivityLogs: superadminQuery
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

  // ── User Management ──
  getUsers: superadminQuery.query(async () => {
    const db = getDb();
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(inArray(users.role, ["admin", "agent"]))
      .orderBy(desc(users.createdAt));
  }),

  createUser: superadminQuery
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
      role: z.enum(["admin", "agent"]),
      password: z.string().min(6),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existing.length > 0) {
        return { success: false, message: "Email already in use" };
      }

      const [{ insertId }] = await db.insert(users).values({
        name: input.name,
        email: input.email,
        role: input.role as any,
        passwordHash: hashPassword(input.password),
      });

      await db.insert(activityLogs).values({
        userId: ctx.user.id,
        action: "user_created",
        entityType: "user",
        entityId: insertId,
        details: `Created new ${input.role}: ${input.email}`,
      });

      return { success: true, message: "User created" };
    }),

  updateUser: superadminQuery
    .input(z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email(),
      role: z.enum(["admin", "agent"]),
      password: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const updates: any = {
        name: input.name,
        email: input.email,
        role: input.role,
      };

      if (input.password) {
        updates.passwordHash = hashPassword(input.password);
      }

      await db.update(users).set(updates).where(eq(users.id, input.id));

      await db.insert(activityLogs).values({
        userId: ctx.user.id,
        action: "user_updated",
        entityType: "user",
        entityId: input.id,
        details: `Updated ${input.role}: ${input.email}`,
      });

      return { success: true, message: "User updated" };
    }),

  deleteUser: superadminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.delete(users).where(eq(users.id, input.id));

      await db.insert(activityLogs).values({
        userId: ctx.user.id,
        action: "user_deleted",
        entityType: "user",
        entityId: input.id,
        details: `Deleted user ID: ${input.id}`,
      });

      return { success: true, message: "User deleted" };
    }),

  // ── Get Tenders (Read Only, No Passwords) ──
  getTenders: superadminQuery.query(async () => {
    const db = getDb();
    return await db
      .select({
        id: tenders.id,
        tenderId: tenders.tenderId,
        title: tenders.title,
        description: tenders.description,
        category: tenders.category,
        status: tenders.status,
        closingDate: tenders.closingDate,
        openingDate: tenders.openingDate,
        location: tenders.location,
        department: tenders.department,
        isLocked: tenders.isLocked,
        firstUnlockBy: tenders.firstUnlockBy,
        createdAt: tenders.createdAt,
      })
      .from(tenders)
      .where(inArray(tenders.status, ["open", "published", "closed", "awarded", "cancelled"]))
      .orderBy(desc(tenders.createdAt));
  }),

  // ── Get high level stats ──
  getStats: superadminQuery.query(async () => {
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
