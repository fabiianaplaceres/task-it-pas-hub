"use client";

import { useTransition } from "react";
import { usePathname } from "next/navigation";
import { Star } from "lucide-react";
import { toggleFavorito } from "@/lib/actions/favoritos";

export default function FavoritoButton({
  procesoId,
  esFavorito,
}: {
  procesoId: string;
  esFavorito: boolean;
}) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(() => toggleFavorito(procesoId, pathname));
      }}
      aria-pressed={esFavorito}
      title={esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition disabled:opacity-50 ${
        esFavorito
          ? "border-ey-yellow/60 bg-ey-yellow/10 text-ey-yellow"
          : "border-border text-muted hover:border-ey-yellow/60 hover:text-ey-yellow"
      }`}
    >
      <Star className="h-4 w-4" fill={esFavorito ? "currentColor" : "none"} />
    </button>
  );
}
