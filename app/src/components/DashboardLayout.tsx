import { Outlet, useLocation, Navigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function DashboardLayout() {
  const { user, isLoading } = useAuth();

  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000097]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role;
  const isAdmin = userRole === "admin";
  const isAgent = userRole === "agent";
  const isVendor = userRole === "vendor";
  const isSuperadmin = userRole === "superadmin";

  // Redirect to correct dashboard if on root
  if (location.pathname === "/") {
    if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
    if (isAgent) return <Navigate to="/agent/dashboard" replace />;
    if (isVendor) return <Navigate to="/vendor/dashboard" replace />;
    if (isSuperadmin) return <Navigate to="/superadmin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  // Prevent cross-role access
  if (location.pathname.startsWith("/admin") && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  if (location.pathname.startsWith("/agent") && !isAgent) {
    return <Navigate to="/" replace />;
  }
  if (location.pathname.startsWith("/vendor") && !isVendor) {
    return <Navigate to="/" replace />;
  }
  if (location.pathname.startsWith("/superadmin") && !isSuperadmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar role={userRole as string} />
      <div className="flex-1 flex flex-col ml-[260px]">
        <TopBar user={user} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
