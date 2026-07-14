"use client";

import { useTransition } from "react";
import { alternarEstadoProceso } from "@/lib/actions/admin";
import type { EstadoProceso } from "@/lib/types";

export default function PublicarToggle({
  procesoId,
  estado,
}: {
  procesoId: string;
  estado: EstadoProceso;
}) {
  const [isPending, startTransition] = useTransition();
  const publicado = estado === "publicado";

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => alternarEstadoProceso(procesoId, estado))}
      className={`rounded-md px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
        publicado
          ? "bg-green-500/15 text-green-300 hover:bg-green-500/25"
          : "bg-surface-2 text-muted hover:bg-border"
      }`}
    >
      {publicado ? "Publicado" : "Borrador"}
    </button>
  );
}
