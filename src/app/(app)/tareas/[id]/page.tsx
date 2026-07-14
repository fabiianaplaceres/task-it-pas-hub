import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Calendar, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioActual } from "@/lib/auth";
import EstadoSelect from "@/components/estado-select";
import { ETIQUETA_LABEL, type Tarea } from "@/lib/types";

function formatFecha(fecha: string) {
  const d = new Date(fecha + "T00:00:00");
  return d.toLocaleDateString("es-VE", { day: "2-digit", month: "long", year: "numeric" });
}

export default async function TareaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await getUsuarioActual();
  const supabase = await createClient();

  const { data: tarea } = await supabase
    .from("tareas")
    .select("*, usuario_asignado:usuarios!usuario_asignado_id(*), proceso:procesos(id, titulo)")
    .eq("id", id)
    .maybeSingle();

  if (!tarea) {
    notFound();
  }

  const t = tarea as Tarea;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Link
        href="/tareas"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al tablero
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{t.titulo}</h1>
          {t.etiqueta && (
            <span className="mt-2 inline-block rounded-md bg-surface-2 px-2 py-0.5 text-xs text-muted">
              {ETIQUETA_LABEL[t.etiqueta]}
            </span>
          )}
        </div>
        <EstadoSelect tareaId={t.id} estado={t.estado} />
      </div>

      {t.descripcion && (
        <p className="mt-4 whitespace-pre-line rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
          {t.descripcion}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 text-sm text-muted">
        {t.usuario_asignado && (
          <span className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Asignada a {t.usuario_asignado.nombre}
          </span>
        )}
        {t.fecha_limite && (
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Vence el {formatFecha(t.fecha_limite)}
          </span>
        )}
        {t.proceso && (
          <Link
            href={`/biblioteca/${t.proceso.id}`}
            className="flex items-center gap-2 text-ey-yellow hover:underline"
          >
            <BookOpen className="h-4 w-4" />
            Ver proceso relacionado: {t.proceso.titulo}
          </Link>
        )}
      </div>
    </div>
  );
}
