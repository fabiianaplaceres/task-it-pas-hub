import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Calendar, Trash2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioActual } from "@/lib/auth";
import { actualizarTarea, eliminarTarea } from "@/lib/actions/tareas";
import EstadoSelect from "@/components/estado-select";
import SubmitButton from "@/components/submit-button";
import SelectField from "@/components/select-field";
import { ETIQUETA_LABEL, type Tarea, type Usuario } from "@/lib/types";

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
  const usuario = await getUsuarioActual();
  const isGerente = usuario.rol === "gerente";
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

  const { data: colaboradores } = isGerente
    ? await supabase.from("usuarios").select("*").eq("activo", true).order("nombre")
    : { data: null };

  const actualizarTareaConId = actualizarTarea.bind(null, t.id);
  const eliminarTareaConId = eliminarTarea.bind(null, t.id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Link
        href="/tareas"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al tablero
      </Link>

      {isGerente ? (
        <>
          <div className="mt-4 flex items-center justify-between gap-4">
            <h1 className="text-xl font-semibold">Editar tarea</h1>
            <EstadoSelect tareaId={t.id} estado={t.estado} />
          </div>

          <form action={actualizarTareaConId} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Título *</label>
              <input name="titulo" required defaultValue={t.titulo} className="field w-full" />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Descripción
              </label>
              <textarea
                name="descripcion"
                rows={3}
                defaultValue={t.descripcion ?? ""}
                className="field w-full"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Asignar a *
                </label>
                <select
                  name="usuario_asignado_id"
                  required
                  defaultValue={t.usuario_asignado_id ?? ""}
                  className="field w-full"
                >
                  {((colaboradores as Usuario[] | null) ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Etiqueta</label>
                <SelectField
                  name="etiqueta"
                  defaultValue={t.etiqueta ?? ""}
                  placeholder="Sin etiqueta"
                  options={[
                    { value: "", label: "Sin etiqueta" },
                    ...Object.entries(ETIQUETA_LABEL).map(([value, label]) => ({ value, label })),
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Fecha límite</label>
              <input
                type="date"
                name="fecha_limite"
                defaultValue={t.fecha_limite ?? ""}
                className="field w-full"
              />
            </div>

            <SubmitButton
              pendingText="Guardando..."
              className="mt-2 self-start rounded-lg bg-ey-yellow px-4 py-2 text-sm font-medium text-black transition hover:brightness-95"
            >
              Guardar cambios
            </SubmitButton>
          </form>

          {t.proceso && (
            <Link
              href={`/biblioteca/${t.proceso.id}`}
              className="mt-4 flex items-center gap-2 text-sm text-ey-yellow hover:underline"
            >
              <BookOpen className="h-4 w-4" />
              Ver proceso relacionado: {t.proceso.titulo}
            </Link>
          )}

          <form action={eliminarTareaConId} className="mt-8 border-t border-border pt-4">
            <SubmitButton
              pendingText="Eliminando..."
              className="flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar tarea
            </SubmitButton>
          </form>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
