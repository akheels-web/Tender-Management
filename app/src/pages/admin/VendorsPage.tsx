import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Ban,
  Mail,
  Phone,
  Building2,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const [showBar, setShowBar] = useState(false);
  const [showActivate, setShowActivate] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [barReason, setBarReason] = useState("");
  const [selectedTenderId, setSelectedTenderId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: vendors, isLoading } = trpc.vendor.list.useQuery({ search: search || undefined });
  const { data: tenders } = trpc.tender.list.useQuery({});

  const deactivateMutation = trpc.vendor.deactivate.useMutation({
    onSuccess: () => {
      utils.vendor.list.invalidate();
      setShowActivate(false);
    },
  });

  const activateMutation = trpc.vendor.activate.useMutation({
    onSuccess: () => {
      utils.vendor.list.invalidate();
      setShowActivate(false);
    },
  });

  const barMutation = trpc.tender.barVendor.useMutation({
    onSuccess: () => {
      utils.vendor.list.invalidate();
      setShowBar(false);
      setBarReason("");
      setSelectedTenderId(null);
    },
  });

  const createMutation = trpc.vendor.create.useMutation({
    onSuccess: () => {
      utils.vendor.list.invalidate();
      setShowCreate(false);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      companyName: formData.get("companyName") as string,
    });
  };

  const openBar = (vendor: any) => {
    setSelectedVendor(vendor);
    setShowBar(true);
  };

  const openActivate = (vendor: any) => {
    setSelectedVendor(vendor);
    setShowActivate(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Vendors</h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage vendor accounts, activate/deactivate, and bar from tenders.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Vendor
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#111C2E] border-slate-200 text-slate-900 placeholder:text-slate-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {vendors?.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-[#111C2E] rounded-xl border border-white/[0.06]">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600">No vendors found</p>
            </div>
          )}
          {vendors?.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-5 hover:border-cyan-500/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-900 font-medium">
                    {(vendor.name || "V")[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-medium">{vendor.name}</h3>
                    <p className="text-slate-500 text-xs">{vendor.companyName || "No company"}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full font-medium",
                    vendor.isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  )}
                >
                  {vendor.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{vendor.email}</span>
                </div>
                {vendor.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{vendor.phone}</span>
                  </div>
                )}
                {vendor.contactPerson && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Contact: {vendor.contactPerson}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.04]">
                {vendor.isActive ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openActivate(vendor)}
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-1.5"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => activateMutation.mutate({ id: vendor.id })}
                    className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Activate
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openBar(vendor)}
                  className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Bar from Tender
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bar Vendor Dialog */}
      <Dialog open={showBar} onOpenChange={setShowBar}>
        <DialogContent className="bg-[#111C2E] border-slate-200 text-slate-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-amber-400" />
              Bar Vendor from Tender
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-slate-600 text-sm">
              Bar <span className="text-slate-900 font-medium">{selectedVendor?.name}</span> from participating in a specific tender.
            </p>
            <div className="space-y-2">
              <label className="text-sm text-slate-700">Select Tender</label>
              <select
                value={selectedTenderId || ""}
                onChange={(e) => setSelectedTenderId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm"
              >
                <option value="">Select a tender</option>
                {tenders?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tenderId} - {t.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-700">Reason (optional)</label>
              <Input
                value={barReason}
                onChange={(e) => setBarReason(e.target.value)}
                placeholder="Reason for barring"
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowBar(false)} className="text-slate-600">
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedTenderId &&
                  barMutation.mutate({
                    vendorId: selectedVendor?.id,
                    tenderId: selectedTenderId,
                    reason: barReason || undefined,
                  })
                }
                className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                disabled={!selectedTenderId || barMutation.isPending}
              >
                {barMutation.isPending ? "Barring..." : "Bar Vendor"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={showActivate} onOpenChange={setShowActivate}>
        <DialogContent className="bg-[#111C2E] border-slate-200 text-slate-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Deactivate Vendor
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-slate-600 text-sm">
              Are you sure you want to deactivate{" "}
              <span className="text-slate-900 font-medium">{selectedVendor?.name}</span>?
              They will no longer be able to participate in tenders.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowActivate(false)} className="text-slate-600">
                Cancel
              </Button>
              <Button
                onClick={() => deactivateMutation.mutate({ id: selectedVendor?.id })}
                className="bg-red-500 hover:bg-red-600 text-slate-900"
                disabled={deactivateMutation.isPending}
              >
                {deactivateMutation.isPending ? "Deactivating..." : "Deactivate"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Vendor Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#111C2E] border-slate-200 text-slate-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              Register New Vendor
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-700">Full Name</label>
              <Input
                name="name"
                required
                placeholder="Vendor Representative Name"
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-700">Email Address</label>
              <Input
                name="email"
                type="email"
                required
                placeholder="vendor@company.com"
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-700">Company Name</label>
              <Input
                name="companyName"
                required
                placeholder="Company Ltd."
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-700">Initial Password</label>
              <Input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Min 6 characters"
                className="bg-slate-50 border-slate-200"
              />
            </div>
            {createMutation.error && (
              <div className="text-red-400 text-sm mt-2">
                {createMutation.error.message}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)} className="text-slate-600">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-900"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Vendor"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
