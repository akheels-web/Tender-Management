import { useState, useRef } from "react";
import { trpc } from "@/providers/trpc";
import {
  Search,
  FileText,
  Calendar,
  DollarSign,
  Lock,
  Unlock,
  Gavel,
  AlertTriangle,
  CheckCircle,
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
import { Textarea } from "@/components/ui/textarea";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-400",
  published: "bg-blue-500/10 text-blue-400",
  open: "bg-emerald-500/10 text-emerald-400",
  closed: "bg-red-500/10 text-red-400",
  awarded: "bg-cyan-500/10 text-cyan-400",
  cancelled: "bg-orange-500/10 text-orange-400",
};

export default function VendorTendersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const [showBid, setShowBid] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedTender, setSelectedTender] = useState<any>(null);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [bidSuccess, setBidSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: tenders, isLoading } = trpc.tender.list.useQuery({
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const placeBidMutation = trpc.bid.place.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        setShowBid(false);
        setBidSuccess(true);
        utils.bid.myBids.invalidate();
        setTimeout(() => setBidSuccess(false), 3000);
      }
    },
  });

  const unlockMutation = trpc.tender.unlock.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        setShowUnlock(false);
        setUnlockPassword("");
        setUnlockError("");
        // Refresh to show unlocked tender
        utils.tender.list.invalidate();
      } else {
        setUnlockError(result.message || "Incorrect password");
      }
    },
  });

  const handlePlaceBid = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTender) return;
    const form = e.currentTarget;
    const formData = new FormData(form);

    let documentUrl = undefined;
    let documentName = undefined;

    const file = fileInputRef.current?.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed.");
        return;
      }
      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.append("file", file);
      
      try {
        const res = await fetch("/api/files", {
          method: "POST",
          body: uploadData,
        });
        const data = await res.json();
        if (data.success) {
          documentUrl = data.url;
          documentName = data.fileName;
        } else {
          alert("File upload failed");
          setIsUploading(false);
          return;
        }
      } catch (err) {
        console.error(err);
        alert("File upload failed");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    placeBidMutation.mutate({
      tenderId: selectedTender.id,
      bidAmount: formData.get("bidAmount") as string,
      description: formData.get("description") as string,
      documentUrl,
      documentName,
    });
  };

  const openBid = (tender: any) => {
    setSelectedTender(tender);
    setShowBid(true);
  };

  const openUnlock = (tender: any) => {
    setSelectedTender(tender);
    setUnlockPassword("");
    setUnlockError("");
    setShowUnlock(true);
  };

  const openDetail = (tender: any) => {
    setSelectedTender(tender);
    setShowDetail(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Browse Tenders</h1>
          <p className="text-slate-400 text-sm mt-1">
            Find open tenders and place your bids.
          </p>
        </div>
      </div>

      {/* Success Toast */}
      {bidSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-400 text-sm">Bid placed successfully!</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by Tender ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#111C2E] border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-[#111C2E] border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#111C2E] border-white/10">
            <SelectItem value="">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="awarded">Awarded</SelectItem>
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
          {tenders?.length === 0 && (
            <div className="text-center py-12 bg-[#111C2E] rounded-xl border border-white/[0.06]">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No tenders found</p>
            </div>
          )}
          {tenders?.map((tender) => (
            <div
              key={tender.id}
              className={cn(
                "bg-[#111C2E] border rounded-xl p-5 transition-all duration-300",
                tender.isLocked
                  ? "border-amber-500/20 hover:border-amber-500/40"
                  : "border-white/[0.06] hover:border-cyan-500/20"
              )}
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
                    {tender.isLocked && (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-mono">
                      {tender.tenderId}
                    </span>
                  </div>
                  <h3 className="text-white font-medium text-lg mb-1">
                    {tender.title}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-3">
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
                    className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                    title="View Details"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  {tender.isLocked ? (
                    <button
                      onClick={() => openUnlock(tender)}
                      className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all"
                      title="Unlock to Bid"
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  ) : (
                    tender.status === "open" && (!tender.closingDate || new Date(tender.closingDate) >= new Date()) ? (
                      <button
                        onClick={() => openBid(tender)}
                        className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all"
                        title="Place Bid"
                      >
                        <Gavel className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        Closed
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unlock Dialog */}
      <Dialog open={showUnlock} onOpenChange={setShowUnlock}>
        <DialogContent className="bg-[#111C2E] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-amber-400" />
              Unlock Tender
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Lock className="w-4 h-4" />
                <span className="font-medium text-sm">Password Required</span>
              </div>
              <p className="text-slate-400 text-sm">
                Contact the administrator to get the unlock password for this tender.
              </p>
            </div>
            {unlockError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {unlockError}
              </div>
            )}
            <Input
              type="password"
              placeholder="Enter unlock password"
              value={unlockPassword}
              onChange={(e) => setUnlockPassword(e.target.value)}
              className="bg-[#0A1628] border-white/10"
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowUnlock(false)} className="text-slate-400">
                Cancel
              </Button>
              <Button
                onClick={() =>
                  unlockMutation.mutate({
                    id: selectedTender?.id,
                    password: unlockPassword,
                  })
                }
                className="bg-amber-500 hover:bg-amber-600 text-white"
                disabled={!unlockPassword || unlockMutation.isPending}
              >
                {unlockMutation.isPending ? "Unlocking..." : "Unlock"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Place Bid Dialog */}
      <Dialog open={showBid} onOpenChange={setShowBid}>
        <DialogContent className="bg-[#111C2E] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-emerald-400" />
              Place Bid
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-slate-400 text-sm">
              Submit your bid for: <span className="text-white font-medium">{selectedTender?.title}</span>
            </p>
            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Bid Amount ($)</label>
                <Input
                  name="bidAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                  className="bg-[#0A1628] border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Description / Proposal Summary</label>
                <Textarea
                  name="description"
                  placeholder="Describe your approach and qualifications..."
                  required
                  rows={3}
                  className="bg-[#0A1628] border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Bid Proposal (PDF)</label>
                <Input
                  type="file"
                  accept=".pdf"
                  ref={fileInputRef}
                  className="bg-[#0A1628] border-white/10"
                />
                <p className="text-xs text-slate-500">Upload your proposal PDF</p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowBid(false)} className="text-slate-400">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  disabled={placeBidMutation.isPending || isUploading}
                >
                  {placeBidMutation.isPending || isUploading ? "Submitting..." : "Submit Bid"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="bg-[#111C2E] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedTender?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-3">
              <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", statusColors[selectedTender?.status] || "")}>
                {selectedTender?.status?.toUpperCase()}
              </span>
              <span className="text-xs text-slate-500 font-mono">{selectedTender?.tenderId}</span>
            </div>
            <p className="text-slate-300 text-sm">{selectedTender?.description}</p>
            {selectedTender?.documentUrl && !selectedTender.isLocked && (
              <div className="mb-2">
                <a 
                  href={selectedTender.documentUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 inline-flex"
                >
                  <FileText className="w-4 h-4" />
                  View Tender Document
                </a>
              </div>
            )}
            {selectedTender?.eligibilityCriteria && (
              <div className="bg-[#0A1628] rounded-lg p-4">
                <p className="text-slate-500 text-xs mb-1">Eligibility Criteria</p>
                <p className="text-slate-300 text-sm">{selectedTender.eligibilityCriteria}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-[#0A1628] rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Category</p>
                <p className="text-white">{selectedTender?.category}</p>
              </div>
              <div className="bg-[#0A1628] rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Budget</p>
                <p className="text-white font-mono">${Number(selectedTender?.budgetEstimate).toLocaleString()}</p>
              </div>
              <div className="bg-[#0A1628] rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Closing Date</p>
                <p className="text-white">{selectedTender?.closingDate ? new Date(selectedTender.closingDate).toLocaleDateString() : "N/A"}</p>
              </div>
              <div className="bg-[#0A1628] rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Location</p>
                <p className="text-white">{selectedTender?.location || "N/A"}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
