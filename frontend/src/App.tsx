import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Landing } from "@/routes/index";
import { CoursesPage } from "@/routes/courses.index";
import { CourseDetail } from "@/routes/courses.$slug";
import { AboutPage, ContactPage } from "@/pages/PublicInfoPages";
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from "@/pages/AuthPages";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Seo } from "@/components/seo/Seo";
import { TeacherDashboard, TeacherSection } from "@/pages/TeacherPages";
import { TeacherManagementPage } from "@/pages/TeacherManagementPage";
import { TeacherCoursePage } from "@/pages/TeacherCoursePage";
import { PaymentOrdersPage } from "@/pages/PaymentOrdersPage";
import { PayphoneResultPage } from "@/pages/PayphoneResultPage";
import { RealCertificatesPage } from "@/pages/RealCertificatesPage";
import { FinalExamPage } from "@/pages/FinalExamPage";
import {
  RealClassroomPage,
  RealMyCoursesPage,
  RealProfilePage,
  RealStudentDashboard,
} from "@/pages/RealStudentPages";
import { AdminDashboard } from "@/pages/AdminPages";
import { AdminEvaluationsPage } from "@/pages/AdminEvaluationsPage";
import { TrainingAreasPage } from "@/pages/TrainingAreasPage";
import { RealStudentDetail, RealStudentsPage } from "@/pages/RealAdminStudentsPage";
import {
  CourseAdminList,
  CourseContentBuilder,
  CourseDataForm,
} from "@/pages/CourseManagementPages";

export function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:slug" element={<CourseDetail />} />
      <Route path="/nosotros" element={<AboutPage />} />
      <Route path="/contacto" element={<ContactPage />} />
      <Route
        path="/pagar"
        element={
          <>
            <Seo
              title="Resultado del pago"
              description="Confirmación de pago de inscripción."
              noindex
            />
            <PayphoneResultPage />
          </>
        }
      />
      <Route
        path="/login"
        element={
          <>
            <Seo
              title="Aula virtual: iniciar sesión"
              description="Ingresa al aula virtual de Alianza Contigo Educación para continuar tus cursos en línea, rendir evaluaciones y descargar tus certificados."
            />
            <LoginPage />
          </>
        }
      />
      <Route
        path="/register"
        element={
          <>
            <Seo
              title="Crear cuenta de estudiante"
              description="Regístrate gratis en Alianza Contigo Educación y accede a programas de educación continua y cursos en línea con certificado en Ecuador."
            />
            <RegisterPage />
          </>
        }
      />
      <Route
        path="/olvide-mi-contrasena"
        element={
          <>
            <Seo
              title="Recuperar contraseña"
              description="Recupera el acceso a tu cuenta."
              noindex
            />
            <ForgotPasswordPage />
          </>
        }
      />
      <Route
        path="/restablecer-contrasena"
        element={
          <>
            <Seo
              title="Restablecer contraseña"
              description="Define una nueva contraseña."
              noindex
            />
            <ResetPasswordPage />
          </>
        }
      />
      <Route
        path="/acceso-administrativo"
        element={
          <>
            <Seo title="Acceso administrativo" description="Acceso restringido." noindex />
            <LoginPage role="admin" />
          </>
        }
      />
      <Route
        path="/acceso-profesores"
        element={
          <>
            <Seo title="Portal de profesores" description="Acceso restringido." noindex />
            <LoginPage role="teacher" />
          </>
        }
      />

      <Route
        path="/app"
        element={
          <ProtectedRoute role="student">
            <RealStudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/courses"
        element={
          <ProtectedRoute role="student">
            <RealMyCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/classroom/:slug"
        element={
          <ProtectedRoute role="student">
            <RealClassroomPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/exam/:slug"
        element={
          <ProtectedRoute role="student">
            <FinalExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/certificates"
        element={
          <ProtectedRoute role="student">
            <RealCertificatesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/profile"
        element={
          <ProtectedRoute role="student">
            <RealProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute role="admin">
            <CourseAdminList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/new"
        element={
          <ProtectedRoute role="admin">
            <CourseDataForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:slug/edit"
        element={
          <ProtectedRoute role="admin">
            <CourseDataForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:slug/content"
        element={
          <ProtectedRoute role="admin">
            <CourseContentBuilder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/training-areas"
        element={
          <ProtectedRoute role="admin">
            <TrainingAreasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute role="admin">
            <RealStudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students/:id"
        element={
          <ProtectedRoute role="admin">
            <RealStudentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers"
        element={
          <ProtectedRoute role="admin">
            <TeacherManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/evaluations"
        element={
          <ProtectedRoute role="admin">
            <AdminEvaluationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/enrollments"
        element={
          <ProtectedRoute role="admin">
            <PaymentOrdersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profesor"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profesor/Programas"
        element={
          <ProtectedRoute role="teacher">
            <CourseAdminList teacher />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profesor/Programas/:slug"
        element={
          <ProtectedRoute role="teacher">
            <TeacherCoursePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profesor/estudiantes"
        element={
          <ProtectedRoute role="teacher">
            <TeacherSection type="students" />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
            <Seo
              title="Página no encontrada"
              description="La página solicitada no existe."
              noindex
            />
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
