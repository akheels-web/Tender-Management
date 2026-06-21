import { useLocation } from "react-router";
import { Bell } from "lucide-react";
import type { User } from "@db/schema";
import { cn } from "@/lib/utils";

interface TopBarProps {
  user: User;
}

export default function TopBar({ user }: TopBarProps) {
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes("/admin/dashboard")) return { main: "Dashboard", sub: "Overview" };
    if (path.includes("/admin/tenders")) return { main: "Tenders", sub: "Management" };
    if (path.includes("/admin/vendors")) return { main: "Vendors", sub: "Directory" };
    if (path.includes("/admin/bids")) return { main: "Bids", sub: "All Proposals" };
    if (path.includes("/agent/dashboard")) return { main: "Dashboard", sub: "Overview" };
    if (path.includes("/agent/tenders")) return { main: "Tenders", sub: "Locked View" };
    if (path.includes("/vendor/dashboard")) return { main: "Dashboard", sub: "Overview" };
    if (path.includes("/vendor/tenders")) return { main: "Tenders", sub: "Browse" };
    if (path.includes("/vendor/my-bids")) return { main: "My Bids", sub: "History" };
    if (path.includes("/profile")) return { main: "Profile", sub: "Settings" };
    return { main: "Dashboard", sub: "Overview" };
  };

  const breadcrumb = getBreadcrumb();
  const roleColor = user.role === "superadmin" ? "bg-purple-500/10 text-purple-600" : user.role === "admin" || user.role === "agent" ? "bg-[#F9A01B]/10 text-[#F9A01B]" : "bg-[#000097]/10 text-[#000097]";
  const roleLabel = user.role === "superadmin" ? "Chief Auditor" : user.role === "admin" ? "Administrator" : user.role === "agent" ? "Agent" : "Vendor";

  return (
    <header className="h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <span className="text-slate-500 text-sm">{breadcrumb.main}</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 text-sm font-medium">{breadcrumb.sub}</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F9A01B] rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm text-slate-900 font-medium">
              {user.name || "User"}
            </p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#000097] to-[#000066] flex items-center justify-center text-white text-sm font-medium">
            {(user.name || "U")[0].toUpperCase()}
          </div>
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", roleColor)}>
            {roleLabel}
          </span>
        </div>
      </div>
    </header>
  );
}
