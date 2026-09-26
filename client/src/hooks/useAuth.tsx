import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, UserProfile } from "../types";
import { api } from "../services/api";

interface AuthContextValue { user: User | null; loading: boolean; refreshUser: () => Promise<User | null>; signOut: () => Promise<void>; updateProfile: (profile: UserProfile) => void; }
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshUser = useCallback(async () => {
    try { const response = await api.auth.me(); setUser(response.user); return response.user; }
    catch { setUser(null); return null; }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refreshUser(); }, [refreshUser]);
  const signOut = useCallback(async () => { try { await api.auth.logout(); } finally { setUser(null); } }, []);
  const updateProfile = useCallback((profile: UserProfile) => setUser((current) => current ? { ...current, profile } : current), []);
  return <AuthContext.Provider value={{ user, loading, refreshUser, signOut, updateProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used inside AuthProvider"); return context; }
