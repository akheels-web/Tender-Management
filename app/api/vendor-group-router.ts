import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { createRouter, agentQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { vendorGroups, vendorGroupMemberships, users } from "@db/schema";
import { Errors } from "@contracts/constants";

export const vendorGroupRouter = createRouter({
  getAll: authedQuery.query(async () => {
    const db = getDb();
    return db.select().from(vendorGroups);
  }),

  create: agentQuery
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [result] = await db.insert(vendorGroups).values({
        name: input.name,
        description: input.description,
        createdBy: ctx.user!.id,
      });
      return { success: true, groupId: result.insertId };
    }),

  addVendor: agentQuery
    .input(z.object({ groupId: z.number(), vendorId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      // check if already exists
      const existing = await db
        .select()
        .from(vendorGroupMemberships)
        .where(eq(vendorGroupMemberships.groupId, input.groupId))
        .where(eq(vendorGroupMemberships.vendorId, input.vendorId));

      if (existing.length > 0) {
        throw Errors.badRequest("Vendor already in this group.");
      }

      await db.insert(vendorGroupMemberships).values({
        groupId: input.groupId,
        vendorId: input.vendorId,
      });

      return { success: true };
    }),

  getGroupVendors: agentQuery
    .input(z.object({ groupId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const memberships = await db
        .select({
          vendorId: vendorGroupMemberships.vendorId,
        })
        .from(vendorGroupMemberships)
        .where(eq(vendorGroupMemberships.groupId, input.groupId));

      if (memberships.length === 0) return [];

      const vendorIds = memberships.map((m) => m.vendorId);
      const groupUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(users)
        .where(inArray(users.id, vendorIds));

      return groupUsers;
    }),
});
