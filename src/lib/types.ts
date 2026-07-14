export type Rol = "gerente" | "colaborador";
export type EstadoTarea = "pendiente" | "en_progreso" | "completada";
export type EtiquetaTarea = "cliente" | "interno" | "facturacion";
export type EstadoProceso = "borrador" | "publicado";
export type TipoPlantilla = "docx" | "xlsx" | "pdf";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  created_at: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  icono: string | null;
  orden: number;
}

export interface Proceso {
  id: string;
  titulo: string;
  descripcion_corta: string | null;
  categoria_id: string | null;
  video_url: string | null;
  duracion_video: string | null;
  guia_contenido: string | null;
  buenas_practicas: string | null;
  estado: EstadoProceso;
  es_estable: boolean;
  created_at: string;
  categorias?: Categoria | null;
}

export interface Plantilla {
  id: string;
  proceso_id: string;
  nombre: string;
  archivo_url: string;
  tipo: TipoPlantilla;
}

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string | null;
  estado: EstadoTarea;
  usuario_asignado_id: string | null;
  creado_por: string | null;
  fecha_limite: string | null;
  etiqueta: EtiquetaTarea | null;
  proceso_id: string | null;
  created_at: string;
  updated_at: string;
  usuario_asignado?: Usuario | null;
  proceso?: Pick<Proceso, "id" | "titulo"> | null;
}

export interface Favorito {
  id: string;
  usuario_id: string;
  proceso_id: string;
  guardado_en: string;
}

export const ETIQUETA_LABEL: Record<EtiquetaTarea, string> = {
  cliente: "Cliente",
  interno: "Interno",
  facturacion: "Facturación",
};

export const ESTADO_TAREA_LABEL: Record<EstadoTarea, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
};
