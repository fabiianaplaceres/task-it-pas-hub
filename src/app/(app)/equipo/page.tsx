import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioActual } from "@/lib/auth";
import type { EstadoTarea, Tarea, Usuario } from "@/lib/types";
import { ESTADO_TAREA_LABEL } from "@/lib/types";

export default async function EquipoPage() {
  const usuario = await getUsuarioActual();
  if (usuario.rol !== "gerente") {
    redirect("/");
  }

  const supabase = await createClient();

  const [{ data: colaboradores }, { data: tareas }] = await Promise.all([
    supabase.from("usuarios").select("*").eq("activo", true).order("nombre"),
    supabase.from("tareas").select("*"),
  ]);

  const lista = (colaboradores as Usuario[] | null) ?? [];
  const todasLasTareas = (tareas as Tarea[] | null) ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-xl font-semibold">Carga del equipo</h1>
      <p className="mt-1 text-sm text-muted">
        Distribución de tareas por colaborador.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {lista.map((colaborador) => {
          const tareasColaborador = todasLasTareas.filter(
            (t) => t.usuario_asignado_id === colaborador.id
          );
          const conteoPorEstado: Record<EstadoTarea, number> = {
            pendiente: 0,
            en_progreso: 0,
            completada: 0,
          };
          for (const t of tareasColaborador) {
            conteoPorEstado[t.estado]++;
          }
          const activas = conteoPorEstado.pendiente + conteoPorEstado.en_progreso;

          return (
            <div
              key={colaborador.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold">
                  {colaborador.nombre.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{colaborador.nombre}</p>
                  <p className="text-xs capitalize text-muted">{colaborador.rol}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {(Object.keys(conteoPorEstado) as EstadoTarea[]).map((estado) => (
                  <div key={estado} className="text-center">
                    <p className="text-lg font-semibold">{conteoPorEstado[estado]}</p>
                    <p className="text-[11px] text-muted">{ESTADO_TAREA_LABEL[estado]}</p>
                  </div>
                ))}
                <div className="flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1 text-xs text-muted">
                  <Users className="h-3.5 w-3.5" />
                  {activas} activas
                </div>
              </div>
            </div>
          );
        })}

        {lista.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
            No hay colaboradores activos registrados.
          </p>
        )}
      </div>
    </div>
  );
}
