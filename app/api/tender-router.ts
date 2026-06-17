import { z } from "zod";
import { eq, and, like, gte, lte, desc, sql, inArray } from "drizzle-orm";
import { createRouter, adminQuery, anyRoleQuery, publicQuery, agentQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { tenders, bids, barredVendors, tenderAssignments, agentDownloads, vendorGroupMemberships, users } from "@db/schema";
import { sendEmail } from "./lib/email";

export const tenderRouter = createRouter({
  // ── List tenders (public) ──
  list: publicQuery
    .input(
      z
        .object({
          status: z.string().optional(),
          category: z.string().optional(),
          search: z.string().optional(),
          dateFrom: z.string().optional(),
          dateTo: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.status) {
        conditions.push(eq(tenders.status, input.status as any));
      }
      if (input?.category) {
        conditions.push(eq(tenders.category, input.category));
      }
      if (input?.search) {
        conditions.push(like(tenders.tenderId, `%${input.search}%`));
      }
      if (input?.dateFrom) {
        conditions.push(gte(tenders.closingDate, new Date(input.dateFrom)));
      }
      if (input?.dateTo) {
        conditions.push(lte(tenders.closingDate, new Date(input.dateTo)));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const results = await db
        .select({
          id: tenders.id,
          tenderId: tenders.tenderId,
          title: tenders.title,
          description: tenders.description,
          category: tenders.category,
          status: tenders.status,
          budgetEstimate: tenders.budgetEstimate,
          currency: tenders.currency,
          location: tenders.location,
          department: tenders.department,
          publishDate: tenders.publishDate,
          closingDate: tenders.closingDate,
          openingDate: tenders.openingDate,
          contractPeriod: tenders.contractPeriod,
          eligibilityCriteria: tenders.eligibilityCriteria,
          documentUrl: tenders.documentUrl,
          documentName: tenders.documentName,
          isLocked: tenders.isLocked,
          unlockedAt: tenders.unlockedAt,
          vendorGroupId: tenders.vendorGroupId,
          unlockPassword: tenders.unlockPassword,
          lockReason: tenders.lockReason,
          createdBy: tenders.createdBy,
          createdAt: tenders.createdAt,
          updatedAt: tenders.updatedAt,
          agentDownloadCount: sql<number>`(SELECT COUNT(*) FROM ${agentDownloads} WHERE ${agentDownloads.tenderId} = ${tenders.id} AND ${agentDownloads.bidId} IS NULL)`.as("agentDownloadCount"),
        })
        .from(tenders)
        .where(where)
        .orderBy(desc(tenders.createdAt));

      return results;
    }),

  // ── Get tender by ID ──
  getById: anyRoleQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(tenders)
        .where(eq(tenders.id, input.id))
        .limit(1);
      return result[0] ?? null;
    }),

  // ── Create tender (agent/admin) ──
  create: agentQuery
    .input(
      z.object({
        tenderId: z.string().min(3),
        title: z.string().min(5),
        description: z.string().min(10),
        category: z.string().min(1),
        status: z
          .enum(["draft", "published", "open", "closed", "awarded", "cancelled"])
          .default("draft"),
        budgetEstimate: z.string().optional(),
        currency: z.string().default("USD"),
        location: z.string().optional(),
        department: z.string().optional(),
        publishDate: z.string().optional(),
        closingDate: z.string(),
        openingDate: z.string().optional(),
        contractPeriod: z.string().optional(),
        isLocked: z.boolean().default(true),
        vendorGroupId: z.number().optional(),
        unlockPassword: z.string().optional(),
        lockReason: z.string().optional(),
        documentUrl: z.string().optional(),
        documentName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const insertData: any = {
        ...input,
        createdBy: ctx.user.id,
        closingDate: new Date(input.closingDate),
      };
      
      if (!insertData.unlockPassword) {
        insertData.unlockPassword = Math.random().toString(36).substring(2, 10).toUpperCase();
      }

      if (input.publishDate) insertData.publishDate = new Date(input.publishDate);
      if (input.openingDate) insertData.openingDate = new Date(input.openingDate);

      const result = await db.insert(tenders).values(insertData);
      const newTenderId = Number(result[0].insertId);

      // Trigger email if published and assigned to group
      if (
        (input.status === "published" || input.status === "open") &&
        input.vendorGroupId
      ) {
        const memberships = await db
          .select({ vendorId: vendorGroupMemberships.vendorId })
          .from(vendorGroupMemberships)
          .where(eq(vendorGroupMemberships.groupId, input.vendorGroupId));
        
        if (memberships.length > 0) {
          const vendors = await db
            .select({ email: users.email })
            .from(users)
            .where(inArray(users.id, memberships.map((m) => m.vendorId)));
            
          const emails = vendors.map(v => v.email);
          if (emails.length > 0) {
            await sendEmail({
              to: emails,
              subject: `New Tender Released: ${input.title}`,
              text: `A new tender "${input.title}" has been released to your vendor group.\nClosing Date: ${new Date(input.closingDate).toDateString()}\n\nLog in to the portal to view the details and apply.`,
            });
          }
        }
      }

      return { id: newTenderId, success: true };
    }),

  // ── Update tender (agent/admin) ──
  update: agentQuery
    .input(
      z.object({
        id: z.number(),
        tenderId: z.string().optional(),
        title: z.string().min(5).optional(),
        description: z.string().min(10).optional(),
        category: z.string().optional(),
        status: z
          .enum(["draft", "published", "open", "closed", "awarded", "cancelled"])
          .optional(),
        budgetEstimate: z.string().optional(),
        currency: z.string().optional(),
        location: z.string().optional(),
        department: z.string().optional(),
        publishDate: z.string().nullable().optional(),
        closingDate: z.string().optional(),
        openingDate: z.string().nullable().optional(),
        contractPeriod: z.string().optional(),
        eligibilityCriteria: z.string().optional(),
        vendorGroupId: z.number().optional(),
        isLocked: z.boolean().optional(),
        unlockPassword: z.string().nullable().optional(),
        lockReason: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.closingDate) updateData.closingDate = new Date(data.closingDate);
      if (data.publishDate) updateData.publishDate = new Date(data.publishDate);
      if (data.openingDate) updateData.openingDate = new Date(data.openingDate);

      const existingTender = await db.select().from(tenders).where(eq(tenders.id, id)).limit(1).then(res => res[0]);
      if (!existingTender) return { success: false, message: "Tender not found" };

      // If manually unlocked, set unlockedAt
      if (data.isLocked === false) {
        updateData.unlockedAt = new Date();
      }

      await db.update(tenders).set(updateData).where(eq(tenders.id, id));

      // Trigger email if newly published or newly assigned to a vendor group while published
      const isNowPublished = data.status === "published" || data.status === "open" || (data.status === undefined && (existingTender.status === "published" || existingTender.status === "open"));
      const isNewlyPublished = (data.status === "published" || data.status === "open") && (existingTender.status !== "published" && existingTender.status !== "open");
      
      const newGroupId = data.vendorGroupId !== undefined ? data.vendorGroupId : existingTender.vendorGroupId;
      const isNewGroup = data.vendorGroupId !== undefined && data.vendorGroupId !== existingTender.vendorGroupId;

      if (isNowPublished && newGroupId && (isNewlyPublished || isNewGroup)) {
        const memberships = await db
          .select({ vendorId: vendorGroupMemberships.vendorId })
          .from(vendorGroupMemberships)
          .where(eq(vendorGroupMemberships.groupId, newGroupId));
        
        if (memberships.length > 0) {
          const vendorsList = await db
            .select({ email: users.email })
            .from(users)
            .where(inArray(users.id, memberships.map((m) => m.vendorId)));
            
          const emails = vendorsList.map(v => v.email);
          if (emails.length > 0) {
            await sendEmail({
              to: emails,
              subject: `Tender Update: ${data.title || existingTender.title}`,
              text: `A tender "${data.title || existingTender.title}" has been published and released to your vendor group.\nClosing Date: ${new Date(updateData.closingDate || existingTender.closingDate).toDateString()}\n\nLog in to the portal to view the details and apply.`,
            });
          }
        }
      }

      return { success: true };
    }),

  // ── Delete tender (admin) ──
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(bids).where(eq(bids.tenderId, input.id));
      await db.delete(barredVendors).where(eq(barredVendors.tenderId, input.id));
      await db
        .delete(tenderAssignments)
        .where(eq(tenderAssignments.tenderId, input.id));
      await db.delete(tenders).where(eq(tenders.id, input.id));
      return { success: true };
    }),

  // ── Unlock tender ──
  unlock: adminQuery
    .input(
      z.object({
        id: z.number(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(tenders)
        .where(eq(tenders.id, input.id))
        .limit(1);

      const tender = result[0];
      if (!tender) {
        return { success: false, message: "Tender not found" };
      }

      if (tender.unlockPassword !== input.password) {
        return { success: false, message: "Incorrect password" };
      }

      if (tender.closingDate && new Date(tender.closingDate) > new Date()) {
        return { success: false, message: "Cannot unlock tender before closing date" };
      }

      await db
        .update(tenders)
        .set({ isLocked: false })
        .where(eq(tenders.id, input.id));

      return { success: true, message: "Tender unlocked" };
    }),

  // ── Lock tender ──
  lock: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const tender = await db.select().from(tenders).where(eq(tenders.id, input.id)).limit(1).then(res => res[0]);
      if (!tender) return { success: false };

      const autoPassword = tender.unlockPassword || Math.random().toString(36).slice(-8);

      await db
        .update(tenders)
        .set({ isLocked: true, unlockPassword: autoPassword })
        .where(eq(tenders.id, input.id));
      return { success: true };
    }),

  // ── Assign tender to vendor ──
  assign: adminQuery
    .input(
      z.object({
        tenderId: z.number(),
        vendorId: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db
        .insert(tenderAssignments)
        .values({
          tenderId: input.tenderId,
          vendorId: input.vendorId,
          assignedBy: ctx.user.id,
          notes: input.notes,
        })
        .onDuplicateKeyUpdate({
          set: {
            vendorId: input.vendorId,
            assignedBy: ctx.user.id,
            notes: input.notes,
          },
        });
      return { success: true };
    }),

  // ── Get tender with bids ──
  getWithBids: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const tender = await db
        .select()
        .from(tenders)
        .where(eq(tenders.id, input.id))
        .limit(1);

      if (!tender[0]) return null;

      const bidsData = await db
        .select()
        .from(bids)
        .where(eq(bids.tenderId, input.id))
        .orderBy(desc(bids.submittedAt));

      return { ...tender[0], bids: bidsData };
    }),

  // ── Get tender stats ──
  stats: adminQuery.query(async () => {
    const db = getDb();
    const allTenders = await db.select().from(tenders);

    const total = allTenders.length;
    const open = allTenders.filter((t) => t.status === "open").length;
    const closed = allTenders.filter((t) => t.status === "closed").length;
    const awarded = allTenders.filter((t) => t.status === "awarded").length;
    const draft = allTenders.filter((t) => t.status === "draft").length;

    const allBids = await db.select().from(bids);
    const totalBids = allBids.length;

    return { total, open, closed, awarded, draft, totalBids };
  }),

  // ── Get categories ──
  categories: publicQuery.query(async () => {
    const db = getDb();
    const results = await db
      .selectDistinct({ category: tenders.category })
      .from(tenders);
    return results.map((r) => r.category);
  }),

  // ── Bar vendor from tender ──
  barVendor: adminQuery
    .input(
      z.object({
        vendorId: z.number(),
        tenderId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.insert(barredVendors).values({
        vendorId: input.vendorId,
        tenderId: input.tenderId,
        reason: input.reason,
        barredBy: ctx.user.id,
      });
      return { success: true };
    }),

  // ── Unbar vendor from tender ──
  unbarVendor: adminQuery
    .input(
      z.object({
        vendorId: z.number(),
        tenderId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .delete(barredVendors)
        .where(
          and(
            eq(barredVendors.vendorId, input.vendorId),
            eq(barredVendors.tenderId, input.tenderId)
          )
        );
      return { success: true };
    }),

  // ── Get barred vendors for tender ──
  getBarredVendors: adminQuery
    .input(z.object({ tenderId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(barredVendors)
        .where(eq(barredVendors.tenderId, input.tenderId));
      return results;
    }),
});
