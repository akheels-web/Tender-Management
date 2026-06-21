import { useState } from "react";
import { useLocation } from "react-router";
import { Bell, Check, ExternalLink } from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { User } from "@db/schema";
import { cn } from "@/lib/utils";

interface TopBarProps {
  user: User;
}

export default function TopBar({ user }: TopBarProps) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: notifications, refetch: refetchNotifications } = trpc.notification.getUnread.useQuery(undefined, {
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => refetchNotifications(),
  });

  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => refetchNotifications(),
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate({ id });
  };

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
        <div className="relative">
          <button 
            className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-4.5 h-4.5" />
            {notifications && notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F9A01B] rounded-full" />
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                {notifications && notifications.length > 0 && (
                  <button 
                    onClick={() => markAllAsReadMutation.mutate()}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {(!notifications || notifications.length === 0) ? (
                  <div className="p-4 text-center text-slate-500 text-sm">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-medium text-slate-900 pr-2">{notif.title}</h4>
                        <button 
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-slate-400 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{notif.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                        {notif.link && (
                          <a href={notif.link} className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium">
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
