import Link from "next/link";
import { BookOpen, PlayCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioActual } from "@/lib/auth";
import type { Categoria, Favorito, Proceso } from "@/lib/types";
import FavoritoButton from "@/components/favorito-button";

export default async function BibliotecaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const usuario = await getUsuarioActual();
  const supabase = await createClient();

  let query = supabase
    .from("procesos")
    .select("*, categorias(*)")
    .eq("estado", "publicado")
    .order("created_at", { ascending: false });

  if (categoria) {
    query = query.eq("categoria_id", categoria);
  }

  const [{ data: procesos }, { data: favoritos }, { data: categoriaActiva }] = await Promise.all([
    query,
    supabase.from("favoritos").select("*").eq("usuario_id", usuario.id),
    categoria
      ? supabase.from("categorias").select("*").eq("id", categoria).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const favoritoIds = new Set((favoritos as Favorito[] | null ?? []).map((f) => f.proceso_id));
  const lista = (procesos ?? []) as Proceso[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-xl font-semibold">
        {(categoriaActiva as Categoria | null)?.nombre ?? "Biblioteca de procesos"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        Guías paso a paso, plantillas y buenas prácticas de PAS.
      </p>

      {lista.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
          Todavía no hay procesos publicados en esta categoría.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((proceso) => (
            <Link
              key={proceso.id}
              href={`/biblioteca/${proceso.id}`}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition hover:border-ey-yellow/60"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                  <BookOpen className="h-4 w-4 text-ey-yellow" />
                </div>
                <FavoritoButton
                  procesoId={proceso.id}
                  esFavorito={favoritoIds.has(proceso.id)}
                />
              </div>
              <div>
                <p className="text-sm font-medium leading-snug">{proceso.titulo}</p>
                {proceso.descripcion_corta && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted">
                    {proceso.descripcion_corta}
                  </p>
                )}
              </div>
              <div className="mt-auto flex items-center gap-3 text-xs text-muted">
                {proceso.categorias && (
                  <span className="rounded-md bg-surface-2 px-2 py-0.5">
                    {(proceso.categorias as Categoria).nombre}
                  </span>
                )}
                {proceso.duracion_video && (
                  <span className="flex items-center gap-1">
                    <PlayCircle className="h-3.5 w-3.5" />
                    {proceso.duracion_video}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
