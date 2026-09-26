import type { User, UserProfile } from "../types";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
interface ApiErrorResponse { message?: string }

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...options?.headers } });
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try { const data = await response.json() as ApiErrorResponse; if (data.message) message = data.message; } catch { /* Keep default status message. */ }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}
export const api = {
  health: () => apiFetch<{ success: boolean; message: string }>("/health"),
  auth: {
    status: () => apiFetch<{ ready: boolean; googleConfigured: boolean; databaseConfigured: boolean }>("/auth/status"),
    me: () => apiFetch<{ user: User }>("/auth/me"),
    logout: () => apiFetch<{ success: boolean }>("/auth/logout", { method: "POST" }),
  },
  profile: {
    save: (profile: UserProfile) => apiFetch<{ success: boolean }>("/profile", { method: "PUT", body: JSON.stringify(profile) }),
  },
};
export const authUrl = `${API_BASE_URL}/auth/google`;
