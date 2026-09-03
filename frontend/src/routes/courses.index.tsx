import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { CourseCard } from "@/components/shared/CourseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePublicCourses } from "@/hooks/use-public-courses";
import { EmptyState } from "@/components/shared/EmptyState";

export function CoursesPage() {
  const { courses, loading, error, reload } = usePublicCourses();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");
  const filters = useMemo(
    () => ["Todos", ...new Set(courses.flatMap((course) => course.endorsements))],
    [courses],
  );

  const list = courses.filter((c) => {
    const matchQuery = c.name.toLowerCase().includes(query.toLowerCase());
    const matchFilter = filter === "Todos" || c.endorsements.some((e) => e === filter);
    return matchQuery && matchFilter;
  });

  return (
    <PublicLayout>
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="gold-rule" />
          <h1 className="mt-4 font-display text-4xl font-semibold text-navy">Catálogo de Programas</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Encuentra la formación que se adapte a tus objetivos profesionales. Conoce sus contenidos, metodología, duración, certificación y ruta de aprendizaje antes de comenzar.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar programa..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {filters.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "navy" : "outline"}
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[430px] animate-pulse rounded-2xl bg-muted" />
            ))}
          {list.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>

        {error && (
          <div className="mt-8 rounded-xl bg-red-50 p-5 text-sm text-red-800">
            <p>{error}</p>
            <Button variant="outline" className="mt-3" onClick={() => void reload()}>
              Reintentar
            </Button>
          </div>
        )}

        {!loading && !error && list.length === 0 && (
          <div className="mt-8">
            <EmptyState
              icon={Search}
              title="No encontramos programas"
              description="Prueba con otro término de búsqueda o cambia el filtro de aval."
            />
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
