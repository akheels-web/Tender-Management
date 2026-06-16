import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
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
import AuditorDashboard from "./pages/auditor/AuditorDashboard";
import ProfilePage from "./pages/shared/ProfilePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Dashboard Routes */}
      <Route element={<DashboardLayout />}>
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/tenders" element={<TendersPage />} />
        <Route path="/admin/vendors" element={<VendorsPage />} />
        <Route path="/admin/bids" element={<BidsPage />} />

        {/* Agent Routes */}
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
        <Route path="/agent/tenders" element={<AgentTendersPage />} />

        {/* Vendor Routes */}
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/tenders" element={<VendorTendersPage />} />
        <Route path="/vendor/my-bids" element={<MyBidsPage />} />

        {/* Auditor Routes */}
        <Route path="/auditor/dashboard" element={<AuditorDashboard />} />

        {/* Shared */}
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
