import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioActual } from "@/lib/auth";
import type { Categoria, Proceso } from "@/lib/types";
import FavoritoButton from "@/components/favorito-button";

export default async function FavoritosPage() {
  const usuario = await getUsuarioActual();
  const supabase = await createClient();

  const { data: favoritos } = await supabase
    .from("favoritos")
    .select("proceso_id, procesos(*, categorias(*))")
    .eq("usuario_id", usuario.id)
    .order("guardado_en", { ascending: false });

  const procesos = (favoritos ?? [])
    .map((f) => f.procesos as unknown as Proceso)
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-xl font-semibold">Mis favoritos</h1>
      <p className="mt-1 text-sm text-muted">
        Procesos que guardaste para acceder rápido.
      </p>

      {procesos.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
          Aún no guardaste ningún proceso.{" "}
          <Link href="/biblioteca" className="text-ey-yellow hover:underline">
            Explorar la biblioteca
          </Link>
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {procesos.map((proceso) => (
            <Link
              key={proceso.id}
              href={`/biblioteca/${proceso.id}`}
              prefetch={false}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition hover:border-ey-yellow/60"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                  <BookOpen className="h-4 w-4 text-ey-yellow" />
                </div>
                <FavoritoButton procesoId={proceso.id} esFavorito />
              </div>
              <p className="text-sm font-medium leading-snug">{proceso.titulo}</p>
              {proceso.categorias && (
                <span className="mt-auto flex items-center gap-1 text-xs text-muted">
                  <Star className="h-3 w-3 text-ey-yellow" fill="currentColor" />
                  {(proceso.categorias as Categoria).nombre}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
