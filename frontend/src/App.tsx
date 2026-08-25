import { Route, Routes } from "react-router-dom";
import { Landing } from "@/routes/index";
import { CoursesPage } from "@/routes/courses.index";
import { CourseDetail } from "@/routes/courses.$slug";
import { AboutPage, ContactPage } from "@/pages/PublicInfoPages";
import { LoginPage, RegisterPage } from "@/pages/AuthPages";
import {
  CertificatesPage,
  ClassroomPage,
  ExamPage,
  ExamResultPage,
  MyCoursesPage,
  ProfilePage,
  StudentDashboard,
} from "@/pages/StudentPages";
import {
  AdminCourses,
  AdminDashboard,
  CourseContent,
  CourseForm,
  EnrollmentsPage,
  EvaluationBuilder,
  EvaluationReview,
  EvaluationsPage,
  GenericAdminPage,
  StudentDetail,
  StudentsPage,
} from "@/pages/AdminPages";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:slug" element={<CourseDetail />} />
      <Route path="/nosotros" element={<AboutPage />} />
      <Route path="/contacto" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/app" element={<StudentDashboard />} />
      <Route path="/app/courses" element={<MyCoursesPage />} />
      <Route path="/app/classroom/:slug" element={<ClassroomPage />} />
      <Route path="/app/exam/:slug" element={<ExamPage />} />
      <Route path="/app/exam/:slug/result" element={<ExamResultPage />} />
      <Route path="/app/certificates" element={<CertificatesPage />} />
      <Route path="/app/profile" element={<ProfilePage />} />

      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/courses" element={<AdminCourses />} />
      <Route path="/admin/courses/new" element={<CourseForm />} />
      <Route path="/admin/courses/:slug/edit" element={<CourseForm />} />
      <Route path="/admin/courses/:slug/content" element={<CourseContent />} />
      <Route path="/admin/courses/:slug/evaluation" element={<EvaluationBuilder />} />
      <Route path="/admin/students" element={<StudentsPage />} />
      <Route path="/admin/students/:id" element={<StudentDetail />} />
      <Route path="/admin/teachers" element={<GenericAdminPage type="teachers" />} />
      <Route path="/admin/evaluations" element={<EvaluationsPage />} />
      <Route path="/admin/evaluations/:id" element={<EvaluationReview />} />
      <Route path="/admin/certificates" element={<GenericAdminPage type="certificates" />} />
      <Route path="/admin/enrollments" element={<EnrollmentsPage />} />
      <Route path="/admin/settings" element={<GenericAdminPage type="settings" />} />

      <Route
        path="*"
        element={
          <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
            <div>
              <p className="font-display text-7xl font-semibold text-navy">404</p>
              <h1 className="mt-4 text-xl font-semibold text-navy">Página no encontrada</h1>
              <a href="/" className="mt-6 inline-block text-sm font-semibold text-gold">
                Volver al inicio
              </a>
            </div>
          </main>
        }
      />
    </Routes>
  );
}
