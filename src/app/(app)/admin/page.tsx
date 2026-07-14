import { redirect } from "next/navigation";
import { FolderKanban, Plus, ShieldCheck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioActual } from "@/lib/auth";
import { crearCategoria } from "@/lib/actions/admin";
import PublicarToggle from "@/components/publicar-toggle";
import type { Categoria, Proceso, Usuario } from "@/lib/types";

export default async function AdminPage() {
  const usuario = await getUsuarioActual();
  if (usuario.rol !== "gerente") {
    redirect("/");
  }

  const supabase = await createClient();

  const [{ data: procesos }, { data: categorias }, { data: usuarios }] = await Promise.all([
    supabase
      .from("procesos")
      .select("*, categorias(*)")
      .order("created_at", { ascending: false }),
    supabase.from("categorias").select("*").order("orden"),
    supabase.from("usuarios").select("*").order("nombre"),
  ]);

  const listaProcesos = (procesos as Proceso[] | null) ?? [];
  const listaCategorias = (categorias as Categoria[] | null) ?? [];
  const listaUsuarios = (usuarios as Usuario[] | null) ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-ey-yellow" />
        <h1 className="text-xl font-semibold">Panel de administración</h1>
      </div>
      <p className="mt-1 text-sm text-muted">
        Gestión de procesos, categorías y usuarios de PAS Hub.
      </p>

      <section className="mt-8">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-muted" />
          <h2 className="text-sm font-semibold text-muted">
            Procesos ({listaProcesos.length})
          </h2>
        </div>
        <div className="mt-3 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2 text-xs text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Título</th>
                <th className="px-4 py-2 font-medium">Categoría</th>
                <th className="px-4 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listaProcesos.map((proceso) => (
                <tr key={proceso.id} className="bg-surface">
                  <td className="px-4 py-2.5">{proceso.titulo}</td>
                  <td className="px-4 py-2.5 text-muted">
                    {(proceso.categorias as Categoria | null)?.nombre ?? "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <PublicarToggle procesoId={proceso.id} estado={proceso.estado} />
                  </td>
                </tr>
              ))}
              {listaProcesos.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-muted">
                    No hay procesos cargados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-muted">
          Categorías ({listaCategorias.length})
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {listaCategorias.map((cat) => (
            <span
              key={cat.id}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
            >
              {cat.nombre}
            </span>
          ))}
        </div>
        <form action={crearCategoria} className="mt-3 flex max-w-sm gap-2">
          <input
            name="nombre"
            placeholder="Nueva categoría"
            required
            className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-ey-yellow px-3 py-2 text-sm font-medium text-black transition hover:brightness-95"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        </form>
      </section>

      <section className="mt-8">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted" />
          <h2 className="text-sm font-semibold text-muted">
            Usuarios ({listaUsuarios.length})
          </h2>
        </div>
        <div className="mt-3 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2 text-xs text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Rol</th>
                <th className="px-4 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listaUsuarios.map((u) => (
                <tr key={u.id} className="bg-surface">
                  <td className="px-4 py-2.5">{u.nombre}</td>
                  <td className="px-4 py-2.5 text-muted">{u.email}</td>
                  <td className="px-4 py-2.5 capitalize">{u.rol}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs ${
                        u.activo
                          ? "bg-green-500/15 text-green-300"
                          : "bg-surface-2 text-muted"
                      }`}
                    >
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
