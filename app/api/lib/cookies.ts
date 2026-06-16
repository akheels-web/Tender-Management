import type { CookieOptions } from "hono/utils/cookie";

function isLocalhost(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function getSessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    // Allow cookies to be set without HTTPS (since this is internal/dev or local Proxmox network).
    // Production deployments behind a real HTTPS proxy should set this to true.
    secure: false, 
  };
}
