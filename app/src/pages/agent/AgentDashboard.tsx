import { trpc } from "@/providers/trpc";
import {
  FileText,
  Gavel,
  Lock,
  TrendingUp,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AgentDashboard() {
  const { data: stats } = trpc.dashboard.agentStats.useQuery();

  const statCards = [
    {
      label: "Total Tenders",
      value: stats?.totalTenders ?? 0,
      icon: FileText,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Open Tenders",
      value: stats?.openTenders ?? 0,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Closed Tenders",
      value: stats?.closedTenders ?? 0,
      icon: Lock,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      label: "Total Bids",
      value: stats?.totalBids ?? 0,
      icon: Gavel,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
  ];

  const tenderOverview = [
    { name: "Open", count: stats?.openTenders ?? 0 },
    { name: "Closed", count: stats?.closedTenders ?? 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Agent Dashboard</h1>
          <p className="text-slate-600 text-sm mt-1">
            Monitor tenders and bid activity. Tender details are locked for security.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-medium">
          <Lock className="w-3.5 h-3.5" />
          Restricted Access
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-400 font-medium text-sm">Limited Access Notice</p>
          <p className="text-slate-600 text-sm mt-1">
            As a Procurement Agent, you can view tender summaries and bid counts, but tender documents and detailed bid information are locked. Contact an administrator for full access.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5 hover:border-yellow-500/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className={cn("p-2.5 rounded-lg", card.bg)}>
                  <Icon className={cn("w-5 h-5", card.color)} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-semibold text-slate-900 font-mono">
                  {card.value}
                </p>
                <p className="text-sm text-slate-600 mt-1">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-slate-900 font-medium mb-4">Tender Status Overview</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tenderOverview}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#111C2E",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="count" fill="#E5FF5C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-slate-900 font-medium mb-4">Quick Navigation</h3>
          <div className="space-y-3">
            <a
              href="/agent/tenders"
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-white transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                <Lock className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-slate-900 font-medium">View Tenders</p>
                <p className="text-slate-500 text-sm">Browse locked tender summaries</p>
              </div>
              <FileText className="w-4 h-4 text-slate-600 ml-auto" />
            </a>
            <div className="p-4 bg-slate-50 rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-slate-600 font-medium">Bid Details</p>
                  <p className="text-slate-600 text-sm">Contact admin for access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
