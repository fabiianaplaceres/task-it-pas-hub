import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText, PlayCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioActual } from "@/lib/auth";
import type { Categoria, Plantilla, Proceso } from "@/lib/types";
import FavoritoButton from "@/components/favorito-button";

export default async function ProcesoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await getUsuarioActual();
  const supabase = await createClient();

  const [{ data: proceso }, { data: plantillas }, { data: favorito }] = await Promise.all([
    supabase.from("procesos").select("*, categorias(*)").eq("id", id).maybeSingle(),
    supabase.from("plantillas").select("*").eq("proceso_id", id),
    supabase
      .from("favoritos")
      .select("id")
      .eq("usuario_id", usuario.id)
      .eq("proceso_id", id)
      .maybeSingle(),
  ]);

  if (!proceso) {
    notFound();
  }

  const p = proceso as Proceso;
  const categoria = p.categorias as Categoria | null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href="/biblioteca"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a la biblioteca
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          {categoria && (
            <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-muted">
              {categoria.nombre}
            </span>
          )}
          <h1 className="mt-2 text-xl font-semibold">{p.titulo}</h1>
          {p.descripcion_corta && (
            <p className="mt-1 text-sm text-muted">{p.descripcion_corta}</p>
          )}
        </div>
        <FavoritoButton procesoId={p.id} esFavorito={!!favorito} />
      </div>

      {!p.es_estable && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          Este proceso está en revisión y puede cambiar próximamente.
        </div>
      )}

      {p.video_url && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-surface p-4 text-sm">
          <PlayCircle className="h-4 w-4 text-ey-yellow" />
          <a href={p.video_url} target="_blank" rel="noreferrer" className="hover:underline">
            Ver video del proceso
          </a>
          {p.duracion_video && <span className="text-xs text-muted">({p.duracion_video})</span>}
        </div>
      )}

      {p.guia_contenido && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-muted">Guía paso a paso</h2>
          <p className="mt-2 whitespace-pre-line rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
            {p.guia_contenido}
          </p>
        </section>
      )}

      {p.buenas_practicas && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-muted">Buenas prácticas</h2>
          <p className="mt-2 whitespace-pre-line rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
            {p.buenas_practicas}
          </p>
        </section>
      )}

      {plantillas && plantillas.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-muted">Plantillas</h2>
          <div className="mt-2 flex flex-col gap-2">
            {(plantillas as Plantilla[]).map((plantilla) => (
              <a
                key={plantilla.id}
                href={plantilla.archivo_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-sm transition hover:border-ey-yellow/60"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-ey-yellow" />
                  {plantilla.nombre}
                  <span className="text-xs uppercase text-muted">{plantilla.tipo}</span>
                </span>
                <Download className="h-4 w-4 text-muted" />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
