import Link from "next/link";
import { Clock, AlertCircle, ArrowRight } from "lucide-react";
import { ETIQUETA_LABEL, type Tarea } from "@/lib/types";

const ETIQUETA_STYLES: Record<string, string> = {
  cliente: "bg-blue-500/15 text-blue-300",
  interno: "bg-purple-500/15 text-purple-300",
  facturacion: "bg-green-500/15 text-green-300",
};

function formatFecha(fecha: string) {
  const d = new Date(fecha + "T00:00:00");
  return d.toLocaleDateString("es-VE", { day: "2-digit", month: "short" });
}

function diasHasta(fecha: string) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const limite = new Date(fecha + "T00:00:00");
  return Math.round((limite.getTime() - hoy.getTime()) / 86400000);
}

export default function TaskCard({
  tarea,
  showAsignado = false,
}: {
  tarea: Tarea;
  showAsignado?: boolean;
}) {
  const dias = tarea.fecha_limite ? diasHasta(tarea.fecha_limite) : null;
  const vencida = dias !== null && dias < 0 && tarea.estado !== "completada";
  const venceHoy = dias === 0 && tarea.estado !== "completada";

  return (
    <Link
      href={`/tareas/${tarea.id}`}
      className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition hover:border-ey-yellow/60"
    >
      <p className="text-sm font-medium leading-snug">{tarea.titulo}</p>

      {showAsignado && tarea.usuario_asignado && (
        <p className="text-xs text-muted">{tarea.usuario_asignado.nombre}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {tarea.etiqueta && (
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${
              ETIQUETA_STYLES[tarea.etiqueta] ?? "bg-surface-2 text-muted"
            }`}
          >
            {ETIQUETA_LABEL[tarea.etiqueta]}
          </span>
        )}

        {tarea.estado === "completada" ? (
          <span className="text-xs text-green-400">✓ Completada</span>
        ) : vencida || venceHoy ? (
          <span className="flex items-center gap-1 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            {venceHoy ? "Vence hoy" : "Vencida"}
          </span>
        ) : tarea.fecha_limite ? (
          <span className="flex items-center gap-1 text-xs text-muted">
            <Clock className="h-3.5 w-3.5" />
            {formatFecha(tarea.fecha_limite)}
          </span>
        ) : null}
      </div>

      {tarea.proceso && (
        <span className="flex items-center gap-1 text-xs text-ey-yellow">
          Ver proceso en la biblioteca
          <ArrowRight className="h-3 w-3" />
        </span>
      )}
    </Link>
  );
}
