import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioActual } from "@/lib/auth";
import { crearProceso } from "@/lib/actions/admin";
import SubmitButton from "@/components/submit-button";
import type { Categoria } from "@/lib/types";

export default async function NuevoProcesoPage() {
  const usuario = await getUsuarioActual();
  if (usuario.rol !== "gerente") {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: categorias } = await supabase.from("categorias").select("*").order("orden");

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Link
        href="/admin"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al panel
      </Link>

      <h1 className="mt-4 text-xl font-semibold">Nuevo proceso</h1>
      <p className="mt-1 text-sm text-muted">
        Se crea como borrador salvo que marques &quot;Publicar de inmediato&quot;. Podrás agregar
        plantillas después de crearlo.
      </p>

      <form action={crearProceso} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Título *</label>
          <input
            name="titulo"
            required
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Descripción corta
          </label>
          <input
            name="descripcion_corta"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Categoría</label>
          <select
            name="categoria_id"
            defaultValue=""
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          >
            <option value="">Sin categoría</option>
            {(categorias as Categoria[] | null ?? []).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">URL del video</label>
            <input
              name="video_url"
              type="url"
              placeholder="https://..."
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Duración</label>
            <input
              name="duracion_video"
              placeholder="4:30"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Guía paso a paso
          </label>
          <textarea
            name="guia_contenido"
            rows={6}
            placeholder="1. Primer paso...&#10;2. Segundo paso..."
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Buenas prácticas
          </label>
          <textarea
            name="buenas_practicas"
            rows={3}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="es_estable" defaultChecked className="h-4 w-4" />
            Proceso estable (no marca aviso de &quot;en revisión&quot;)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="publicar" className="h-4 w-4" />
            Publicar de inmediato (si no, queda como borrador)
          </label>
        </div>

        <SubmitButton
          pendingText="Creando..."
          className="mt-2 self-start rounded-lg bg-ey-yellow px-4 py-2 text-sm font-medium text-black transition hover:brightness-95"
        >
          Crear proceso
        </SubmitButton>
      </form>
    </div>
  );
}
