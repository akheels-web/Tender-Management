import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  UserCircle,
  Mail,
  Building2,
  Save,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const { user } = useAuth();
  const isVendor = user?.role === "vendor";

  const { data: profile } = trpc.vendor.myProfile.useQuery(undefined, {
    enabled: isVendor,
  });

  const utils = trpc.useUtils();
  const updateMutation = trpc.vendor.updateProfile.useMutation({
    onSuccess: () => {
      utils.vendor.myProfile.invalidate();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (isVendor) {
      updateMutation.mutate({
        companyName: (formData.get("companyName") as string) || undefined,
        contactPerson: (formData.get("contactPerson") as string) || undefined,
        phone: (formData.get("phone") as string) || undefined,
        address: (formData.get("address") as string) || undefined,
        crNumber: (formData.get("crNumber") as string) || undefined,
        vatNumber: (formData.get("vatNumber") as string) || undefined,
        occiNumber: (formData.get("occiNumber") as string) || undefined,
        website: (formData.get("website") as string) || undefined,
        description: (formData.get("description") as string) || undefined,
        yearsInBusiness: formData.get("yearsInBusiness")
          ? parseInt(formData.get("yearsInBusiness") as string)
          : undefined,
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Profile Settings</h1>
        <p className="text-slate-600 text-sm mt-1">
          Manage your account information and company details.
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-400 text-sm">Profile updated successfully!</p>
        </div>
      )}

      {/* User Info Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-slate-900 font-medium mb-4 flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-cyan-400" />
          Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-600 text-xs">Full Name</Label>
            <div className="mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm">
              {user?.name || "Not set"}
            </div>
          </div>
          <div>
            <Label className="text-slate-600 text-xs">Email</Label>
            <div className="mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              {user?.email || "Not set"}
            </div>
          </div>
          <div>
            <Label className="text-slate-600 text-xs">Role</Label>
            <div className="mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm capitalize">
              {user?.role || "User"}
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Profile Form */}
      {isVendor && (
        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <h3 className="text-slate-900 font-medium flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              Company Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  name="companyName"
                  defaultValue={profile?.profile?.companyName || ""}
                  placeholder="Your company name"
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  name="contactPerson"
                  defaultValue={profile?.profile?.contactPerson || ""}
                  placeholder="Primary contact"
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  name="phone"
                  defaultValue={profile?.profile?.phone || ""}
                  placeholder="+1-555-0000"
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label>Years in Business</Label>
                <Input
                  name="yearsInBusiness"
                  type="number"
                  defaultValue={profile?.profile?.yearsInBusiness || ""}
                  placeholder="0"
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label>CR Number</Label>
                <Input
                  name="crNumber"
                  defaultValue={profile?.profile?.crNumber || ""}
                  placeholder="Commercial Registration No."
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label>VAT Number</Label>
                <Input
                  name="vatNumber"
                  defaultValue={profile?.profile?.vatNumber || ""}
                  placeholder="VAT No."
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label>OCCI Number</Label>
                <Input
                  name="occiNumber"
                  defaultValue={profile?.profile?.occiNumber || ""}
                  placeholder="Oman Chamber of Commerce No."
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Website</Label>
                <Input
                  name="website"
                  defaultValue={profile?.profile?.website || ""}
                  placeholder="https://example.com"
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Textarea
                  name="address"
                  defaultValue={profile?.profile?.address || ""}
                  placeholder="Company address"
                  rows={2}
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Company Description</Label>
                <Textarea
                  name="description"
                  defaultValue={profile?.profile?.description || ""}
                  placeholder="Brief description of your company..."
                  rows={3}
                  className="bg-slate-50 border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 gap-2"
                disabled={updateMutation.isPending}
              >
                <Save className="w-4 h-4" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
