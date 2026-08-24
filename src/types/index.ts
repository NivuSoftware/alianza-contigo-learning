export type Role = "admin" | "teacher" | "student";

export type Endorsement =
  | "Aval SENESCYT"
  | "Aval Ministerio del Trabajo"
  | "Cámara de Artesanos"
  | "MIPRO";

export type LessonType = "video" | "pdf" | "document" | "text" | "resource" | "exam";
export type LessonState = "completed" | "current" | "pending" | "locked";

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration: string;
  state: LessonState;
  description?: string;
}

export interface Module {
  id: string;
  title: string;
  subtitle: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  endorsements: Endorsement[];
  image: string;
  modality: string;
  duration: string;
  modules: Module[];
  certification: string;
  status: "Activo" | "Borrador" | "Inactivo";
  studentsCount: number;
  price: string;
}

export interface Enrollment {
  courseSlug: string;
  progress: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  status: "En progreso" | "Completado" | "Pendiente";
}

export interface Certificate {
  id: string;
  courseSlug: string;
  courseName: string;
  studentName: string;
  issuedAt: string;
  endorsement: Endorsement;
  code: string;
}

export interface Student {
  id: string;
  name: string;
  idCard: string;
  email: string;
  phone: string;
  coursesEnrolled: number;
  status: "Activo" | "Inactivo";
  registeredAt: string;
}

export type QuestionType = "single" | "multiple" | "boolean";

export interface ExamQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  correct: number[];
  score: number;
}

export interface ExamSubmission {
  id: string;
  studentName: string;
  courseName: string;
  date: string;
  status: "Pendiente de revisión" | "Revisado" | "Aprobado" | "No aprobado";
  score: number | null;
}
