import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  FileText,
  Users,
  Gavel,
  Shield,
  UserCircle,
  LogOut,
  Search,
  ClipboardList,
  Lock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const adminLinks = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/tenders", label: "Tenders", icon: FileText },
    { path: "/admin/vendors", label: "Vendors", icon: Users },
    { path: "/admin/bids", label: "All Bids", icon: Gavel },
  ];

  const agentLinks = [
    { path: "/agent/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/agent/tenders", label: "Tenders", icon: FileText },
    { path: "/agent/vendors", label: "Vendors", icon: Users },
    { path: "/agent/vendor-groups", label: "Vendor Groups", icon: Users },
    { path: "/agent/bids", label: "All Bids", icon: Gavel },
  ];

  const vendorLinks = [
    { path: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/vendor/tenders", label: "Browse Tenders", icon: Search },
    { path: "/vendor/my-bids", label: "My Bids", icon: ClipboardList },
  ];

  const superadminLinks = [
    { path: "/superadmin/dashboard", label: "Superadmin Dashboard", icon: Shield },
  ];

  const getLinks = () => {
    switch (role) {
      case "admin":
        return adminLinks;
      case "agent":
        return agentLinks;
      case "vendor":
        return vendorLinks;
      case "superadmin":
        return superadminLinks;
      default:
        return [];
    }
  };

  const links = getLinks();

  const getRoleLabel = () => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "agent":
        return "Procurement Agent";
      case "vendor":
        return "Vendor Portal";
      case "superadmin":
        return "Chief Auditor";
      default:
        return "User";
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case "admin":
        return "text-[#F9A01B]";
      case "agent":
        return "text-[#F9A01B]";
      case "vendor":
        return "text-[#000097]";
      case "superadmin":
        return "text-[#000097]";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-[260px] bg-white border-r border-slate-200 flex flex-col z-50 shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100 flex flex-col items-center justify-center">
        <Link to="/" className="flex flex-col items-center gap-3">
          <img src="/nfc_logo.svg" alt="National Finance" className="h-10" />
          <div className="text-center">
            <h1 className="text-slate-800 font-semibold text-lg leading-tight mt-2">
              Tender Portal
            </h1>
            <p className={cn("text-xs font-semibold uppercase tracking-wider mt-1", getRoleColor())}>
              {getRoleLabel()}
            </p>
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-[#000097]/10 text-[#000097] border border-[#000097]/20"
                  : "text-slate-600 hover:text-[#000097] hover:bg-slate-50"
              )}
            >
              <Icon className="w-4.5 h-4.5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <Link
          to="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            isActive("/profile")
              ? "bg-[#000097]/10 text-[#000097] border border-[#000097]/20"
              : "text-slate-600 hover:text-[#000097] hover:bg-slate-50"
          )}
        >
          <UserCircle className="w-4.5 h-4.5" />
          Profile
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign Out
        </button>
      </div>
      
      {/* Footer Logo */}
      <div className="p-4 border-t border-slate-100 flex justify-center items-center">
        <span className="text-[10px] text-slate-400 mr-2">Presented by</span>
        <img src="/tct_logo.png" alt="TCT" className="h-6 opacity-70 grayscale hover:grayscale-0 transition-all" />
      </div>
    </div>
  );
}
