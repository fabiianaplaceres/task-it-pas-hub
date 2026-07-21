"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioActual } from "@/lib/auth";
import type { EstadoTarea, EtiquetaTarea } from "@/lib/types";

async function requireGerente() {
  const usuario = await getUsuarioActual();
  if (usuario.rol !== "gerente") {
    throw new Error("Solo un gerente puede realizar esta accion.");
  }
  return usuario;
}

function tareaCamposDesdeFormData(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const usuarioAsignadoId = String(formData.get("usuario_asignado_id") ?? "");
  const fechaLimite = String(formData.get("fecha_limite") ?? "");
  const etiqueta = String(formData.get("etiqueta") ?? "") as EtiquetaTarea | "";

  if (!titulo || !usuarioAsignadoId) {
    throw new Error("Título y asignado son obligatorios.");
  }

  return {
    titulo,
    descripcion: descripcion || null,
    usuario_asignado_id: usuarioAsignadoId,
    fecha_limite: fechaLimite || null,
    etiqueta: etiqueta || null,
  };
}

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
  const usuario = await requireGerente();
  const supabase = await createClient();
  const campos = tareaCamposDesdeFormData(formData);

  const { error } = await supabase.from("tareas").insert({
    ...campos,
    creado_por: usuario.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tareas");
  revalidatePath("/");
}

export async function actualizarTarea(tareaId: string, formData: FormData) {
  await requireGerente();
  const supabase = await createClient();
  const campos = tareaCamposDesdeFormData(formData);

  const { error } = await supabase.from("tareas").update(campos).eq("id", tareaId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tareas");
  revalidatePath(`/tareas/${tareaId}`);
  revalidatePath("/");
  revalidatePath("/equipo");
}

export async function eliminarTarea(tareaId: string) {
  await requireGerente();
  const supabase = await createClient();

  const { error } = await supabase.from("tareas").delete().eq("id", tareaId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tareas");
  revalidatePath("/");
  revalidatePath("/equipo");
  redirect("/tareas");
}
