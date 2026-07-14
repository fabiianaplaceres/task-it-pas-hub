"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  Users,
  BookOpen,
  Star,
  ShieldCheck,
  LogOut,
  RefreshCw,
  UserPlus,
  Receipt,
  ListChecks,
  Grid2x2,
  Home,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";
import type { Categoria, Usuario } from "@/lib/types";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "refresh-cw": RefreshCw,
  "user-plus": UserPlus,
  receipt: Receipt,
  "list-checks": ListChecks,
};

function NavLink({
  href,
  active,
  icon: Icon,
  children,
  badge,
}: {
  href: string;
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition ${
        active
          ? "bg-surface-2 text-foreground"
          : "text-muted hover:bg-surface-2 hover:text-foreground"
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {children}
      </span>
      {typeof badge === "number" && (
        <span className="rounded-full bg-border px-1.5 py-0.5 text-[11px] text-muted">
          {badge}
        </span>
      )}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 mt-4 px-3 text-[11px] font-semibold tracking-wide text-muted">
      {children}
    </p>
  );
}

export default function Sidebar({
  usuario,
  categorias,
  procesoCountByCategoria,
  totalProcesos,
}: {
  usuario: Usuario;
  categorias: Categoria[];
  procesoCountByCategoria: Record<string, number>;
  totalProcesos: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoriaActiva = searchParams.get("categoria");
  const isBiblioteca =
    pathname.startsWith("/biblioteca") || pathname.startsWith("/favoritos");
  const isGerente = usuario.rol === "gerente";

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-3 border-b border-border px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-ey-yellow text-sm font-extrabold text-black">
          EY
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">PAS Hub</p>
          <p className="text-xs leading-tight text-muted">
            People Advisory Services
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {isBiblioteca ? (
          <>
            <SectionLabel>Categorías</SectionLabel>
            <div className="flex flex-col gap-0.5">
              <NavLink
                href="/biblioteca"
                active={pathname === "/biblioteca" && !categoriaActiva}
                icon={Grid2x2}
                badge={totalProcesos}
              >
                Todos
              </NavLink>
              {categorias.map((cat) => (
                <NavLink
                  key={cat.id}
                  href={`/biblioteca?categoria=${cat.id}`}
                  active={pathname === "/biblioteca" && categoriaActiva === cat.id}
                  icon={CATEGORY_ICONS[cat.icono ?? ""] ?? Grid2x2}
                  badge={procesoCountByCategoria[cat.id] ?? 0}
                >
                  {cat.nombre}
                </NavLink>
              ))}
              <NavLink href="/favoritos" active={pathname === "/favoritos"} icon={Star}>
                Mis favoritos
              </NavLink>
            </div>

            <SectionLabel>Plataforma</SectionLabel>
            <NavLink href="/tareas" active={false} icon={LayoutGrid}>
              Ir a mis tareas
            </NavLink>
          </>
        ) : (
          <>
            <SectionLabel>General</SectionLabel>
            <div className="flex flex-col gap-0.5">
              <NavLink href="/" active={pathname === "/"} icon={Home}>
                Inicio
              </NavLink>
              <NavLink href="/tareas" active={pathname === "/tareas"} icon={LayoutGrid}>
                Tablero
              </NavLink>
            </div>

            {isGerente && (
              <>
                <SectionLabel>Equipo (gerente)</SectionLabel>
                <NavLink href="/equipo" active={pathname === "/equipo"} icon={Users}>
                  Carga del equipo
                </NavLink>
              </>
            )}

            <SectionLabel>Plataforma</SectionLabel>
            <NavLink href="/biblioteca" active={false} icon={BookOpen}>
              Biblioteca de procesos
            </NavLink>
          </>
        )}

        {isGerente && (
          <>
            <SectionLabel>Administración</SectionLabel>
            <NavLink href="/admin" active={pathname === "/admin"} icon={ShieldCheck}>
              Panel de administración
            </NavLink>
          </>
        )}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex items-center gap-2 rounded-lg px-1 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold">
            {usuario.nombre.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm">{usuario.nombre}</p>
            <p className="text-xs capitalize text-muted">{usuario.rol}</p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
