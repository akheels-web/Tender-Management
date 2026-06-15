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
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
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

  // Redirect to correct dashboard if on root
  if (location.pathname === "/") {
    if (isAdmin) navigate("/admin/dashboard");
    else if (isAgent) navigate("/agent/dashboard");
    else if (isVendor) navigate("/vendor/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0A1628] flex">
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
