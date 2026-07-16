"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUsuarioActual } from "@/lib/auth";
import type { EstadoProceso, Rol, TipoPlantilla } from "@/lib/types";

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

export async function crearUsuario(formData: FormData) {
  await requireGerente();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rol = String(formData.get("rol") ?? "colaborador") as Rol;

  if (!nombre || !email || !password) {
    throw new Error("Nombre, email y contraseña son obligatorios.");
  }
  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  }
  if (rol !== "gerente" && rol !== "colaborador") {
    throw new Error("Rol inválido.");
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre, rol },
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
}

function procesoCamposDesdeFormData(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const descripcionCorta = String(formData.get("descripcion_corta") ?? "").trim();
  const categoriaId = String(formData.get("categoria_id") ?? "").trim();
  const videoUrl = String(formData.get("video_url") ?? "").trim();
  const duracionVideo = String(formData.get("duracion_video") ?? "").trim();
  const guiaContenido = String(formData.get("guia_contenido") ?? "").trim();
  const buenasPracticas = String(formData.get("buenas_practicas") ?? "").trim();
  const esEstable = formData.get("es_estable") === "on";
  const publicar = formData.get("publicar") === "on";

  if (!titulo) {
    throw new Error("El título del proceso es obligatorio.");
  }

  return {
    titulo,
    descripcion_corta: descripcionCorta || null,
    categoria_id: categoriaId || null,
    video_url: videoUrl || null,
    duracion_video: duracionVideo || null,
    guia_contenido: guiaContenido || null,
    buenas_practicas: buenasPracticas || null,
    es_estable: esEstable,
    estado: (publicar ? "publicado" : "borrador") as EstadoProceso,
  };
}

export async function crearProceso(formData: FormData) {
  await requireGerente();
  const supabase = await createClient();
  const campos = procesoCamposDesdeFormData(formData);

  const { data, error } = await supabase.from("procesos").insert(campos).select("id").single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/biblioteca");
  redirect(`/admin/procesos/${data.id}`);
}

export async function actualizarProceso(procesoId: string, formData: FormData) {
  await requireGerente();
  const supabase = await createClient();
  const campos = procesoCamposDesdeFormData(formData);

  const { error } = await supabase.from("procesos").update(campos).eq("id", procesoId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/biblioteca");
  revalidatePath(`/biblioteca/${procesoId}`);
  revalidatePath(`/admin/procesos/${procesoId}`);
}

export async function agregarPlantilla(procesoId: string, formData: FormData) {
  await requireGerente();
  const supabase = await createClient();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const archivoUrl = String(formData.get("archivo_url") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "") as TipoPlantilla;

  if (!nombre || !archivoUrl) {
    throw new Error("Nombre y URL del archivo son obligatorios.");
  }
  if (!["docx", "xlsx", "pdf"].includes(tipo)) {
    throw new Error("Tipo de plantilla inválido.");
  }

  const { error } = await supabase.from("plantillas").insert({
    proceso_id: procesoId,
    nombre,
    archivo_url: archivoUrl,
    tipo,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/procesos/${procesoId}`);
  revalidatePath(`/biblioteca/${procesoId}`);
}

export async function eliminarPlantilla(plantillaId: string, procesoId: string) {
  await requireGerente();
  const supabase = await createClient();

  const { error } = await supabase.from("plantillas").delete().eq("id", plantillaId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/procesos/${procesoId}`);
  revalidatePath(`/biblioteca/${procesoId}`);
}
