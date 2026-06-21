import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./lib/auth";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
  ip: string;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ip = opts.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
             opts.req.headers.get("x-real-ip") || 
             "127.0.0.1";
             
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders, ip };
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Authentication is optional here
  }
  return ctx;
}
