import { authRouter } from "./auth-router";
import { tenderRouter } from "./tender-router";
import { bidRouter } from "./bid-router";
import { vendorRouter } from "./vendor-router";
import { agentRouter } from "./agent-router";
import { superadminRouter } from "./superadmin-router";
import { dashboardRouter } from "./dashboard-router";
import { vendorGroupRouter } from "./vendor-group-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  tender: tenderRouter,
  bid: bidRouter,
  vendor: vendorRouter,
  agent: agentRouter,
  superadmin: superadminRouter,
  dashboard: dashboardRouter,
  vendorGroup: vendorGroupRouter,
});

export type AppRouter = typeof appRouter;
