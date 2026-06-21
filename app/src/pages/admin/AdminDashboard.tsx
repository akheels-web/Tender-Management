import { trpc } from "@/providers/trpc";
import {
  FileText,
  Gavel,
  Users,
  TrendingUp,
  Clock,
  Download,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn, formatActionName, handleDownloadLogs } from "@/lib/utils";
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

const BID_COLORS: Record<string, string> = {
  SUBMITTED: "#3B82F6",
  WITHDRAWN: "#F59E0B",
  EVALUATING: "#8B5CF6",
  ACCEPTED: "#10B981",
  REJECTED: "#EF4444",
};

export default function AdminDashboard() {
  const { data: stats } = trpc.dashboard.adminStats.useQuery();
  const { data: logs, isLoading: logsLoading } = trpc.dashboard.adminActivityLogs.useQuery({ limit: 50 });

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
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-cyan-500/50 hover:shadow-sm transition-all duration-300 group"
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
        <div className="bg-white border border-slate-200 rounded-xl p-5">
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
                  {bidStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BID_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#111C2E",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {bidStatusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: BID_COLORS[entry.name] || COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-slate-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tender Overview */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
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
                  itemStyle={{ color: "#fff" }}
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {tenderStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === "Open" ? "#3B82F6" : entry.name === "Closed" ? "#F59E0B" : entry.name === "Awarded" ? "#10B981" : "#22D3EE"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {/* Activity Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-medium text-slate-900">System Activity Logs</h2>
          </div>
          <Button
            onClick={() => handleDownloadLogs(logs || [], "admin_activity_logs.csv")}
            variant="outline"
            className="gap-2 border-slate-200 h-9"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-white/[0.02] text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {logsLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto" />
                  </td>
                </tr>
              ) : logs?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                logs?.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4">
                      {log.user ? (
                        <div>
                          <p className="text-slate-900 font-medium">{log.user.name}</p>
                          <p className="text-xs text-slate-500">{log.user.email} <span className="uppercase text-[10px] ml-1 px-1.5 py-0.5 rounded bg-slate-100">{log.user.role}</span></p>
                        </div>
                      ) : (
                        <span className="text-slate-500">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700">
                        {formatActionName(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {log.entityType} {log.entityId && `#${log.entityId}`}
                    </td>
                    <td className="px-6 py-4 max-w-md truncate text-slate-600" title={log.details || ""}>
                      {log.details || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
