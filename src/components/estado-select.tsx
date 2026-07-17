"use client";

import { useTransition } from "react";
import { actualizarEstadoTarea } from "@/lib/actions/tareas";
import { ESTADO_TAREA_LABEL, type EstadoTarea } from "@/lib/types";
import SelectField from "@/components/select-field";

const ESTADOS: EstadoTarea[] = ["pendiente", "en_progreso", "completada"];
const OPCIONES = ESTADOS.map((e) => ({ value: e, label: ESTADO_TAREA_LABEL[e] }));

export default function EstadoSelect({
  tareaId,
  estado,
}: {
  tareaId: string;
  estado: EstadoTarea;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <SelectField
        compact
        value={estado}
        disabled={isPending}
        options={OPCIONES}
        onChange={(nuevoEstado) =>
          startTransition(() => actualizarEstadoTarea(tareaId, nuevoEstado as EstadoTarea))
        }
      />
    </div>
  );
}
