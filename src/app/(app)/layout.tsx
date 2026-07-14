import { Suspense } from "react";
import { getUsuarioActual } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getUsuarioActual();
  const supabase = await createClient();

  const [{ data: categorias }, { data: procesos }] = await Promise.all([
    supabase.from("categorias").select("*").order("orden"),
    supabase.from("procesos").select("id, categoria_id").eq("estado", "publicado"),
  ]);

  const procesoCountByCategoria: Record<string, number> = {};
  for (const p of procesos ?? []) {
    if (p.categoria_id) {
      procesoCountByCategoria[p.categoria_id] =
        (procesoCountByCategoria[p.categoria_id] ?? 0) + 1;
    }
  }

  return (
    <div className="flex w-full">
      <Suspense fallback={<div className="h-screen w-64 shrink-0 border-r border-border bg-surface" />}>
        <Sidebar
          usuario={usuario}
          categorias={categorias ?? []}
          procesoCountByCategoria={procesoCountByCategoria}
          totalProcesos={procesos?.length ?? 0}
        />
      </Suspense>
      <main className="min-h-screen flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}
