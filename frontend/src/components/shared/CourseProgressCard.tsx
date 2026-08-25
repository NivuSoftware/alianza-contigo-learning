import { Link } from "react-router-dom";
import { PlayCircle } from "lucide-react";
import type { Course, Enrollment } from "@/types";
import { ProgressBar } from "./ProgressBar";
import { Button } from "@/components/ui/button";
import { CourseBadge } from "./CourseBadge";

export function CourseProgressCard({
  course,
  enrollment,
}: {
  course: Course;
  enrollment: Enrollment;
}) {
  const done = enrollment.status === "Completado";
  return (
    <article className="surface-card hover-lift grid gap-4 p-4 sm:grid-cols-[180px_minmax(0,1fr)]">
      <img
        src={course.image}
        alt={course.name}
        loading="lazy"
        width={800}
        height={560}
        className="h-32 w-full rounded-lg object-cover sm:h-full"
      />
      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          {course.endorsements.map((e) => (
            <CourseBadge key={e} label={e} tone="muted" />
          ))}
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold text-navy">{course.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {enrollment.lessonsCompleted} de {enrollment.lessonsTotal} lecciones completadas
        </p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-semibold text-navy">{enrollment.progress}%</span>
          </div>
          <ProgressBar value={enrollment.progress} />
        </div>

        <div className="mt-4">
          <Button asChild size="sm">
            <Link to={`/app/classroom/${course.slug}`}>
              <PlayCircle className="h-4 w-4" />
              {done ? "Repasar curso" : "Continuar curso"}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
