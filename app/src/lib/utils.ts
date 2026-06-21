import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatActionName = (action: string) => {
  if (!action) return "";
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const handleDownloadLogs = (logs: any[], filename: string) => {
  if (!logs || logs.length === 0) return;
  
  const headers = ["ID", "Timestamp", "Actor", "Action", "Entity Type", "Entity ID", "Details"];
  const csvRows = [headers.join(",")];
  
  logs.forEach((log) => {
    const row = [
      log.id,
      new Date(log.createdAt).toISOString(),
      log.user ? `${log.user.name} (${log.user.email})` : "System",
      formatActionName(log.action),
      log.entityType || "",
      log.entityId || "",
      `"${(log.details || "").replace(/"/g, '""')}"`
    ];
    csvRows.push(row.join(","));
  });
  
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
