import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, Clock, MonitorPlay } from "lucide-react";
import type { Course } from "@/types";
import { CourseBadge } from "./CourseBadge";
import { Button } from "@/components/ui/button";

export function CourseCard({ course }: { course: Course }) {
  const currency = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" });
  const hasDiscount = Boolean(course.discountPercent && course.originalPrice);
  return (
    <article className="surface-card hover-lift group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        {course.image ? (
          <img
            src={course.image}
            alt={course.name}
            loading="lazy"
            width={800}
            height={560}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center bg-navy-soft text-white/70">
            <span className="text-center">
              <BookOpen className="mx-auto h-9 w-9 text-gold" />
              <span className="mt-2 block text-xs">Portada pendiente</span>
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-navy/70 to-transparent" />
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {course.endorsements.map((e) => (
            <CourseBadge key={e} label={e} className="bg-white/95 backdrop-blur" />
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-navy">{course.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{course.shortDescription}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MonitorPlay className="h-3.5 w-3.5 text-gold" />
            {course.modality}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-gold" />
            {course.duration}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="min-w-0">
            {hasDiscount && (
              <span className="block text-xs text-muted-foreground line-through">
                {currency.format(course.originalPrice!)}
              </span>
            )}
            <span className="block text-lg font-semibold text-navy">
              {course.currentPrice !== undefined
                ? currency.format(course.currentPrice)
                : course.price}
            </span>
          </span>
          <Button asChild size="sm" variant="secondary" className="group/btn">
            <Link to={`/courses/${course.slug}`}>
              Ver programa
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
