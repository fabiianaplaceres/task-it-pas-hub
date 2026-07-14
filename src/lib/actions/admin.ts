"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioActual } from "@/lib/auth";
import type { EstadoProceso } from "@/lib/types";

async function requireGerente() {
  const usuario = await getUsuarioActual();
  if (usuario.rol !== "gerente") {
    throw new Error("Solo un gerente puede administrar este recurso.");
  }
  return usuario;
}

export async function alternarEstadoProceso(procesoId: string, estadoActual: EstadoProceso) {
  await requireGerente();
  const supabase = await createClient();
  const nuevoEstado: EstadoProceso = estadoActual === "publicado" ? "borrador" : "publicado";

  const { error } = await supabase
    .from("procesos")
    .update({ estado: nuevoEstado })
    .eq("id", procesoId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/biblioteca");
}

export async function crearCategoria(formData: FormData) {
  await requireGerente();
  const supabase = await createClient();

  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) {
    throw new Error("El nombre de la categoría es obligatorio.");
  }

  const { count } = await supabase
    .from("categorias")
    .select("*", { count: "exact", head: true });

  const { error } = await supabase.from("categorias").insert({
    nombre,
    orden: (count ?? 0) + 1,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/");
}
