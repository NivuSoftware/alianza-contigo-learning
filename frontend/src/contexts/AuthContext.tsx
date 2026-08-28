import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";

export type Role = "admin" | "teacher" | "student";
export interface AuthUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  phone?: string;
  nationalId?: string;
  avatarKey?: "navy" | "gold" | "emerald" | "plum";
}
interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, role?: Role) => Promise<AuthUser>;
  register: (data: Record<string, string>) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    avatarKey: AuthUser["avatarKey"];
  }) => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<{ user: AuthUser }>("/auth/me")
      .catch(() => api<{ user: AuthUser }>("/auth/refresh", { method: "POST" }))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  const login = useCallback(async (email: string, password: string, role?: Role) => {
    const data = await api<{ user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });
    setUser(data.user);
    return data.user;
  }, []);
  const register = useCallback(async (payload: Record<string, string>) => {
    const data = await api<{ user: AuthUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    return data.user;
  }, []);
  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
  }, []);
  const updateProfile = useCallback(
    async (payload: {
      firstName: string;
      lastName: string;
      phone: string;
      avatarKey: AuthUser["avatarKey"];
    }) => {
      const data = await api<{ user: AuthUser }>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setUser(data.user);
      return data.user;
    },
    [],
  );
  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile }),
    [user, loading, login, register, logout, updateProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
