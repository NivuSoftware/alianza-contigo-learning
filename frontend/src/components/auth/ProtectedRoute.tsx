import { Navigate, useLocation } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useAuth, type Role } from "@/contexts/AuthContext";
import { Seo } from "@/components/seo/Seo";

const portals: Record<Role, string> = { admin: "/admin", teacher: "/profesor", student: "/app" };

export function ProtectedRoute({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const seo = (
    <Seo title="Aula virtual" description="Área privada de Alianza Contigo Educación." noindex />
  );
  if (loading)
    return (
      <main className="grid min-h-screen place-items-center bg-background">
        {seo}
        <LoaderCircle className="h-7 w-7 animate-spin text-gold" aria-label="Cargando sesión" />
      </main>
    );
  if (!user) {
    const login =
      role === "admin"
        ? "/acceso-administrativo"
        : role === "teacher"
          ? "/acceso-profesores"
          : "/login";
    return <Navigate to={login} replace state={{ from: location.pathname }} />;
  }
  if (user.role !== role) return <Navigate to={portals[user.role]} replace />;
  return (
    <>
      {seo}
      {children}
    </>
  );
}
