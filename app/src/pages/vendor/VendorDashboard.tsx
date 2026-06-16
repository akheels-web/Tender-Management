import { trpc } from "@/providers/trpc";
import {
  FileText,
  Gavel,
  Search,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router";

export default function VendorDashboard() {
  const { data: stats } = trpc.dashboard.vendorStats.useQuery();
  const { data: myBids } = trpc.bid.myBids.useQuery();

  const recentBids = myBids?.slice(0, 5);

  const statCards = [
    {
      label: "My Bids",
      value: stats?.myBids ?? 0,
      icon: Gavel,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      link: "/vendor/my-bids",
    },
    {
      label: "Available Tenders",
      value: stats?.availableTenders ?? 0,
      icon: FileText,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      link: "/vendor/tenders",
    },
  ];

  const statusColors: Record<string, string> = {
    submitted: "bg-blue-500/10 text-blue-400",
    under_review: "bg-yellow-500/10 text-yellow-400",
    shortlisted: "bg-cyan-500/10 text-cyan-400",
    rejected: "bg-red-500/10 text-red-400",
    accepted: "bg-emerald-500/10 text-emerald-400",
    withdrawn: "bg-gray-500/10 text-gray-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Vendor Dashboard</h1>
          <p className="text-slate-600 text-sm mt-1">
            Browse tenders, place bids, and track your proposals.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          Active Vendor
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/vendor/tenders"
          className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-5 hover:border-cyan-500/40 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
              <Search className="w-5 h-5 text-cyan-400" />
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
          </div>
          <p className="text-slate-900 font-medium">Browse Tenders</p>
          <p className="text-slate-600 text-sm mt-1">Find and bid on open tenders</p>
        </Link>

        <Link
          to="/vendor/my-bids"
          className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl p-5 hover:border-emerald-500/40 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <Gavel className="w-5 h-5 text-emerald-400" />
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
          </div>
          <p className="text-slate-900 font-medium">My Bids</p>
          <p className="text-slate-600 text-sm mt-1">Track your bid history</p>
        </Link>

        <div className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <p className="text-slate-900 font-medium">Bid Guide</p>
          <p className="text-slate-600 text-sm mt-1">All bids must include a PDF proposal</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5"
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

      {/* Recent Bids */}
      <div className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 font-medium">Recent Bids</h3>
          <Link
            to="/vendor/my-bids"
            className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {recentBids?.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-6">
              No bids yet. Start browsing tenders!
            </p>
          )}
          {recentBids?.map((bid) => (
            <div
              key={bid.id}
              className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <Gavel className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 truncate">
                  {bid.tenderTitle}
                </p>
                <p className="text-xs text-slate-500">
                  ${Number(bid.bidAmount).toLocaleString()} -{" "}
                  {bid.submittedAt
                    ? new Date(bid.submittedAt).toLocaleDateString()
                    : ""}
                </p>
              </div>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  statusColors[bid.status] || ""
                )}
              >
                {bid.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
