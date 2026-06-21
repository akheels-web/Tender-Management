import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Search, Lock, Eye, FileText, Calendar, Gavel } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-400",
  published: "bg-blue-500/10 text-blue-400",
  open: "bg-emerald-500/10 text-emerald-400",
  closed: "bg-red-500/10 text-red-400",
  awarded: "bg-cyan-500/10 text-cyan-400",
  cancelled: "bg-orange-500/10 text-orange-400",
};

export default function SuperadminTendersPage() {
  const [search, setSearch] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedTender, setSelectedTender] = useState<any>(null);

  const { data: tenders, isLoading } = trpc.superadmin.getTenders.useQuery();

  const { data: bidsResponse, isLoading: isLoadingBids } = trpc.superadmin.getTenderBids.useQuery(
    { tenderId: selectedTender?.id },
    { enabled: !!selectedTender?.id }
  );

  const filteredTenders = tenders?.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.tenderId.toLowerCase().includes(search.toLowerCase())
  );

  const openDetail = (tender: any) => {
    setSelectedTender(tender);
    setShowDetail(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tenders Overview</h1>
          <p className="text-slate-600 text-sm mt-1">
            Read-only audit view of all non-draft tenders in the system.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by Tender ID or Title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Tender List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTenders?.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600">No tenders found</p>
            </div>
          )}
          {filteredTenders?.map((tender) => (
            <div
              key={tender.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-purple-500/50 hover:shadow-sm transition-all duration-300 group"
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
                      {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
                    </span>
                    {tender.isLocked && !tender.firstUnlockBy && (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    )}
                    {tender.isLocked && tender.firstUnlockBy && (
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Pending 2nd Admin
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-mono">
                      {tender.tenderId}
                    </span>
                  </div>
                  <h3 className="text-slate-900 font-medium text-lg mb-1">
                    {tender.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                    {tender.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Closes: {tender.closingDate ? new Date(tender.closingDate).toLocaleDateString() : "N/A"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Opens: {tender.openingDate ? new Date(tender.openingDate).toLocaleDateString() : "N/A"}
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
                    className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-500/10 rounded-lg transition-all"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTender?.title}</DialogTitle>
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
            <p className="text-slate-700 text-sm">{selectedTender?.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Category</p>
                <p className="text-slate-900">{selectedTender?.category}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Opening Date</p>
                <p className="text-slate-900">
                  {selectedTender?.openingDate ? new Date(selectedTender.openingDate).toLocaleString() : "Not set"}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Closing Date</p>
                <p className="text-slate-900">
                  {selectedTender?.closingDate
                    ? new Date(selectedTender.closingDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Location</p>
                <p className="text-slate-900">{selectedTender?.location || "N/A"}</p>
              </div>
            </div>
            {selectedTender?.documentUrl && (
              <div className="mb-2">
                <a 
                  href={selectedTender.documentUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-purple-600 hover:text-purple-500 text-sm flex items-center gap-1 inline-flex font-medium"
                >
                  <FileText className="w-4 h-4" />
                  View Tender Document (Superadmin Bypass)
                </a>
              </div>
            )}

            <div className="mt-6 border-t border-slate-100 pt-6">
              <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Gavel className="w-4 h-4 text-purple-500" />
                Submitted Bids ({bidsResponse?.count || 0})
              </h4>
              
              {isLoadingBids ? (
                <div className="text-center py-4 text-slate-500 text-sm">Loading bids...</div>
              ) : bidsResponse?.count === 0 ? (
                <div className="text-center py-4 text-slate-500 text-sm">No bids have been submitted yet.</div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {bidsResponse?.bids.map((bid: any) => (
                    <div key={bid.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-900 text-sm">{bid.vendorName}</span>
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase",
                          statusColors[bid.status] || "bg-slate-200 text-slate-600"
                        )}>
                          {bid.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mb-3 flex flex-wrap gap-4">
                        <span>Amount: <strong className="text-slate-900">{Number(bid.bidAmount).toLocaleString()} OMR</strong></span>
                        <span>Submitted: {new Date(bid.submittedAt!).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex gap-3">
                        {bid.quotationDocumentUrl && (
                          <a
                            href={bid.quotationDocumentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-500 text-xs font-medium"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Quotation
                          </a>
                        )}
                        {bid.technicalDocumentUrl && (
                          <a
                            href={bid.technicalDocumentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-500 text-xs font-medium"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Technical
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
