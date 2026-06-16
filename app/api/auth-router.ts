import * as cookie from "cookie";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@db/index";
import { users, passwordResetTokens } from "@db/schema";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { verifyPassword, signSessionToken, hashPassword } from "./lib/auth";

export const authRouter = createRouter({
  login: publicQuery
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userList = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      const user = userList[0];
      
      if (!user) {
        throw Errors.badRequest("Invalid email or password.");
      }
      
      if (!verifyPassword(input.password, user.passwordHash)) {
        throw Errors.badRequest("Invalid email or password.");
      }
      
      const token = await signSessionToken(user.id);
      const opts = getSessionCookieOptions(ctx.req.headers);
      
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        })
      );
      
      return { success: true, role: user.role };
    }),

  forgotPassword: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const userList = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      const user = userList[0];
      
      if (!user) {
        // Return success even if user doesn't exist to prevent email enumeration
        return { success: true };
      }

      // Generate a simple token (in a real app, use crypto.randomBytes)
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      console.log(`\n\n==============================================`);
      console.log(`PASSWORD RESET SIMULATION FOR: ${input.email}`);
      console.log(`RESET TOKEN: ${token}`);
      console.log(`==============================================\n\n`);

      return { success: true };
    }),

  resetPassword: publicQuery
    .input(z.object({ token: z.string(), password: z.string().min(6) }))
    .mutation(async ({ input }) => {
      const tokenList = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.token, input.token))
        .limit(1);
        
      const resetToken = tokenList[0];

      if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
        throw Errors.badRequest("Invalid or expired reset token.");
      }

      const hashedPassword = hashPassword(input.password);

      // Update password
      await db.update(users).set({ passwordHash: hashedPassword }).where(eq(users.id, resetToken.userId));
      
      // Mark token as used
      await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, resetToken.id));

      return { success: true };
    }),

  provisionAuditor: publicQuery
    .input(z.object({ secret: z.string(), email: z.string().email(), password: z.string().min(6) }))
    .mutation(async ({ input }) => {
      // Check the secret key against environment variables
      const validSecret = process.env.AUDITOR_PROVISION_SECRET;
      if (!validSecret || input.secret !== validSecret) {
        throw Errors.forbidden("Invalid provision secret.");
      }

      const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existing.length > 0) {
        throw Errors.badRequest("Auditor account with this email already exists.");
      }

      await db.insert(users).values({
        name: "Chief Auditor",
        email: input.email,
        passwordHash: hashPassword(input.password),
        role: "auditor",
      });

      return { success: true, message: "Auditor account provisioned successfully." };
    }),

  me: authedQuery.query((opts) => opts.ctx.user),
  
  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
