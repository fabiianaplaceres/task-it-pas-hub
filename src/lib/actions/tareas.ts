"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioActual } from "@/lib/auth";
import type { EstadoTarea, EtiquetaTarea } from "@/lib/types";

export async function actualizarEstadoTarea(tareaId: string, estado: EstadoTarea) {
  const supabase = await createClient();
  const { error } = await supabase.from("tareas").update({ estado }).eq("id", tareaId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tareas");
  revalidatePath(`/tareas/${tareaId}`);
  revalidatePath("/");
}

export async function crearTarea(formData: FormData) {
  const usuario = await getUsuarioActual();
  if (usuario.rol !== "gerente") {
    throw new Error("Solo un gerente puede crear tareas.");
  }

  const supabase = await createClient();

  const titulo = String(formData.get("titulo") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const usuarioAsignadoId = String(formData.get("usuario_asignado_id") ?? "");
  const fechaLimite = String(formData.get("fecha_limite") ?? "");
  const etiqueta = String(formData.get("etiqueta") ?? "") as EtiquetaTarea | "";

  if (!titulo || !usuarioAsignadoId) {
    throw new Error("Título y asignado son obligatorios.");
  }

  const { error } = await supabase.from("tareas").insert({
    titulo,
    descripcion: descripcion || null,
    usuario_asignado_id: usuarioAsignadoId,
    creado_por: usuario.id,
    fecha_limite: fechaLimite || null,
    etiqueta: etiqueta || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tareas");
  revalidatePath("/");
}
