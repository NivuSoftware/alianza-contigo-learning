import { useState } from "react";
import { Search } from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { CourseCard } from "@/components/shared/CourseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { courses } from "@/mocks/courses";
import { EmptyState } from "@/components/shared/EmptyState";

const filters = ["Todos", "Aval SENESCYT", "Aval Ministerio del Trabajo", "MIPRO"] as const;

export function CoursesPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("Todos");

  const list = courses.filter((c) => {
    const matchQuery = c.name.toLowerCase().includes(query.toLowerCase());
    const matchFilter =
      filter === "Todos" ||
      c.endorsements.some((e) => e === filter || (filter === "MIPRO" && e === "MIPRO"));
    return matchQuery && matchFilter;
  });

  return (
    <PublicLayout>
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="gold-rule" />
          <h1 className="mt-4 font-display text-4xl font-semibold text-navy">Catálogo de cursos</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Programas de educación continua con aval institucional. Elige el tuyo y comienza tu ruta
            profesional.
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
          {list.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>

        {list.length === 0 && (
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
