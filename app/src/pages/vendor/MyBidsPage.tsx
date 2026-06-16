import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Gavel,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  submitted: "bg-blue-500/10 text-blue-400",
  under_review: "bg-yellow-500/10 text-yellow-400",
  shortlisted: "bg-cyan-500/10 text-cyan-400",
  rejected: "bg-red-500/10 text-red-400",
  accepted: "bg-emerald-500/10 text-emerald-400",
  withdrawn: "bg-gray-500/10 text-gray-400",
};

const statusIcons: Record<string, React.ReactNode> = {
  submitted: <Clock className="w-4 h-4" />,
  under_review: <Star className="w-4 h-4" />,
  shortlisted: <CheckCircle className="w-4 h-4" />,
  rejected: <XCircle className="w-4 h-4" />,
  accepted: <CheckCircle className="w-4 h-4" />,
  withdrawn: <XCircle className="w-4 h-4" />,
};

export default function MyBidsPage() {
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const utils = trpc.useUtils();
  const { data: bids, isLoading } = trpc.bid.myBids.useQuery();

  const withdrawMutation = trpc.bid.withdraw.useMutation({
    onSuccess: () => {
      utils.bid.myBids.invalidate();
      setShowDetail(false);
    },
  });

  const openDetail = (bid: any) => {
    setSelectedBid(bid);
    setShowDetail(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My Bids</h1>
          <p className="text-slate-600 text-sm mt-1">
            Track all your submitted bids and their status.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {bids?.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <Gavel className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600 mb-3">No bids submitted yet</p>
              <Button
                asChild
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-900"
              >
                <a href="/vendor/tenders">Browse Tenders</a>
              </Button>
            </div>
          )}
          {bids?.map((bid) => (
            <div
              key={bid.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-cyan-500/50 hover:shadow-sm transition-all duration-300 cursor-pointer"
              onClick={() => openDetail(bid)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5",
                        statusColors[bid.status] || ""
                      )}
                    >
                      {statusIcons[bid.status]}
                      {bid.status.replace("_", " ").toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500">
                      {bid.tenderRefId}
                    </span>
                  </div>
                  <h3 className="text-slate-900 font-medium mb-1">
                    {bid.tenderTitle}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                    {bid.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      ${Number(bid.bidAmount).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {bid.submittedAt
                        ? new Date(bid.submittedAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                    {bid.technicalScore && (
                      <span className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5" />
                        Technical: {bid.technicalScore}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <FileText className="w-5 h-5 text-slate-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bid Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-cyan-400" />
              Bid Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5",
                  statusColors[selectedBid?.status] || ""
                )}
              >
                {statusIcons[selectedBid?.status]}
                {selectedBid?.status?.replace("_", " ").toUpperCase()}
              </span>
            </div>

            <div>
              <p className="text-slate-500 text-xs mb-1">Tender</p>
              <p className="text-slate-900 font-medium">{selectedBid?.tenderTitle}</p>
              <p className="text-slate-500 text-xs font-mono mt-0.5">
                {selectedBid?.tenderRefId}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-500 text-xs mb-1">Description</p>
              <p className="text-slate-700 text-sm">
                {selectedBid?.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Bid Amount</p>
                <p className="text-slate-900 font-mono text-lg">
                  ${Number(selectedBid?.bidAmount).toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Submitted</p>
                <p className="text-slate-900">
                  {selectedBid?.submittedAt
                    ? new Date(selectedBid.submittedAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              {selectedBid?.technicalScore && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Technical Score</p>
                  <p className="text-slate-900 font-mono">
                    {selectedBid.technicalScore}
                  </p>
                </div>
              )}
              {selectedBid?.financialScore && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Financial Score</p>
                  <p className="text-slate-900 font-mono">
                    {selectedBid.financialScore}
                  </p>
                </div>
              )}
            </div>

            {selectedBid?.documentUrl && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Proposal Document</p>
                <a
                  href={selectedBid.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  {selectedBid.documentName || "View PDF"}
                </a>
              </div>
            )}

            {selectedBid?.notes && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Admin Notes</p>
                <p className="text-slate-700 text-sm">{selectedBid.notes}</p>
              </div>
            )}

            {selectedBid?.status === "submitted" && (
              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    selectedBid &&
                    withdrawMutation.mutate({ id: selectedBid.id })
                  }
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                  disabled={withdrawMutation.isPending}
                >
                  {withdrawMutation.isPending ? "Withdrawing..." : "Withdraw Bid"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
