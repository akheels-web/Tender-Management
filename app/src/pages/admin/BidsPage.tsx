import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Gavel,
  CheckCircle,
  Star,
  Clock,
  FileText,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const statusColors: Record<string, string> = {
  submitted: "bg-blue-500/10 text-blue-400",
  under_review: "bg-yellow-500/10 text-yellow-400",
  shortlisted: "bg-cyan-500/10 text-cyan-400",
  rejected: "bg-red-500/10 text-red-400",
  accepted: "bg-emerald-500/10 text-emerald-400",
  withdrawn: "bg-gray-500/10 text-gray-400",
};

export default function BidsPage() {
  const [selectedTender, setSelectedTender] = useState<number | null>(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();
  const { data: tenders } = trpc.tender.list.useQuery({});
  const { data: bids, isLoading } = trpc.bid.byTender.useQuery(
    { tenderId: selectedTender! },
    { enabled: !!selectedTender }
  );

  const updateMutation = trpc.bid.updateStatus.useMutation({
    onSuccess: () => {
      utils.bid.byTender.invalidate();
      setShowUpdate(false);
      setNewStatus("");
      setNotes("");
    },
  });

  const openUpdate = (bid: any) => {
    setSelectedBid(bid);
    setNewStatus(bid.status);
    setShowUpdate(true);
  };

  const handleUpdate = () => {
    if (!selectedBid || !newStatus) return;
    updateMutation.mutate({
      id: selectedBid.id,
      status: newStatus as any,
      notes: notes || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">All Bids</h1>
          <p className="text-slate-400 text-sm mt-1">
            View and manage bids across all tenders.
          </p>
        </div>
      </div>

      {/* Tender Selector */}
      <div className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5">
        <label className="text-sm text-slate-300 mb-2 block">
          Select a Tender to View Bids
        </label>
        <Select
          value={selectedTender?.toString() || ""}
          onValueChange={(v) => setSelectedTender(Number(v))}
        >
          <SelectTrigger className="bg-[#0A1628] border-white/10 text-white w-full max-w-lg">
            <SelectValue placeholder="Choose a tender..." />
          </SelectTrigger>
          <SelectContent className="bg-[#111C2E] border-white/10 max-h-[300px]">
            {tenders?.map((t) => (
              <SelectItem key={t.id} value={t.id.toString()}>
                <span className="font-mono text-xs text-slate-500 mr-2">
                  {t.tenderId}
                </span>
                {t.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bids List */}
      {selectedTender && (
        <>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
            </div>
          ) : (
            <>
              {bids?.length === 0 && (
                <div className="text-center py-12 bg-[#111C2E] rounded-xl border border-white/[0.06]">
                  <Gavel className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No bids for this tender</p>
                </div>
              )}
              <div className="space-y-3">
                {bids?.map((bid) => (
                  <div
                    key={bid.id}
                    className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5 hover:border-cyan-500/20 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-full font-medium",
                              statusColors[bid.status] || ""
                            )}
                          >
                            {bid.status.replace("_", " ").toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-500">
                            {bid.vendorCompany || bid.vendorName}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm mb-2">
                          {bid.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            Bid Amount: ${Number(bid.bidAmount).toLocaleString()}
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
                      <div className="flex items-center gap-1 ml-4">
                        <button
                          onClick={() => openUpdate(bid)}
                          className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                          title="Update Status"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Update Status Dialog */}
      <Dialog open={showUpdate} onOpenChange={setShowUpdate}>
        <DialogContent className="bg-[#111C2E] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
              Update Bid Status
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-slate-400 text-sm">
              Update status for bid from{" "}
              <span className="text-white font-medium">
                {selectedBid?.vendorCompany || selectedBid?.vendorName}
              </span>
            </p>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="bg-[#0A1628] border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111C2E] border-white/10">
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Notes</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
                className="bg-[#0A1628] border-white/10"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowUpdate(false)} className="text-slate-400">
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
                disabled={!newStatus || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
