import Link from "next/link";
import { AlertTriangle, ArrowRight, BookOpen, CheckCircle2, Clock } from "lucide-react";
import { getUsuarioActual } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Tarea } from "@/lib/types";
import TaskCard from "@/components/task-card";

export default async function DashboardPage() {
  const usuario = await getUsuarioActual();
  const supabase = await createClient();

  const { data: tareas } = await supabase
    .from("tareas")
    .select("*, usuario_asignado:usuarios!usuario_asignado_id(*), proceso:procesos(id, titulo)")
    .eq("usuario_asignado_id", usuario.id)
    .order("fecha_limite", { ascending: true });

  const misTareas = (tareas ?? []) as Tarea[];
  const activas = misTareas.filter((t) => t.estado !== "completada");
  const pendientes = misTareas.filter((t) => t.estado === "pendiente");
  const enProgreso = misTareas.filter((t) => t.estado === "en_progreso");

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const proximasAVencer = activas.filter((t) => {
    if (!t.fecha_limite) return false;
    const limite = new Date(t.fecha_limite);
    const diffDias = (limite.getTime() - hoy.getTime()) / 86400000;
    return diffDias <= 2;
  });

  const { data: categorias } = await supabase
    .from("categorias")
    .select("*")
    .order("orden");

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-xl font-semibold">Hola, {usuario.nombre.split(" ")[0]}</h1>
      <p className="mt-1 text-sm text-muted">
        Este es el resumen de tu actividad en Task-it + EY Knowledge Hub.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Clock} label="Pendientes" value={pendientes.length} />
        <StatCard icon={CheckCircle2} label="En progreso" value={enProgreso.length} />
        <StatCard
          icon={AlertTriangle}
          label="Próximas a vencer"
          value={proximasAVencer.length}
          alert={proximasAVencer.length > 0}
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted">Mis tareas activas</h2>
        <Link
          href="/tareas"
          className="flex items-center gap-1 text-sm text-ey-yellow hover:underline"
        >
          Ver tablero
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {activas.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
          No tienes tareas activas por ahora.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activas.slice(0, 6).map((tarea) => (
            <TaskCard key={tarea.id} tarea={tarea} />
          ))}
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted">Biblioteca de procesos</h2>
        <Link
          href="/biblioteca"
          className="flex items-center gap-1 text-sm text-ey-yellow hover:underline"
        >
          Ver todo
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(categorias ?? []).map((cat) => (
          <Link
            key={cat.id}
            href={`/biblioteca?categoria=${cat.id}`}
            className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition hover:border-ey-yellow/60"
          >
            <BookOpen className="h-5 w-5 text-ey-yellow" />
            <p className="text-sm font-medium">{cat.nombre}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  alert,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${alert ? "text-red-400" : "text-ey-yellow"}`} />
        <p className="text-sm text-muted">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
