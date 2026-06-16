import type { CookieOptions } from "hono/utils/cookie";

function isLocalhost(headers: Headers): boolean {
  const host = headers.get("host") || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

export function getSessionCookieOptions(headers: Headers): CookieOptions {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    // Allow cookies to be set without HTTPS (since this is internal/dev or local Proxmox network).
    // Production deployments behind a real HTTPS proxy should set this to true.
    secure: false, 
  };
}
