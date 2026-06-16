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
      case "auditor":
        return "Chief Auditor";
      default:
        return "User";
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case "admin":
        return "text-cyan-400";
      case "agent":
        return "text-yellow-400";
      case "vendor":
        return "text-green-400";
      case "auditor":
        return "text-purple-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-[260px] bg-[#0E1925] border-r border-white/5 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg leading-tight">
              ProTender
            </h1>
            <p className={cn("text-xs font-medium", getRoleColor())}>
              {getRoleLabel()}
            </p>
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
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
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <Icon className="w-4.5 h-4.5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <Link
          to="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            isActive("/profile")
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          )}
        >
          <UserCircle className="w-4.5 h-4.5" />
          Profile
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
