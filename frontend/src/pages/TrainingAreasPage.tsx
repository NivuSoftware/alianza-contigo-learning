import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Save, Tags, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layouts/AppShell";
import { adminNav } from "@/components/layouts/nav";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import type { TrainingArea } from "@/types/lms";

export function TrainingAreasPage() {
  const [areas, setAreas] = useState<TrainingArea[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () =>
    api<TrainingArea[]>("/training-areas")
      .then(setAreas)
      .catch((error) =>
        toast.error(error instanceof ApiError ? error.message : "No se pudieron cargar las áreas"),
      )
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api(editingId ? `/training-areas/${editingId}` : "/training-areas", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      toast.success(editingId ? "Área actualizada" : "Área creada");
      setName("");
      setEditingId(null);
      await load();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  async function remove(area: TrainingArea) {
    if (!window.confirm(`¿Eliminar el área “${area.name}”?`)) return;
    try {
      await api(`/training-areas/${area.id}`, { method: "DELETE" });
      toast.success("Área eliminada");
      await load();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No se pudo eliminar");
    }
  }

  return (
    <AppShell items={adminNav} role="Administrador">
      <PageHeader
        title="Áreas de formación"
        description="Crea las categorías que se asignarán a los cursos y se mostrarán en el catálogo público."
      />
      <form onSubmit={submit} className="surface-card mb-6 flex flex-col gap-3 p-5 sm:flex-row">
        <Input
          required
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ej. Desarrollo empresarial"
          aria-label="Nombre del área de formación"
        />
        <div className="flex gap-2">
          <Button type="submit" variant="gold" disabled={saving || !name.trim()}>
            {editingId ? <Save /> : <Plus />}
            {saving ? "Guardando..." : editingId ? "Guardar" : "Crear área"}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setName("");
              }}
            >
              <X /> Cancelar
            </Button>
          )}
        </div>
      </form>

      <div className="surface-card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Cargando...</p>
        ) : areas.length === 0 ? (
          <div className="p-10 text-center">
            <Tags className="mx-auto h-9 w-9 text-gold" />
            <p className="mt-3 font-medium text-navy">Todavía no hay áreas de formación</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {areas.map((area) => (
              <div key={area.id} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-medium text-navy">{area.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {area.coursesCount || 0} curso(s) asignado(s)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label={`Editar ${area.name}`}
                    onClick={() => {
                      setEditingId(area.id);
                      setName(area.name);
                    }}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label={`Eliminar ${area.name}`}
                    disabled={Boolean(area.coursesCount)}
                    onClick={() => void remove(area)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
