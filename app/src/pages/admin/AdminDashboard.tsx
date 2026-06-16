import { trpc } from "@/providers/trpc";
import {
  FileText,
  Gavel,
  Users,
  TrendingUp,
  Clock,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#22D3EE", "#E5FF5C", "#FF3B5C", "#3B82F6", "#F59E0B"];

export default function AdminDashboard() {
  const { data: stats } = trpc.dashboard.adminStats.useQuery();

  const statCards = [
    {
      label: "Total Tenders",
      value: stats?.totalTenders ?? 0,
      icon: FileText,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Total Bids",
      value: stats?.totalBids ?? 0,
      icon: Gavel,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Vendors",
      value: stats?.totalVendors ?? 0,
      icon: Users,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Open Tenders",
      value: stats?.openTenders ?? 0,
      icon: TrendingUp,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
  ];

  const bidStatusData =
    stats?.bidsByStatus?.map((b) => ({
      name: b.status.replace("_", " ").toUpperCase(),
      value: b.count,
    })) ?? [];

  const tenderStatusData = [
    {
      name: "Open",
      count: stats ? stats.openTenders : 0,
    },
    {
      name: "Closed",
      count: stats ? stats.totalTenders - stats.openTenders : 0,
    },
    {
      name: "Awarded",
      count: stats ? stats.totalTenders - stats.openTenders : 0,
    },
  ].filter((d) => d.count > 0);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 text-sm mt-1">
            Welcome back! Here's what's happening with your tenders.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          System Active
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5 hover:border-cyan-500/20 transition-all duration-300 group"
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bid Status Distribution */}
        <div className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-slate-900 font-medium mb-4">Bid Status Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bidStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {bidStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#111C2E",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {bidStatusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-slate-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tender Overview */}
        <div className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-slate-900 font-medium mb-4">Tender Overview</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tenderStatusData}>
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
                <Bar dataKey="count" fill="#22D3EE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-slate-900 font-medium mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {stats?.recentActivity?.length === 0 && (
            <p className="text-slate-500 text-sm">No recent activity</p>
          )}
          {stats?.recentActivity?.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800">{activity.action}</p>
                <p className="text-xs text-slate-500">{activity.details}</p>
              </div>
              <span className="text-xs text-slate-600 flex-shrink-0">
                {activity.createdAt
                  ? new Date(activity.createdAt).toLocaleDateString()
                  : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
