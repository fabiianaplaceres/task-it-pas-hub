"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/sidebar";
import type { Categoria, Usuario } from "@/lib/types";

export default function AppShell({
  usuario,
  categorias,
  procesoCountByCategoria,
  totalProcesos,
  children,
}: {
  usuario: Usuario;
  categorias: Categoria[];
  procesoCountByCategoria: Record<string, number>;
  totalProcesos: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-30 bg-black/60 transition-opacity duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          usuario={usuario}
          categorias={categorias}
          procesoCountByCategoria={procesoCountByCategoria}
          totalProcesos={totalProcesos}
          onClose={() => setOpen(false)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className="rounded-lg p-2 text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold">PAS Hub</span>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
