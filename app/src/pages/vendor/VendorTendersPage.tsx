import { useState, useRef } from "react";
import { trpc } from "@/providers/trpc";
import {
  Search,
  FileText,
  Calendar,
  Gavel,
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
  const [showDetail, setShowDetail] = useState(false);
  const [selectedTender, setSelectedTender] = useState<any>(null);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const quotationInputRef = useRef<HTMLInputElement>(null);
  const technicalInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: tenders, isLoading } = trpc.tender.list.useQuery({
    search: search || undefined,
    status: statusFilter && statusFilter !== "all" ? statusFilter : undefined,
  });

  const placeBidMutation = trpc.bid.place.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        setShowBid(false);
        setBidSuccess(true);
        utils.bid.myBids.invalidate();
        setTimeout(() => setBidSuccess(false), 3000);
      } else {
        alert(result.message || "Failed to place bid");
      }
    },
    onError: (err) => {
      alert(err.message || "An error occurred during submission");
    }
  });


  const handlePlaceBid = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTender) return;
    const form = e.currentTarget;
    const formData = new FormData(form);

    let quotationDocumentUrl = undefined;
    let quotationDocumentName = undefined;
    let technicalDocumentUrl = undefined;
    let technicalDocumentName = undefined;

    const qFile = quotationInputRef.current?.files?.[0];
    const tFile = technicalInputRef.current?.files?.[0];

    const uploadFile = async (file: File) => {
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed.");
        return null;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("File exceeds 10 MB limit.");
        return null;
      }
      const uploadData = new FormData();
      uploadData.append("file", file);
      
      try {
        const res = await fetch("/api/files", {
          method: "POST",
          body: uploadData,
        });
        const data = await res.json();
        if (data.success) {
          return { url: data.url, name: data.fileName };
        } else {
          alert(data.message || "File upload failed.");
        }
      } catch (err) {
        console.error(err);
        alert("File upload error occurred.");
      }
      return null;
    };

    setIsUploading(true);
    
    if (qFile) {
      const result = await uploadFile(qFile);
      if (result) {
        quotationDocumentUrl = result.url;
        quotationDocumentName = result.name;
      } else {
        setIsUploading(false);
        return;
      }
    }

    if (tFile) {
      const result = await uploadFile(tFile);
      if (result) {
        technicalDocumentUrl = result.url;
        technicalDocumentName = result.name;
      } else {
        setIsUploading(false);
        return;
      }
    }
    
    setIsUploading(false);

    placeBidMutation.mutate({
      tenderId: selectedTender.id,
      bidAmount: formData.get("bidAmount") as string,
      currency: "OMR",
      description: (formData.get("description") as string) || undefined,
      quotationDocumentUrl,
      quotationDocumentName,
      technicalDocumentUrl,
      technicalDocumentName,
    });
  };

  const openBid = (tender: any) => {
    setSelectedTender(tender);
    setShowBid(true);
  };


  const openDetail = (tender: any) => {
    setSelectedTender(tender);
    setShowDetail(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Browse Tenders</h1>
          <p className="text-slate-600 text-sm mt-1">
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
            className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-white border-slate-200 text-slate-900">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200">
            <SelectItem value="all">All</SelectItem>
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
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600">No tenders found</p>
            </div>
          )}
          {tenders?.map((tender) => (
            <div
              key={tender.id}
              className={cn(
                "bg-white border rounded-xl p-5 transition-all duration-300",
                tender.isLocked
                  ? "border-amber-500/20 hover:border-amber-500/40"
                  : "border-slate-200 hover:border-cyan-500/50 hover:shadow-sm"
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
                      {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
                    </span>
                    {new Date().getTime() - new Date(tender.createdAt).getTime() < 3 * 24 * 60 * 60 * 1000 && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-purple-500 text-white animate-pulse">
                        NEW
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
                    className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                    title="View Details"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  {tender.status === "open" && (!tender.closingDate || new Date(tender.closingDate) >= new Date()) ? (
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
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Place Bid Dialog */}
      <Dialog open={showBid} onOpenChange={setShowBid}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-emerald-400" />
              Place Bid
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-slate-600 text-sm">
              Submit your bid for: <span className="text-slate-900 font-medium">{selectedTender?.title}</span>
            </p>
            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-700">Bid Amount (OMR)</label>
                <Input
                  name="bidAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-700">Description / Proposal Summary</label>
                <Textarea
                  name="description"
                  placeholder="Describe your approach and qualifications..."
                  required
                  rows={3}
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-700">Quotation Document (PDF)</label>
                <Input
                  type="file"
                  accept=".pdf"
                  ref={quotationInputRef}
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-700">Technical Document (PDF)</label>
                <Input
                  type="file"
                  accept=".pdf"
                  ref={technicalInputRef}
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowBid(false)} className="text-slate-600">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-900"
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
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg">
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
            <p className="text-slate-700 text-sm">{selectedTender?.description}</p>
            {selectedTender?.documentUrl && (
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
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-500 text-xs mb-1">Eligibility Criteria</p>
                <p className="text-slate-700 text-sm">{selectedTender.eligibilityCriteria}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Category</p>
                <p className="text-slate-900">{selectedTender?.category}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Opening Date</p>
                <p className="text-slate-900">{selectedTender?.openingDate ? new Date(selectedTender.openingDate).toLocaleString() : "Not set"}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Closing Date</p>
                <p className="text-slate-900">{selectedTender?.closingDate ? new Date(selectedTender.closingDate).toLocaleString() : "N/A"}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Location</p>
                <p className="text-slate-900">{selectedTender?.location || "N/A"}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
