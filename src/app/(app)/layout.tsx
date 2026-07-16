import { getUsuarioActual } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";

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
    <AppShell
      usuario={usuario}
      categorias={categorias ?? []}
      procesoCountByCategoria={procesoCountByCategoria}
      totalProcesos={procesos?.length ?? 0}
    >
      {children}
    </AppShell>
  );
}
