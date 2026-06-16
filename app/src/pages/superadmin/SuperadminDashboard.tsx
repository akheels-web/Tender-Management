import { trpc } from "@/providers/trpc";
import { format } from "date-fns";
import { 
  Activity, 
  FileText, 
  Users, 
  Gavel, 
  ShieldAlert,
  Shield
} from "lucide-react";

export default function SuperadminDashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.superadmin.getStats.useQuery();
  const { data: logs, isLoading: logsLoading } = trpc.superadmin.getActivityLogs.useQuery({ limit: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Superadmin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          System-wide overview and complete audit trail.
        </p>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-medium border border-indigo-500/20 w-fit">
        <Shield className="w-3.5 h-3.5" />
        Superadmin Mode
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Tenders</p>
              <h3 className="text-2xl font-semibold text-white mt-1">
                {statsLoading ? "..." : stats?.totalTenders || 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Gavel className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Bids</p>
              <h3 className="text-2xl font-semibold text-white mt-1">
                {statsLoading ? "..." : stats?.totalBids || 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Users</p>
              <h3 className="text-2xl font-semibold text-white mt-1">
                {statsLoading ? "..." : stats?.totalUsers || 0}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-[#111C2E] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-medium text-white">System Activity Logs</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/[0.02] text-slate-400 font-medium">
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
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4">
                      {log.user ? (
                        <div>
                          <p className="text-white font-medium">{log.user.name}</p>
                          <p className="text-xs text-slate-500">{log.user.email} <span className="uppercase text-[10px] ml-1 px-1.5 py-0.5 rounded bg-white/10">{log.user.role}</span></p>
                        </div>
                      ) : (
                        <span className="text-slate-500">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {log.entityType} {log.entityId && `#${log.entityId}`}
                    </td>
                    <td className="px-6 py-4 max-w-md truncate text-slate-400" title={log.details || ""}>
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
