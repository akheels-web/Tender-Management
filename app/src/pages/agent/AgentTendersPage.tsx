import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Lock,
  FileText,
  Calendar,
  DollarSign,
  Eye,
  AlertTriangle,
  Gavel,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-400",
  published: "bg-blue-500/10 text-blue-400",
  open: "bg-emerald-500/10 text-emerald-400",
  closed: "bg-red-500/10 text-red-400",
  awarded: "bg-cyan-500/10 text-cyan-400",
  cancelled: "bg-orange-500/10 text-orange-400",
};

export default function AgentTendersPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTender, setSelectedTender] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showBids, setShowBids] = useState(false);

  const { data: tenders, isLoading } = trpc.agent.listTenders.useQuery();
  const { data: bids } = trpc.agent.viewBids.useQuery(
    { tenderId: selectedTender?.id },
    { enabled: !!selectedTender && showBids }
  );

  const filteredTenders = statusFilter
    ? tenders?.filter((t) => t.status === statusFilter)
    : tenders;

  const openDetail = (tender: any) => {
    setSelectedTender(tender);
    setShowDetail(true);
  };

  const openBids = (tender: any) => {
    setSelectedTender(tender);
    setShowBids(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tenders</h1>
          <p className="text-slate-400 text-sm mt-1">
            View tender summaries and bid activity. Full details are locked.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium">
          <Lock className="w-3.5 h-3.5" />
          Locked View
        </div>
      </div>

      {/* Alert */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-slate-400 text-sm">
          You are viewing tender summaries only. Detailed tender documents and bid amounts are restricted. Contact an administrator for full access.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-[#111C2E] border-white/10 text-white">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-[#111C2E] border-white/10">
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="awarded">Awarded</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tender List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTenders?.length === 0 && (
            <div className="text-center py-12 bg-[#111C2E] rounded-xl border border-white/[0.06]">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No tenders found</p>
            </div>
          )}
          {filteredTenders?.map((tender) => (
            <div
              key={tender.id}
              className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5 hover:border-yellow-500/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium",
                        statusColors[tender.status] || ""
                      )}
                    >
                      {tender.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {tender.tenderId}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  </div>
                  <h3 className="text-white font-medium text-lg mb-1">
                    {tender.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-1 mb-3">
                    {tender.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Closes: {tender.closingDate ? new Date(tender.closingDate).toLocaleDateString() : "N/A"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      Budget: ${Number(tender.budgetEstimate).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      {tender.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => openDetail(tender)}
                    className="p-2 text-slate-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all"
                    title="View Summary"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openBids(tender)}
                    className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                    title="View Bids"
                  >
                    <Gavel className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog (Locked) */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="bg-[#111C2E] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              Tender Summary (Locked)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full font-medium",
                  statusColors[selectedTender?.status] || ""
                )}
              >
                {selectedTender?.status?.toUpperCase()}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {selectedTender?.tenderId}
              </span>
            </div>
            <h3 className="text-white font-medium text-lg">
              {selectedTender?.title}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-[#0A1628] rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Category</p>
                <p className="text-white">{selectedTender?.category}</p>
              </div>
              <div className="bg-[#0A1628] rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Closing Date</p>
                <p className="text-white">
                  {selectedTender?.closingDate
                    ? new Date(selectedTender.closingDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="bg-[#0A1628] rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Budget</p>
                <p className="text-white font-mono">
                  ${Number(selectedTender?.budgetEstimate).toLocaleString()}
                </p>
              </div>
              <div className="bg-[#0A1628] rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Location</p>
                <p className="text-white">{selectedTender?.location || "N/A"}</p>
              </div>
            </div>
            
            {!selectedTender?.isLocked && selectedTender?.documentUrl && (
              <div className="bg-[#0A1628] rounded-lg p-3 mt-3 flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs mb-1">Tender Document</p>
                  <a
                    href={selectedTender.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    {selectedTender.documentName || "View PDF"}
                  </a>
                </div>
              </div>
            )}

            {selectedTender?.isLocked && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <Lock className="w-4 h-4" />
                  <span className="font-medium text-sm">Tender Details Locked</span>
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  Full tender documents and bid details are restricted. Contact an administrator to unlock.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bids Dialog */}
      <Dialog open={showBids} onOpenChange={setShowBids}>
        <DialogContent className="bg-[#111C2E] border-white/10 text-white max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-cyan-400" />
              Bid Activity
            </DialogTitle>
          </DialogHeader>
          <p className="text-slate-400 text-sm">
            Bids for: <span className="text-white">{selectedTender?.title}</span>
          </p>
          <div className="space-y-3 mt-4">
            {bids?.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-6">No bids yet</p>
            )}
            {bids?.map((bid) => (
              <div key={bid.id} className="bg-[#0A1628] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">
                    {bid.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <p className="text-white text-sm font-medium">
                  {bid.vendorCompany || bid.vendorName}
                </p>
                <p className="text-slate-500 text-xs mt-1">{bid.description}</p>
                <p className="text-slate-600 text-xs mt-2">
                  Submitted: {bid.submittedAt ? new Date(bid.submittedAt).toLocaleDateString() : "N/A"}
                </p>
                {bid.status === "accepted" && bid.documentUrl && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    <a
                      href={bid.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      View Bid Document
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
