import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Course, LessonType } from "@/types";
import type { LessonType as LmsLessonType, LmsCourse } from "@/types/lms";

const currency = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" });

function lessonType(type: LmsLessonType): LessonType {
  if (type === "video" || type === "pdf" || type === "text") return type;
  return type === "file" ? "resource" : "document";
}

export function toPublicCourse(course: LmsCourse): Course {
  return {
    id: course.id,
    slug: course.slug,
    name: course.name,
    shortDescription: course.shortDescription,
    fullDescription: course.fullDescription || course.shortDescription,
    endorsements: course.endorsement ? [course.endorsement] : [],
    image: course.coverUrl || "",
    modality: course.modality,
    duration: course.duration,
    modules: (course.modules || []).map((module, moduleIndex) => ({
      id: module.id || `module-${moduleIndex}`,
      title: `Módulo ${moduleIndex + 1}`,
      subtitle: module.title,
      description: module.description,
      lessons: module.lessons.map((lesson, lessonIndex) => ({
        id: lesson.id || `lesson-${moduleIndex}-${lessonIndex}`,
        title: lesson.title,
        type: lessonType(lesson.type),
        duration:
          lesson.type === "video" && lesson.durationMinutes
            ? `${lesson.durationMinutes} min`
            : lesson.type === "pdf"
              ? "PDF"
              : lesson.type === "image"
                ? "Imagen"
                : "Lectura",
        state: "pending",
        description: lesson.content,
        mediaUrl: lesson.mediaUrl,
      })),
    })),
    certification: course.certification,
    status: "Activo",
    studentsCount: 0,
    price: course.discountPercent
      ? `${currency.format(course.finalPrice)} · antes ${currency.format(course.price)}`
      : currency.format(course.price),
    currentPrice: course.finalPrice,
    originalPrice: course.price,
    discountPercent: course.discountPercent,
  };
}

export function usePublicCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(() => {
    setLoading(true);
    setError("");
    return api<LmsCourse[]>("/courses")
      .then((data) => setCourses(data.map(toPublicCourse)))
      .catch((reason) =>
        setError(reason instanceof ApiError ? reason.message : "No pudimos cargar los Programas."),
      )
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  return { courses, loading, error, reload: load };
}
