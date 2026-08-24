# Alianza Contigo Learn

Prompt para Lovable — Plataforma E-Learning Alianza Contigo

Diseña y construye el prototipo frontend completo de una plataforma E-Learning/LMS llamada “Alianza Contigo – Educación Continua”.

La plataforma debe transmitir una imagen profesional, educativa, moderna, confiable y premium, orientada a estudiantes adultos que buscan capacitación profesional y certificaciones con aval institucional.

1. Identidad visual

Utiliza el logo proporcionado de Alianza Contigo – Educación Continua como elemento principal de branding.

Paleta de colores

Extraer visualmente los colores principales del logo y utilizar aproximadamente:

Azul marino profundo: #071C3A

Azul institucional: #0E315C

Dorado principal: #C89432

Dorado claro: #D9AE55

Blanco: #FFFFFF

Fondo claro: #F7F8FA

Gris texto secundario: #667085

El azul marino debe transmitir confianza y profesionalismo.

El dorado debe utilizarse principalmente para:

botones principales;

iconos destacados;

bordes;

indicadores de progreso;

badges;

detalles visuales;

llamados a la acción.

No abusar del dorado.

La interfaz debe tener bastante espacio en blanco.

2. Estilo visual

Quiero un diseño:

moderno;

elegante;

corporativo;

educativo;

minimalista;

intuitivo;

responsive;

visualmente similar a plataformas educativas premium.

Evitar una apariencia infantil o excesivamente colorida.

Utilizar:

cards modernas;

bordes redondeados de 10-14 px;

sombras suaves;

iconografía consistente;

animaciones sutiles;

microinteracciones;

estados hover;

skeleton loaders;

barras de progreso;

badges institucionales.

Tipografía recomendada:

Inter

Poppins

Usar títulos con bastante jerarquía visual.

3. Arquitectura de la plataforma

La plataforma tendrá tres roles principales:

Administrador

Docente

Estudiante

La navegación y permisos deben adaptarse de acuerdo con cada rol.

Por ahora desarrollar un frontend/prototipo funcional con información ficticia, dejando la arquitectura preparada para conectar posteriormente una API/backend real.

Utilizar componentes reutilizables y una estructura modular.

No crear todo en un único archivo.

Separar correctamente:

layouts;

pages;

components;

hooks;

services;

types;

utils;

mocks.

4. Landing / portal público

Crear una página pública moderna para presentar la oferta académica.

Header

Debe contener:

Logo Alianza Contigo

Menú:

Inicio

Cursos

Nosotros

Certificaciones

Contáctanos

A la derecha:

Iniciar sesión

Botón dorado: “Ver cursos”

Header sticky al hacer scroll.

5. Hero principal

Crear un hero elegante.

Título:

Impulsa tu futuro profesional

Subtítulo:

Programas de educación continua diseñados para ayudarte a aprender, crecer y trascender.

CTA principal:

Explorar cursos

CTA secundario:

Conoce nuestras certificaciones

Incluir visualmente una fotografía profesional relacionada con capacitación empresarial, educación continua o estudiantes adultos.

Agregar debajo indicadores como:

Formación profesional

Certificaciones con aval

Aprende a tu ritmo

6. Sección de cursos destacados

Título:

Programas que impulsan tu crecimiento

Mostrar los siguientes cursos:

Gestor Empresarial

Badge:

Aval SENESCYT

Descripción corta:

Desarrolla competencias para gestionar organizaciones, procesos administrativos y estrategias empresariales.

Administración de Empresas

Badge:

Aval SENESCYT

Descripción corta:

Fortalece tus conocimientos en planificación, administración, organización y gestión empresarial.

Agente Inmobiliario

Badge:

Aval SENESCYT

Descripción corta:

Prepárate profesionalmente para desarrollar actividades dentro del sector inmobiliario.

Visitador Médico

Badge:

Aval Ministerio del Trabajo

Descripción corta:

Obtén conocimientos comerciales, farmacológicos y comunicacionales para desarrollarte profesionalmente en el sector.

Certificación como Artesano

Badges:

Cámara de Artesanos

MIPRO

Descripción:

Obtén formación y orientación para alcanzar tu certificación como artesano.

Cada card debe mostrar:

imagen;

nombre;

organismo que avala;

pequeña descripción;

modalidad;

duración ficticia;

botón “Ver programa”.

NO inventar valores monetarios reales.

Usar un placeholder como:

Consultar valor

o permitir configurar el precio posteriormente.

7. Página de detalle de curso

Ruta ejemplo:

/courses/gestor-empresarial

Debe incluir:

Header del curso

Nombre.

Badge del aval.

Descripción.

Imagen.

Información resumida:

modalidad;

duración;

número de módulos;

certificación.

CTA:

Inscribirme

Contenido del programa

Mostrar acordeón:

Módulo 1
Introducción

Módulo 2
Fundamentos

Módulo 3
Aplicación práctica

Módulo 4
Evaluación y certificación

Los contenidos son demostrativos.

Incluye

clases en video;

documentos PDF;

material descargable;

evaluación final;

certificado de aprobación.

Certificación

Crear una sección visual premium mostrando un mockup de certificado.

Texto:

Al completar y aprobar satisfactoriamente el programa podrás obtener tu certificado correspondiente.

Mostrar claramente el organismo que avala el curso.

8. Login

Crear una página elegante de autenticación.

Layout dividido:

Lado izquierdo:

Logo y branding.

Texto:

Aprende. Crece. Trasciende.

Lado derecho:

Formulario.

Campos:

Correo electrónico
Contraseña

Botón:

Iniciar sesión

Opciones:

Recordarme

¿Olvidaste tu contraseña?

Crear cuenta

Utilizar validaciones visuales.

9. Registro de estudiante

Campos:

nombres;

apellidos;

cédula;

correo electrónico;

teléfono;

contraseña;

confirmar contraseña.

Checkbox:

Acepto términos y condiciones.

Botón:

Crear mi cuenta

10. Dashboard del estudiante

Después del login, crear un dashboard moderno.

Sidebar izquierdo:

Logo

Inicio

Mis cursos

Certificados

Perfil

Cerrar sesión

Header superior:

Buscador

Campana de notificaciones

Avatar

Nombre del estudiante

11. Inicio del estudiante

Mensaje:

Hola, Andrea 👋

Subtexto:

Continúa avanzando hacia tus objetivos profesionales.

Cards superiores:

Cursos activos

2

Cursos completados

1

Certificados

1

Horas de formación

34 h

12. Continúa aprendiendo

Mostrar cards horizontales.

Ejemplo:

Gestor Empresarial

Progreso:

65%

Barra de progreso dorada.

Texto:

8 de 12 lecciones completadas.

Botón:

Continuar curso

13. Mis cursos

Crear filtros:

Todos

En progreso

Completados

Pendientes

Mostrar cards con:

imagen;

curso;

organismo que avala;

progreso;

cantidad de módulos;

estado;

botón.

Ejemplo:

Gestor Empresarial

65% completado

Botón:

Continuar

14. Aula virtual / reproductor del curso

Esta es una de las interfaces más importantes.

Crear layout tipo LMS.

Izquierda

Área principal de contenido.

Video player grande.

Debajo:

Título de la clase.

Descripción.

Tabs:

Contenido

Recursos

Notas

Permitir visualizar PDFs y recursos descargables.

Derecha

Sidebar con estructura del curso.

Ejemplo:

Módulo 1

Introducción

✓ Bienvenida

✓ Fundamentos empresariales

Módulo 2

Administración

✓ Conceptos administrativos

● Gestión empresarial

○ Planificación estratégica

Módulo 3

Evaluación

🔒 Evaluación final

Cada lección debe mostrar:

completada;

actual;

pendiente;

bloqueada.

El alumno debe avanzar de manera secuencial.

No permitir acceder a la evaluación hasta completar las lecciones requeridas.

15. Evaluación final

Crear pantalla especial.

Header:

Evaluación Final — Gestor Empresarial

Mostrar:

Tiempo disponible:

45:00

Agregar cronómetro visible.

Información:

20 preguntas

Puntaje requerido para aprobación: placeholder configurable.

Preguntas tipo:

selección simple;

selección múltiple;

verdadero/falso.

Mostrar navegación:

Pregunta 4 de 20

Anterior

Siguiente

Panel lateral con números de preguntas.

Los estados pueden ser:

respondida;

actual;

pendiente.

Botón final:

Enviar evaluación

Antes del envío mostrar modal:

¿Deseas finalizar tu evaluación?

Al terminar el tiempo, simular envío automático.

16. Resultado de evaluación

Crear dos estados.

Aprobado

Icono positivo.

Texto:

¡Felicitaciones! Has aprobado tu evaluación.

Calificación:

92 / 100

Botón:

Ver certificado

Pendiente de revisión

Texto:

Tu evaluación fue enviada correctamente.

El docente revisará tus respuestas y posteriormente podrás visualizar tu calificación.

17. Certificados

Página:

Mis certificados

Mostrar cards de certificados obtenidos.

Cada card:

Nombre del curso

Fecha de aprobación

Organismo aval

Botones:

Ver certificado

Descargar PDF

Para el mockup crear un certificado elegante usando los colores azul marino, dorado y blanco.

Incluir:

Logo Alianza Contigo

Nombre del estudiante

Nombre del curso

Fecha

Firma ficticia

Código ficticio de verificación como elemento visual.

18. Perfil del estudiante

Mostrar:

Foto/avatar.

Información personal.

Nombre.

Correo.

Teléfono.

Cédula.

Botón:

Editar perfil

Sección:

Seguridad

Cambiar contraseña.

PANEL ADMINISTRATIVO

Crear una interfaz independiente para administración.

Ruta:

/admin

Sidebar:

Dashboard

Cursos

Estudiantes

Docentes

Evaluaciones

Certificados

Inscripciones

Configuración

19. Dashboard administrador

Título:

Panel administrativo

Cards:

Estudiantes registrados

487

Cursos activos

5

Inscripciones

624

Certificados emitidos

312

Agregar gráficos visuales utilizando datos ficticios:

Inscripciones por mes

y

Estudiantes por curso

Agregar:

Actividad reciente

Ejemplo:

Andrea Pérez completó Gestor Empresarial.

Juan Gómez presentó una evaluación.

María Andrade obtuvo un certificado.

20. Gestión de cursos

Tabla:

Curso | Estudiantes | Estado | Aval | Acciones

Cursos:

Gestor Empresarial

Administración de Empresas

Agente Inmobiliario

Visitador Médico

Certificación como Artesano

Acciones:

Ver

Editar

Gestionar contenido

Evaluación

Desactivar

Botón superior:

+ Crear curso

21. Crear / editar curso

Crear un formulario organizado mediante pasos.

Paso 1

Información general

Nombre

Descripción corta

Descripción completa

Imagen

Precio

Estado

Paso 2

Certificación

Organismo que avala

Nombre de certificación

Logo del organismo

Paso 3

Contenido

Crear módulos.

Dentro del módulo:

+ Agregar lección

Tipos:

Video

PDF

Documento

Texto

Recurso

Permitir reordenar visualmente mediante drag & drop.

22. Constructor de evaluación

Dentro de cada curso crear:

Evaluación final

Configuración:

Nombre de evaluación

Tiempo límite

Número de intentos

Puntaje de aprobación

Botón:

Agregar pregunta

Cada pregunta:

Texto

Tipo

Opciones

Respuesta correcta

Puntaje

Permitir:

Editar

Duplicar

Eliminar

Reordenar

23. Bandeja de evaluaciones

Tabla:

Estudiante | Curso | Fecha | Estado | Calificación | Acción

Estados:

Pendiente de revisión

Revisado

Aprobado

No aprobado

Botón:

Revisar evaluación

24. Revisión docente

Mostrar:

Estudiante:

Andrea Pérez

Curso:

Gestor Empresarial

Fecha:

20 agosto 2026

Mostrar cada pregunta con la respuesta dada por el estudiante.

Permitir asignar puntaje.

Campo:

Comentarios del docente

Botón:

Guardar calificación

Botón principal:

Aprobar curso

25. Gestión de estudiantes

Tabla:

Nombre

Cédula

Correo

Cursos inscritos

Estado

Registro

Acciones

Buscador superior.

Filtros.

Al entrar al estudiante mostrar:

Datos personales.

Cursos adquiridos.

Progreso.

Evaluaciones.

Certificados.

26. Inscripciones

Crear módulo:

Gestión de inscripciones

Permitir asignar manualmente un curso a un estudiante.

Formulario:

Buscar estudiante

Seleccionar curso

Fecha

Estado de inscripción

Botón:

Matricular estudiante

Esto debe funcionar como simulación en el prototipo.

27. Comercialización de cursos

Preparar visualmente la arquitectura para incorporar posteriormente compra online.

En la versión inicial crear:

Catálogo.

Detalle del curso.

Precio configurable.

Botón:

Inscribirme

Modal:

Selecciona tu modalidad de inscripción

Dejar preparado un componente independiente para futura integración con una pasarela de pagos.

NO conectar todavía ninguna pasarela real.

Aplicar patrón Strategy para que en una implementación posterior puedan existir diferentes medios de pago sin acoplarlos a la interfaz principal.

Ejemplo conceptual:

PaymentStrategy

CardPayment

TransferPayment

ManualEnrollment

28. Arquitectura frontend

Usar:

React

TypeScript

Tailwind CSS

shadcn/ui

Lucide Icons

React Router

Una librería de gráficos moderna compatible con React.

Crear estructura aproximada:

src/

components/

layouts/

pages/

features/

features/auth/

features/courses/

features/exams/

features/certificates/

features/students/

features/admin/

services/

hooks/

types/

mocks/

utils/

Organizar por funcionalidades y evitar componentes gigantes.

Utilizar:

componentes reutilizables;

separación de responsabilidades;

interfaces TypeScript;

constantes centralizadas;

mocks separados;

layouts independientes por rol.

29. Componentes reutilizables

Crear componentes como:

CourseCard

CourseProgressCard

CourseBadge

CertificationBadge

LessonSidebar

VideoLesson

DocumentLesson

ProgressBar

ExamQuestion

ExamTimer

CertificateCard

StatsCard

DataTable

PageHeader

EmptyState

ConfirmDialog

UserAvatar

RoleGuard

30. Diseño responsive

La plataforma debe funcionar correctamente en:

Desktop

Laptop

Tablet

Smartphone

En móvil:

Sidebar convertirse en menú drawer.

Cards adaptarse a una sola columna.

Aula virtual reorganizar contenido y módulos.

Tablas administrativas permitir scroll horizontal o representación mediante cards.

31. Datos iniciales

Crear información ficticia para mostrar el sistema completamente poblado.

Usuario estudiante:

Andrea Pérez

Cursos activos:

Gestor Empresarial — 65%

Agente Inmobiliario — 30%

Curso completado:

Administración de Empresas — 100%

Certificado:

Administración de Empresas

32. Experiencia de usuario

Implementar:

animaciones suaves;

transiciones;

hover states;

toasts;

modales;

confirmaciones;

loading states;

empty states;

breadcrumbs;

tooltips;

responsive design;

feedback visual.

La plataforma debe sentirse como un producto SaaS/LMS profesional terminado, no como una plantilla genérica.

33. Concepto visual principal

La identidad de Alianza Contigo debe estar siempre presente.

Utilizar ocasionalmente el concepto gráfico de la flecha dorada del logo como recurso visual para representar:

avance

crecimiento

progreso profesional

No repetir excesivamente el logo.

El concepto general debe comunicar:

APRENDE | CRECE | TRASCIENDE

Esta frase puede utilizarse estratégicamente en:

Login.

Landing.

Footer.

Pantallas de celebración al terminar un curso.

Resultado esperado

Quiero que construyas un prototipo visual navegable y profesional de toda la plataforma, priorizando inicialmente:

Landing page.

Catálogo de cursos.

Detalle del curso.

Login.

Dashboard del estudiante.

Mis cursos.

Aula virtual.

Evaluación final.

Certificados.

Dashboard administrativo.

Gestión de cursos.

Gestión de estudiantes.

Gestión de evaluaciones.

Todos los botones principales deben permitir navegar entre pantallas para poder presentar el sistema al cliente como una demo comercial realista.

No necesito todavía un backend real.

Utiliza mocks y estado local para demostrar los flujos principales.

La prioridad es conseguir una interfaz visualmente impactante, profesional y suficientemente completa para que el cliente pueda imaginar cómo funcionará su plataforma terminada.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0cb0f551-a2cf-44df-b7ff-f2b9acebda5a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
