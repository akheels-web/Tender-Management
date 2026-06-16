import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function DashboardLayout() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000097]" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const userRole = user.role;
  const isAdmin = userRole === "admin";
  const isAgent = userRole === "agent";
  const isVendor = userRole === "vendor";
  const isSuperadmin = userRole === "superadmin";

  // Redirect to correct dashboard if on root
  if (location.pathname === "/") {
    if (isAdmin) navigate("/admin/dashboard");
    else if (isAgent) navigate("/agent/dashboard");
    else if (isVendor) navigate("/vendor/dashboard");
    else if (isSuperadmin) navigate("/superadmin/dashboard");
    return null;
  }

  // Prevent cross-role access
  if (location.pathname.startsWith("/admin") && !isAdmin) {
    navigate("/");
    return null;
  }
  if (location.pathname.startsWith("/agent") && !isAgent) {
    navigate("/");
    return null;
  }
  if (location.pathname.startsWith("/vendor") && !isVendor) {
    navigate("/");
    return null;
  }
  if (location.pathname.startsWith("/superadmin") && !isSuperadmin) {
    navigate("/");
    return null;
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
