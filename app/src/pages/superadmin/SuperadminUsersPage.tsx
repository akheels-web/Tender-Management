import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Plus, Edit, Trash2, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SuperadminUsersPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.superadmin.getUsers.useQuery();

  const createMutation = trpc.superadmin.createUser.useMutation({
    onSuccess: () => {
      utils.superadmin.getUsers.invalidate();
      setShowCreate(false);
    },
    onError: (err) => alert(err.message),
  });

  const updateMutation = trpc.superadmin.updateUser.useMutation({
    onSuccess: () => {
      utils.superadmin.getUsers.invalidate();
      setShowEdit(false);
    },
    onError: (err) => alert(err.message),
  });

  const deleteMutation = trpc.superadmin.deleteUser.useMutation({
    onSuccess: () => {
      utils.superadmin.getUsers.invalidate();
      setShowDelete(false);
    },
    onError: (err) => alert(err.message),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as "admin" | "agent",
      password: formData.get("password") as string,
    });
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: selectedUser.id,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as "admin" | "agent",
      password: (formData.get("password") as string) || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage system administrators and procurement agents.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-[#000097] hover:bg-[#000066] text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Create User
        </Button>
      </div>

      {/* Users List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : users?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users?.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">{user.name}</td>
                    <td className="py-3 px-4 text-slate-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1",
                        user.role === "admin" ? "bg-[#F9A01B]/10 text-[#F9A01B]" : "bg-blue-500/10 text-blue-600"
                      )}>
                        {user.role === "admin" ? <Shield className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                        {user.role === "admin" ? "Administrator" : "Agent"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(user.createdAt!).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEdit(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDelete(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input name="name" required className="bg-slate-50 border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" name="email" required className="bg-slate-50 border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select name="role" defaultValue="agent">
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" name="password" required minLength={6} className="bg-slate-50 border-slate-200" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-[#000097] text-white hover:bg-[#000066]">
                {createMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input name="name" defaultValue={selectedUser?.name} required className="bg-slate-50 border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" name="email" defaultValue={selectedUser?.email} required className="bg-slate-50 border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select name="role" defaultValue={selectedUser?.role}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>New Password (Optional)</Label>
              <Input type="password" name="password" minLength={6} placeholder="Leave blank to keep current" className="bg-slate-50 border-slate-200" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowEdit(false)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending} className="bg-[#000097] text-white hover:bg-[#000066]">
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-slate-600">
              Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowDelete(false)}>Cancel</Button>
              <Button onClick={() => deleteMutation.mutate({ id: selectedUser?.id })} disabled={deleteMutation.isPending} className="bg-red-500 hover:bg-red-600 text-white">
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
