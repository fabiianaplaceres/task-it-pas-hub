"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioActual } from "@/lib/auth";

export async function toggleFavorito(procesoId: string, path: string) {
  const usuario = await getUsuarioActual();
  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("favoritos")
    .select("id")
    .eq("usuario_id", usuario.id)
    .eq("proceso_id", procesoId)
    .maybeSingle();

  if (existente) {
    await supabase.from("favoritos").delete().eq("id", existente.id);
  } else {
    await supabase.from("favoritos").insert({
      usuario_id: usuario.id,
      proceso_id: procesoId,
    });
  }

  revalidatePath(path);
}
