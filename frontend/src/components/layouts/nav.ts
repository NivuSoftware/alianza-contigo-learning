import {
  Award,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Home,
  UserRound,
  Users,
  UserCheck,
} from "lucide-react";

export const studentNav = [
  { label: "Inicio", to: "/app", icon: Home },
  { label: "Mis cursos", to: "/app/courses", icon: BookOpen },
  { label: "Certificados", to: "/app/certificates", icon: Award },
  { label: "Perfil", to: "/app/profile", icon: UserRound },
];

export const adminNav = [
  { label: "Dashboard", to: "/admin", icon: Home },
  { label: "Cursos", to: "/admin/courses", icon: BookOpen },
  { label: "Estudiantes", to: "/admin/students", icon: Users },
  { label: "Docentes", to: "/admin/teachers", icon: UserCheck },
  { label: "Evaluaciones", to: "/admin/evaluations", icon: ClipboardCheck },
  { label: "Pagos e ingresos", to: "/admin/enrollments", icon: GraduationCap },
];

export const teacherNav = [
  { label: "Inicio", to: "/profesor", icon: Home },
  { label: "Mis cursos", to: "/profesor/cursos", icon: BookOpen },
  { label: "Estudiantes", to: "/profesor/estudiantes", icon: Users },
];
