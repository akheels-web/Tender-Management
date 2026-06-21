import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import DashboardLayout from "./components/DashboardLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TendersPage from "./pages/admin/TendersPage";
import VendorsPage from "./pages/admin/VendorsPage";
import BidsPage from "./pages/admin/BidsPage";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentTendersPage from "./pages/agent/AgentTendersPage";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorTendersPage from "./pages/vendor/VendorTendersPage";
import MyBidsPage from "./pages/vendor/MyBidsPage";
import VendorGroupsPage from "./pages/agent/VendorGroupsPage";
import SuperadminDashboard from "./pages/superadmin/SuperadminDashboard";
import SuperadminUsersPage from "./pages/superadmin/SuperadminUsersPage";
import SuperadminTendersPage from "./pages/superadmin/SuperadminTendersPage";
import ProfilePage from "./pages/shared/ProfilePage";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Dashboard Routes */}
      <Route element={<DashboardLayout />}>
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/tenders" element={<TendersPage />} />
        <Route path="/admin/vendors" element={<VendorsPage />} />
        <Route path="/admin/bids" element={<BidsPage />} />

        {/* Agent Routes */}
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
        <Route path="/agent/tenders" element={<ErrorBoundary><AgentTendersPage /></ErrorBoundary>} />
        <Route path="/agent/vendors" element={<VendorsPage />} />
        <Route path="/agent/vendor-groups" element={<VendorGroupsPage />} />
        <Route path="/agent/bids" element={<BidsPage />} />

        {/* Vendor Routes */}
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/tenders" element={<ErrorBoundary><VendorTendersPage /></ErrorBoundary>} />
        <Route path="/vendor/my-bids" element={<MyBidsPage />} />

        {/* Superadmin Routes */}
        <Route path="/superadmin/dashboard" element={<SuperadminDashboard />} />
        <Route path="/superadmin/users" element={<SuperadminUsersPage />} />
        <Route path="/superadmin/tenders" element={<SuperadminTendersPage />} />

        {/* Shared */}
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
