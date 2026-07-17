import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioActual } from "@/lib/auth";
import { actualizarProceso, agregarPlantilla, eliminarPlantilla } from "@/lib/actions/admin";
import PublicarToggle from "@/components/publicar-toggle";
import SubmitButton from "@/components/submit-button";
import type { Categoria, Plantilla, Proceso } from "@/lib/types";

export default async function EditarProcesoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await getUsuarioActual();
  if (usuario.rol !== "gerente") {
    redirect("/");
  }

  const supabase = await createClient();
  const [{ data: proceso }, { data: categorias }, { data: plantillas }] = await Promise.all([
    supabase.from("procesos").select("*").eq("id", id).maybeSingle(),
    supabase.from("categorias").select("*").order("orden"),
    supabase.from("plantillas").select("*").eq("proceso_id", id),
  ]);

  if (!proceso) {
    notFound();
  }

  const p = proceso as Proceso;
  const actualizarProcesoConId = actualizarProceso.bind(null, p.id);
  const agregarPlantillaConId = agregarPlantilla.bind(null, p.id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Link
        href="/admin"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al panel
      </Link>

      <div className="mt-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Editar proceso</h1>
        <PublicarToggle procesoId={p.id} estado={p.estado} />
      </div>

      <form action={actualizarProcesoConId} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Título *</label>
          <input
            name="titulo"
            required
            defaultValue={p.titulo}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Descripción corta
          </label>
          <input
            name="descripcion_corta"
            defaultValue={p.descripcion_corta ?? ""}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Categoría</label>
          <select
            name="categoria_id"
            defaultValue={p.categoria_id ?? ""}
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
              defaultValue={p.video_url ?? ""}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Duración</label>
            <input
              name="duracion_video"
              placeholder="4:30"
              defaultValue={p.duracion_video ?? ""}
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
            defaultValue={p.guia_contenido ?? ""}
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
            defaultValue={p.buenas_practicas ?? ""}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="es_estable"
              defaultChecked={p.es_estable}
              className="h-4 w-4"
            />
            Proceso estable (no marca aviso de &quot;en revisión&quot;)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="publicar"
              defaultChecked={p.estado === "publicado"}
              className="h-4 w-4"
            />
            Publicado (visible en la biblioteca)
          </label>
        </div>

        <SubmitButton
          pendingText="Guardando..."
          className="mt-2 self-start rounded-lg bg-ey-yellow px-4 py-2 text-sm font-medium text-black transition hover:brightness-95"
        >
          Guardar cambios
        </SubmitButton>
      </form>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-muted">Plantillas</h2>
        <div className="mt-3 flex flex-col gap-2">
          {(plantillas as Plantilla[] | null ?? []).map((plantilla) => {
            const eliminarPlantillaConId = eliminarPlantilla.bind(null, plantilla.id, p.id);
            return (
              <div
                key={plantilla.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-sm"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-ey-yellow" />
                  {plantilla.nombre}
                  <span className="text-xs uppercase text-muted">{plantilla.tipo}</span>
                </span>
                <form action={eliminarPlantillaConId}>
                  <SubmitButton
                    pendingText="…"
                    ariaLabel="Eliminar plantilla"
                    className="rounded-lg p-1.5 text-muted transition hover:bg-surface-2 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </SubmitButton>
                </form>
              </div>
            );
          })}
          {(!plantillas || plantillas.length === 0) && (
            <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted">
              Sin plantillas todavía.
            </p>
          )}
        </div>

        <form
          action={agregarPlantillaConId}
          className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1.5fr_2fr_1fr_auto]"
        >
          <input
            name="nombre"
            placeholder="Nombre del archivo"
            required
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          />
          <input
            name="archivo_url"
            type="url"
            placeholder="https://..."
            required
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          />
          <select
            name="tipo"
            defaultValue="pdf"
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          >
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="xlsx">XLSX</option>
          </select>
          <SubmitButton
            pendingText="Agregando..."
            className="rounded-lg bg-ey-yellow px-3 py-2 text-sm font-medium text-black transition hover:brightness-95"
          >
            Agregar
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
