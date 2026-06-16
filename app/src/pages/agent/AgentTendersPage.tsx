import { useState, useRef } from "react";
import { trpc } from "@/providers/trpc";
import {
  Plus,
  Search,
  Lock,
  Unlock,
  Eye,
  Edit,
  Trash2,
  FileText,
  Calendar,
  DollarSign,
  X,
  AlertTriangle,
  Shield,
  Download,
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
import { Label } from "@/components/ui/label";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-400",
  published: "bg-blue-500/10 text-blue-400",
  open: "bg-emerald-500/10 text-emerald-400",
  closed: "bg-red-500/10 text-red-400",
  awarded: "bg-cyan-500/10 text-cyan-400",
  cancelled: "bg-orange-500/10 text-orange-400",
};

export default function TendersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedTender, setSelectedTender] = useState<any>(null);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlockError, setUnlockError] = useState("");

  const utils = trpc.useUtils();
  const { data: tenders, isLoading } = trpc.tender.list.useQuery(
    { search: search || undefined, status: statusFilter || undefined },
    { enabled: !showDelete && !showUnlock }
  );
  const { data: vendorGroups } = trpc.vendorGroup.getAll.useQuery();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const createMutation = trpc.tender.create.useMutation({
    onSuccess: () => {
      utils.tender.list.invalidate();
      setShowCreate(false);
    },
  });

  const updateMutation = trpc.tender.update.useMutation({
    onSuccess: () => {
      utils.tender.list.invalidate();
      setShowEdit(false);
    },
  });

  const deleteMutation = trpc.tender.delete.useMutation({
    onSuccess: () => {
      utils.tender.list.invalidate();
      setShowDelete(false);
    },
  });

  const unlockMutation = trpc.tender.unlock.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        utils.tender.list.invalidate();
        setShowUnlock(false);
        setUnlockPassword("");
        setUnlockError("");
      } else {
        setUnlockError(result.message || "Incorrect password");
      }
    },
  });

  const lockMutation = trpc.tender.lock.useMutation({
    onSuccess: () => utils.tender.list.invalidate(),
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

    createMutation.mutate({
      tenderId: formData.get("tenderId") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      status: (formData.get("status") as any) || "draft",
      budgetEstimate: (formData.get("budgetEstimate") as string) || undefined,
      currency: "USD",
      location: (formData.get("location") as string) || undefined,
      department: (formData.get("department") as string) || undefined,
      publishDate: (formData.get("publishDate") as string) || undefined,
      closingDate: formData.get("closingDate") as string,
      openingDate: (formData.get("openingDate") as string) || undefined,
      contractPeriod: (formData.get("contractPeriod") as string) || undefined,
      vendorGroupId: parseInt(formData.get("vendorGroupId") as string) || undefined,
      isLocked: true,
      unlockPassword: (formData.get("unlockPassword") as string) || undefined,
      lockReason: (formData.get("lockReason") as string) || undefined,
      documentUrl,
      documentName,
    });
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTender) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    updateMutation.mutate({
      id: selectedTender.id,
      title: (formData.get("title") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      category: (formData.get("category") as string) || undefined,
      status: (formData.get("status") as any) || undefined,
      budgetEstimate: (formData.get("budgetEstimate") as string) || undefined,
      location: (formData.get("location") as string) || undefined,
      closingDate: (formData.get("closingDate") as string) || undefined,
    });
  };

  const openEdit = (tender: any) => {
    setSelectedTender(tender);
    setShowEdit(true);
  };

  const openDetail = (tender: any) => {
    setSelectedTender(tender);
    setShowDetail(true);
  };

  const openUnlock = (tender: any) => {
    setSelectedTender(tender);
    setUnlockPassword("");
    setUnlockError("");
    setShowUnlock(true);
  };

  const openDelete = (tender: any) => {
    setSelectedTender(tender);
    setShowDelete(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tenders</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage all tenders, create new ones, and control access.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Tender
        </Button>
      </div>

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
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-[#111C2E] border-white/10">
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="awarded">Awarded</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        {statusFilter && (
          <Button
            variant="ghost"
            onClick={() => setStatusFilter("")}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
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
              className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5 hover:border-cyan-500/20 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium",
                        statusColors[tender.status] || "bg-gray-500/10 text-gray-400"
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
                    {(tender.agentDownloadCount ?? 0) > 0 && (
                      <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <Download className="w-3.5 h-3.5" />
                        Downloaded by Agent {tender.agentDownloadCount} time(s)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => openDetail(tender)}
                    className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEdit(tender)}
                    className="p-2 text-slate-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {tender.isLocked ? (
                    <button
                      onClick={() => openUnlock(tender)}
                      className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                      title="Unlock"
                    >
                      <Unlock className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => lockMutation.mutate({ id: tender.id })}
                      className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                      title="Lock"
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => openDelete(tender)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#111C2E] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              Create New Tender
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tender ID</Label>
                <Input name="tenderId" placeholder="TDR-2026-XXX" required className="bg-[#0A1628] border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input name="category" placeholder="e.g. Infrastructure" required className="bg-[#0A1628] border-white/10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input name="title" placeholder="Project title" required className="bg-[#0A1628] border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea name="description" placeholder="Detailed description" required rows={3} className="bg-[#0A1628] border-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget Estimate ($)</Label>
                <Input name="budgetEstimate" type="number" step="0.01" placeholder="0.00" className="bg-[#0A1628] border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Location</label>
                <Input name="location" className="bg-[#0A1628] border-white/10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Vendor Group</label>
                <select name="vendorGroupId" className="w-full bg-[#0A1628] border border-white/10 rounded-md h-10 px-3 text-white">
                  <option value="">-- None --</option>
                  {vendorGroups?.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">Select a group to notify them upon publish.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Closing Date *</label>
                <Input type="date" name="closingDate" required className="bg-[#0A1628] border-white/10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tender Document (PDF)</Label>
              <Input type="file" accept=".pdf" ref={fileInputRef} className="bg-[#0A1628] border-white/10" />
            </div>
            <div className="border border-cyan-500/20 rounded-lg p-4 space-y-3 bg-cyan-500/5">
              <div className="flex items-center gap-2 text-cyan-400">
                <Shield className="w-4 h-4" />
                <span className="font-medium text-sm">Auto-Lock Settings</span>
              </div>
              <div className="space-y-2">
                <Label>Unlock Password</Label>
                <Input name="unlockPassword" type="password" placeholder="Set password for tender access" className="bg-[#0A1628] border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Lock Reason</Label>
                <Input name="lockReason" placeholder="Why is this tender locked?" className="bg-[#0A1628] border-white/10" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)} className="text-slate-400">
                Cancel
              </Button>
              <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white" disabled={createMutation.isPending || isUploading}>
                {createMutation.isPending || isUploading ? "Creating..." : "Create Tender"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="bg-[#111C2E] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-yellow-400" />
              Edit Tender
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input name="title" defaultValue={selectedTender?.title} required className="bg-[#0A1628] border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea name="description" defaultValue={selectedTender?.description} required rows={3} className="bg-[#0A1628] border-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={selectedTender?.status}>
                  <SelectTrigger className="bg-[#0A1628] border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111C2E] border-white/10">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="awarded">Awarded</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Budget Estimate ($)</Label>
                <Input name="budgetEstimate" type="number" step="0.01" defaultValue={selectedTender?.budgetEstimate ?? ""} className="bg-[#0A1628] border-white/10" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowEdit(false)} className="text-slate-400">
                Cancel
              </Button>
              <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="bg-[#111C2E] border-white/10 text-white max-w-2xl">
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
            <p className="text-slate-300 text-sm">{selectedTender?.description}</p>
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
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-[#0A1628] rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Category</p>
                <p className="text-white">{selectedTender?.category}</p>
              </div>
              <div className="bg-[#0A1628] rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Budget</p>
                <p className="text-white font-mono">
                  ${Number(selectedTender?.budgetEstimate).toLocaleString()}
                </p>
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
                <p className="text-slate-500 text-xs mb-1">Location</p>
                <p className="text-white">{selectedTender?.location || "N/A"}</p>
              </div>
            </div>
            {selectedTender?.isLocked && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <Lock className="w-4 h-4" />
                  <span className="font-medium text-sm">Tender is Locked</span>
                </div>
                <p className="text-slate-400 text-sm">
                  {selectedTender?.lockReason || "No reason provided"}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Unlock Dialog */}
      <Dialog open={showUnlock} onOpenChange={setShowUnlock}>
        <DialogContent className="bg-[#111C2E] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-emerald-400" />
              Unlock Tender
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-slate-400 text-sm">
              This tender is password-protected. Enter the admin password to
              unlock it.
            </p>
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
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={!unlockPassword || unlockMutation.isPending}
              >
                {unlockMutation.isPending ? "Unlocking..." : "Unlock"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="bg-[#111C2E] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Delete Tender
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-slate-400 text-sm">
              Are you sure you want to delete{" "}
              <span className="text-white font-medium">
                {selectedTender?.title}
              </span>
              ? This action cannot be undone and will also delete all associated
              bids.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowDelete(false)} className="text-slate-400">
                Cancel
              </Button>
              <Button
                onClick={() => deleteMutation.mutate({ id: selectedTender?.id })}
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
