import Link from "next/link";
import { AlertCircle, Clock, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioActual } from "@/lib/auth";
import { crearTarea } from "@/lib/actions/tareas";
import EstadoSelect from "@/components/estado-select";
import SubmitButton from "@/components/submit-button";
import {
  ESTADO_TAREA_LABEL,
  ETIQUETA_LABEL,
  type EstadoTarea,
  type Tarea,
  type Usuario,
} from "@/lib/types";

const COLUMNAS: EstadoTarea[] = ["pendiente", "en_progreso", "completada"];

function formatFecha(fecha: string) {
  const d = new Date(fecha + "T00:00:00");
  return d.toLocaleDateString("es-VE", { day: "2-digit", month: "short" });
}

export default async function TareasPage() {
  const usuario = await getUsuarioActual();
  const isGerente = usuario.rol === "gerente";
  const supabase = await createClient();

  let query = supabase
    .from("tareas")
    .select("*, usuario_asignado:usuarios!usuario_asignado_id(*), proceso:procesos(id, titulo)")
    .order("fecha_limite", { ascending: true, nullsFirst: false });

  if (!isGerente) {
    query = query.or(`usuario_asignado_id.eq.${usuario.id},creado_por.eq.${usuario.id}`);
  }

  const { data: tareas } = await query;

  const { data: colaboradores } = isGerente
    ? await supabase.from("usuarios").select("*").eq("activo", true).order("nombre")
    : { data: null };

  const lista = (tareas ?? []) as Tarea[];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Tablero de tareas</h1>
          <p className="mt-1 text-sm text-muted">
            {isGerente
              ? "Todas las tareas del equipo, organizadas por estado."
              : "Tus tareas asignadas, organizadas por estado."}
          </p>
        </div>
      </div>

      {isGerente && (colaboradores as Usuario[] | null)?.length ? (
        <details className="mt-6 rounded-xl border border-border bg-surface p-4">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4 text-ey-yellow" />
            Nueva tarea
          </summary>
          <form action={crearTarea} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="titulo"
              placeholder="Título de la tarea"
              required
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm sm:col-span-2"
            />
            <textarea
              name="descripcion"
              placeholder="Descripción (opcional)"
              rows={2}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm sm:col-span-2"
            />
            <select
              name="usuario_asignado_id"
              required
              defaultValue=""
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Asignar a...
              </option>
              {(colaboradores as Usuario[]).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <select
              name="etiqueta"
              defaultValue=""
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
            >
              <option value="">Sin etiqueta</option>
              {Object.entries(ETIQUETA_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="fecha_limite"
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
            />
            <SubmitButton
              pendingText="Creando..."
              className="rounded-lg bg-ey-yellow px-3 py-2 text-sm font-medium text-black transition hover:brightness-95"
            >
              Crear tarea
            </SubmitButton>
          </form>
        </details>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COLUMNAS.map((columna) => {
          const tareasColumna = lista.filter((t) => t.estado === columna);
          return (
            <div key={columna} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-muted">
                  {ESTADO_TAREA_LABEL[columna]}
                </h2>
                <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted">
                  {tareasColumna.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {tareasColumna.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted">
                    Sin tareas
                  </p>
                ) : (
                  tareasColumna.map((tarea) => {
                    const vencida =
                      tarea.fecha_limite &&
                      tarea.estado !== "completada" &&
                      new Date(tarea.fecha_limite + "T00:00:00").getTime() < hoy.getTime();

                    return (
                      <Link
                        key={tarea.id}
                        href={`/tareas/${tarea.id}`}
                        className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition hover:border-ey-yellow/60"
                      >
                        <p className="text-sm font-medium leading-snug">{tarea.titulo}</p>

                        {isGerente && tarea.usuario_asignado && (
                          <p className="text-xs text-muted">{tarea.usuario_asignado.nombre}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          {tarea.etiqueta && (
                            <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-muted">
                              {ETIQUETA_LABEL[tarea.etiqueta]}
                            </span>
                          )}
                          {tarea.fecha_limite && (
                            <span
                              className={`flex items-center gap-1 text-xs ${
                                vencida ? "text-red-400" : "text-muted"
                              }`}
                            >
                              {vencida ? (
                                <AlertCircle className="h-3.5 w-3.5" />
                              ) : (
                                <Clock className="h-3.5 w-3.5" />
                              )}
                              {formatFecha(tarea.fecha_limite)}
                            </span>
                          )}
                        </div>

                        <div className="mt-1">
                          <EstadoSelect tareaId={tarea.id} estado={tarea.estado} />
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
