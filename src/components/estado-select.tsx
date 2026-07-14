"use client";

import { useTransition } from "react";
import { actualizarEstadoTarea } from "@/lib/actions/tareas";
import { ESTADO_TAREA_LABEL, type EstadoTarea } from "@/lib/types";

const ESTADOS: EstadoTarea[] = ["pendiente", "en_progreso", "completada"];

export default function EstadoSelect({
  tareaId,
  estado,
}: {
  tareaId: string;
  estado: EstadoTarea;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={estado}
      disabled={isPending}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const nuevoEstado = e.target.value as EstadoTarea;
        startTransition(() => actualizarEstadoTarea(tareaId, nuevoEstado));
      }}
      className="rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs text-foreground disabled:opacity-50"
    >
      {ESTADOS.map((e) => (
        <option key={e} value={e}>
          {ESTADO_TAREA_LABEL[e]}
        </option>
      ))}
    </select>
  );
}
