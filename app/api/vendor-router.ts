import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, adminQuery, vendorQuery, anyRoleQuery, agentQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, vendorProfiles, barredVendors } from "@db/schema";
import { hashPassword } from "./lib/auth";
import { Errors } from "@contracts/errors";

export const vendorRouter = createRouter({
  list: agentQuery
    .input(
      z
        .object({
          search: z.string().optional(),
          isActive: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = getDb();

      if (input?.search) {
        return db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            avatar: users.avatar,
            role: users.role,
            createdAt: users.createdAt,
            companyName: vendorProfiles.companyName,
            contactPerson: vendorProfiles.contactPerson,
            phone: vendorProfiles.phone,
            isActive: vendorProfiles.isActive,
            isVerified: vendorProfiles.isVerified,
          })
          .from(users)
          .leftJoin(vendorProfiles, eq(users.id, vendorProfiles.userId))
          .where(eq(users.role, "vendor"))
          .orderBy(desc(users.createdAt));
      }

      const results = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
          role: users.role,
          createdAt: users.createdAt,
          companyName: vendorProfiles.companyName,
          contactPerson: vendorProfiles.contactPerson,
          phone: vendorProfiles.phone,
          isActive: vendorProfiles.isActive,
          isVerified: vendorProfiles.isVerified,
        })
        .from(users)
        .leftJoin(vendorProfiles, eq(users.id, vendorProfiles.userId))
        .where(eq(users.role, "vendor"))
        .orderBy(desc(users.createdAt));

      return results;
    }),

  // ── Create vendor (admin) ──
  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        companyName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      
      const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existing.length > 0) {
        throw Errors.badRequest("A user with this email already exists.");
      }

      const [{ insertId: userId }] = await db.insert(users).values({
        name: input.name,
        email: input.email,
        passwordHash: hashPassword(input.password),
        role: "vendor",
      });

      await db.insert(vendorProfiles).values({
        userId: userId,
        companyName: input.companyName,
        isActive: true,
      });

      return { success: true, userId };
    }),

  // ── Get vendor by ID ──
  getById: anyRoleQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1);

      if (!user[0]) return null;

      const profile = await db
        .select()
        .from(vendorProfiles)
        .where(eq(vendorProfiles.userId, input.id))
        .limit(1);

      return { ...user[0], profile: profile[0] ?? null };
    }),

  // ── Update vendor profile ──
  updateProfile: vendorQuery
    .input(
      z.object({
        companyName: z.string().min(1).optional(),
        contactPerson: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        crNumber: z.string().optional(),
        vatNumber: z.string().optional(),
        occiNumber: z.string().optional(),
        registrationNumber: z.string().optional(),
        yearsInBusiness: z.number().optional(),
        website: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const vendorId = ctx.user.id;

      const existing = await db
        .select()
        .from(vendorProfiles)
        .where(eq(vendorProfiles.userId, vendorId))
        .limit(1);

      if (existing[0]) {
        await db
          .update(vendorProfiles)
          .set(input)
          .where(eq(vendorProfiles.userId, vendorId));
      } else {
        await db.insert(vendorProfiles).values({
          userId: vendorId,
          companyName: input.companyName || ctx.user.name || "",
          ...input,
        });
      }

      return { success: true };
    }),

  // ── Deactivate vendor (admin) ──
  deactivate: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(vendorProfiles)
        .set({ isActive: false })
        .where(eq(vendorProfiles.userId, input.id));
      return { success: true };
    }),

  // ── Activate vendor (admin) ──
  activate: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(vendorProfiles)
        .set({ isActive: true })
        .where(eq(vendorProfiles.userId, input.id));
      return { success: true };
    }),

  // ── Get my profile (vendor) ──
  myProfile: vendorQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    const profile = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, ctx.user.id))
      .limit(1);

    return { ...user[0], profile: profile[0] ?? null };
  }),

  // ── Get my barred tenders ──
  myBarredTenders: vendorQuery.query(async ({ ctx }) => {
    const db = getDb();
    const results = await db
      .select()
      .from(barredVendors)
      .where(eq(barredVendors.vendorId, ctx.user.id));
    return results;
  }),
});
