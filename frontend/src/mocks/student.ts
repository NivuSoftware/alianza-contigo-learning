import type { Certificate, Enrollment, ExamQuestion, ExamSubmission, Student } from "@/types";

export const currentStudent = {
  id: "s1",
  firstName: "Andrea",
  name: "Andrea Pérez",
  email: "andrea.perez@email.com",
  phone: "+593 99 812 4470",
  idCard: "1723456789",
  initials: "AP",
  role: "student" as const,
};

export const enrollments: Enrollment[] = [
  {
    courseSlug: "gestor-empresarial",
    progress: 65,
    lessonsCompleted: 8,
    lessonsTotal: 12,
    status: "En progreso",
  },
  {
    courseSlug: "agente-inmobiliario",
    progress: 30,
    lessonsCompleted: 4,
    lessonsTotal: 12,
    status: "En progreso",
  },
  {
    courseSlug: "administracion-de-empresas",
    progress: 100,
    lessonsCompleted: 12,
    lessonsTotal: 12,
    status: "Completado",
  },
  {
    courseSlug: "visitador-medico",
    progress: 0,
    lessonsCompleted: 0,
    lessonsTotal: 12,
    status: "Pendiente",
  },
];

export const certificates: Certificate[] = [
  {
    id: "cert-1",
    courseSlug: "administracion-de-empresas",
    courseName: "Administración de Empresas",
    studentName: "Andrea Pérez",
    issuedAt: "12 de agosto de 2026",
    endorsement: "Aval SENESCYT",
    code: "AC-2026-ADM-004871",
  },
];

export const studentStats = [
  { label: "Programas activos", value: "2" },
  { label: "Programas completados", value: "1" },
  { label: "Certificados", value: "1" },
  { label: "Horas de formación", value: "34 h" },
];

export const notifications = [
  { id: "n1", text: "Nueva lección disponible en Gestor Empresarial", time: "hace 2 h" },
  { id: "n2", text: "Tu certificado de Administración de Empresas está listo", time: "ayer" },
  { id: "n3", text: "Recordatorio: evaluación final disponible pronto", time: "hace 3 días" },
];

export const students: Student[] = [
  {
    id: "s1",
    name: "Andrea Pérez",
    idCard: "1723456789",
    email: "andrea.perez@email.com",
    phone: "+593 99 812 4470",
    coursesEnrolled: 4,
    status: "Activo",
    registeredAt: "02/06/2026",
  },
  {
    id: "s2",
    name: "Juan Gómez",
    idCard: "0912345678",
    email: "juan.gomez@email.com",
    phone: "+593 98 445 1120",
    coursesEnrolled: 2,
    status: "Activo",
    registeredAt: "14/06/2026",
  },
  {
    id: "s3",
    name: "María Andrade",
    idCard: "1104567823",
    email: "maria.andrade@email.com",
    phone: "+593 96 220 8845",
    coursesEnrolled: 3,
    status: "Activo",
    registeredAt: "27/06/2026",
  },
  {
    id: "s4",
    name: "Carlos Villacís",
    idCard: "1712349087",
    email: "carlos.villacis@email.com",
    phone: "+593 99 110 3345",
    coursesEnrolled: 1,
    status: "Inactivo",
    registeredAt: "03/07/2026",
  },
  {
    id: "s5",
    name: "Paola Zambrano",
    idCard: "1309876541",
    email: "paola.zambrano@email.com",
    phone: "+593 98 776 2210",
    coursesEnrolled: 2,
    status: "Activo",
    registeredAt: "18/07/2026",
  },
  {
    id: "s6",
    name: "Diego Salazar",
    idCard: "0602233441",
    email: "diego.salazar@email.com",
    phone: "+593 97 553 9981",
    coursesEnrolled: 1,
    status: "Activo",
    registeredAt: "29/07/2026",
  },
];

export const teachers = [
  {
    id: "t1",
    name: "Ing. Ricardo Ponce",
    area: "Gestión Empresarial",
    courses: 2,
    status: "Activo",
  },
  { id: "t2", name: "Msc. Elena Cabrera", area: "Administración", courses: 1, status: "Activo" },
  { id: "t3", name: "Dr. Fabián Ruiz", area: "Ciencias de la Salud", courses: 1, status: "Activo" },
  {
    id: "t4",
    name: "Arq. Lucía Ortega",
    area: "Sector Inmobiliario",
    courses: 1,
    status: "Inactivo",
  },
];

export const examSubmissions: ExamSubmission[] = [
  {
    id: "e1",
    studentName: "Andrea Pérez",
    courseName: "Gestor Empresarial",
    date: "20 agosto 2026",
    status: "Pendiente de revisión",
    score: null,
  },
  {
    id: "e2",
    studentName: "Juan Gómez",
    courseName: "Agente Inmobiliario",
    date: "19 agosto 2026",
    status: "Revisado",
    score: 78,
  },
  {
    id: "e3",
    studentName: "María Andrade",
    courseName: "Administración de Empresas",
    date: "18 agosto 2026",
    status: "Aprobado",
    score: 92,
  },
  {
    id: "e4",
    studentName: "Carlos Villacís",
    courseName: "Visitador Médico",
    date: "16 agosto 2026",
    status: "No aprobado",
    score: 54,
  },
  {
    id: "e5",
    studentName: "Paola Zambrano",
    courseName: "Gestor Empresarial",
    date: "15 agosto 2026",
    status: "Pendiente de revisión",
    score: null,
  },
];

const questionBank: Omit<ExamQuestion, "id">[] = [
  {
    text: "¿Cuál de las siguientes es una función clásica del proceso administrativo?",
    type: "single",
    options: ["Planificación", "Depreciación", "Facturación electrónica", "Auditoría externa"],
    correct: [0],
    score: 5,
  },
  {
    text: "Selecciona los elementos que forman parte de una planificación estratégica.",
    type: "multiple",
    options: ["Misión y visión", "Objetivos medibles", "Color corporativo", "Análisis FODA"],
    correct: [0, 1, 3],
    score: 5,
  },
  {
    text: "La gestión empresarial busca articular procesos, personas y reProgramas.",
    type: "boolean",
    options: ["Verdadero", "Falso"],
    correct: [0],
    score: 5,
  },
  {
    text: "¿Qué indicador mide la eficiencia en el uso de reProgramas?",
    type: "single",
    options: [
      "Productividad",
      "Rotación de personal",
      "Cuota de mercado",
      "Índice de clima laboral",
    ],
    correct: [0],
    score: 5,
  },
];

export const examQuestions: ExamQuestion[] = Array.from({ length: 20 }, (_, i) => {
  const base = questionBank[i % questionBank.length]!;
  return { ...base, id: `q${i + 1}` };
});

export const enrollmentsAdmin = [
  {
    id: "i1",
    student: "Andrea Pérez",
    course: "Gestor Empresarial",
    date: "02/07/2026",
    status: "Activa",
  },
  {
    id: "i2",
    student: "Juan Gómez",
    course: "Agente Inmobiliario",
    date: "08/07/2026",
    status: "Activa",
  },
  {
    id: "i3",
    student: "María Andrade",
    course: "Administración de Empresas",
    date: "11/07/2026",
    status: "Finalizada",
  },
  {
    id: "i4",
    student: "Diego Salazar",
    course: "Visitador Médico",
    date: "21/07/2026",
    status: "Pendiente de pago",
  },
];

export const adminStats = [
  { label: "Estudiantes registrados", value: "487", trend: "+12% este mes" },
  { label: "Programas activos", value: "5", trend: "Sin cambios" },
  { label: "Inscripciones", value: "624", trend: "+8% este mes" },
  { label: "Certificados emitidos", value: "312", trend: "+21 este mes" },
];

export const enrollmentsByMonth = [
  { month: "Ene", inscripciones: 38 },
  { month: "Feb", inscripciones: 45 },
  { month: "Mar", inscripciones: 52 },
  { month: "Abr", inscripciones: 47 },
  { month: "May", inscripciones: 63 },
  { month: "Jun", inscripciones: 71 },
  { month: "Jul", inscripciones: 84 },
  { month: "Ago", inscripciones: 96 },
];

export const studentsByCourse = [
  { course: "Gestor Emp.", estudiantes: 164 },
  { course: "Admin. Emp.", estudiantes: 138 },
  { course: "Inmobiliario", estudiantes: 121 },
  { course: "Visitador", estudiantes: 108 },
  { course: "Artesano", estudiantes: 93 },
];

export const recentActivity = [
  { id: "a1", text: "Andrea Pérez completó Gestor Empresarial.", time: "hace 25 min" },
  { id: "a2", text: "Juan Gómez presentó una evaluación.", time: "hace 1 h" },
  { id: "a3", text: "María Andrade obtuvo un certificado.", time: "hace 3 h" },
  { id: "a4", text: "Diego Salazar se inscribió en Visitador Médico.", time: "ayer" },
];
