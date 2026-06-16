import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function VendorGroupsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: groups, isLoading } = trpc.vendorGroup.getAll.useQuery();
  const { data: vendors } = trpc.vendor.list.useQuery();
  const { data: groupMembers, isLoading: isLoadingMembers } = trpc.vendorGroup.getGroupVendors.useQuery(
    { groupId: selectedGroup?.id },
    { enabled: !!selectedGroup && showMembers }
  );

  const createMutation = trpc.vendorGroup.create.useMutation({
    onSuccess: () => {
      utils.vendorGroup.getAll.invalidate();
      setShowCreate(false);
    },
  });

  const assignMutation = trpc.vendorGroup.addVendor.useMutation({
    onSuccess: () => {
      // Could invalidate a specific group members query if we had one
      setShowAssign(false);
      alert("Vendor assigned successfully!");
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    });
  };

  const handleAssign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const vendorId = parseInt(formData.get("vendorId") as string);
    if (!vendorId || !selectedGroup) return;
    
    assignMutation.mutate({
      groupId: selectedGroup.id,
      vendorId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Vendor Groups</h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage vendor categories for targeted tender notifications.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-slate-900"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups?.map((group) => (
            <div
              key={group.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-medium">{group.name}</h3>
                    <p className="text-xs text-slate-500">ID: {group.id}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-slate-600 mb-4 h-10 line-clamp-2">
                {group.description || "No description provided."}
              </p>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <div className="flex w-full gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowMembers(true);
                    }}
                    className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex-1"
                  >
                    View Members
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowAssign(true);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Vendor
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {groups?.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-slate-200 rounded-xl">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No Groups Found</h3>
              <p className="text-slate-600 text-sm">Create a vendor group to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-white border-slate-200 text-slate-900">
          <DialogHeader>
            <DialogTitle>Create Vendor Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-700">Group Name</label>
              <Input
                name="name"
                required
                placeholder="e.g. IT Vendors"
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-700">Description</label>
              <Input
                name="description"
                placeholder="Hardware and software suppliers"
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-900"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Vendor Dialog */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent className="bg-white border-slate-200 text-slate-900">
          <DialogHeader>
            <DialogTitle>Add Vendor to {selectedGroup?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssign} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-700">Select Vendor</label>
              <select
                name="vendorId"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-md h-10 px-3 text-slate-900"
              >
                <option value="">-- Choose Vendor --</option>
                {vendors?.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.email})</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowAssign(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-900"
                disabled={assignMutation.isPending}
              >
                {assignMutation.isPending ? "Adding..." : "Add Vendor"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Members Dialog */}
      <Dialog open={showMembers} onOpenChange={setShowMembers}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedGroup?.name} Members</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            {isLoadingMembers ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400" />
              </div>
            ) : groupMembers && groupMembers.length > 0 ? (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {groupMembers.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-medium text-xs">
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No members in this group yet.</p>
              </div>
            )}
            <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
              <Button variant="ghost" onClick={() => setShowMembers(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
