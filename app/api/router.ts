import { authRouter } from "./auth-router";
import { tenderRouter } from "./tender-router";
import { bidRouter } from "./bid-router";
import { vendorRouter } from "./vendor-router";
import { agentRouter } from "./agent-router";
import { auditorRouter } from "./auditor-router";
import { dashboardRouter } from "./dashboard-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  tender: tenderRouter,
  bid: bidRouter,
  vendor: vendorRouter,
  agent: agentRouter,
  auditor: auditorRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
