import * as cookie from "cookie";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@db/index";
import { users } from "@db/schema";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { verifyPassword, signSessionToken } from "./lib/auth";

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
