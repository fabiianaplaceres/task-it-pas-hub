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
  X,
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
  onClick,
}: {
  href: string;
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
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
  onClose,
}: {
  usuario: Usuario;
  categorias: Categoria[];
  procesoCountByCategoria: Record<string, number>;
  totalProcesos: number;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoriaActiva = searchParams.get("categoria");
  const isBiblioteca =
    pathname.startsWith("/biblioteca") || pathname.startsWith("/favoritos");
  const isTareas = pathname === "/tareas" || pathname.startsWith("/tareas/");
  const isGerente = usuario.rol === "gerente";

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4">
        <Link href="/" onClick={onClose} className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-ey-yellow text-sm font-extrabold text-black">
            EY
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">PAS Hub</p>
            <p className="text-xs leading-tight text-muted">
              People Advisory Services
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="rounded-lg p-1.5 text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-foreground md:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <SectionLabel>General</SectionLabel>
        <div className="flex flex-col gap-0.5">
          <NavLink href="/" active={pathname === "/"} icon={Home} onClick={onClose}>
            Inicio
          </NavLink>
          <NavLink href="/tareas" active={isTareas} icon={LayoutGrid} onClick={onClose}>
            Tablero
          </NavLink>
          <NavLink href="/biblioteca" active={isBiblioteca} icon={BookOpen} onClick={onClose}>
            Biblioteca
          </NavLink>

          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              isBiblioteca ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="ml-4 flex flex-col gap-0.5 border-l border-border py-0.5 pl-2">
                <NavLink
                  href="/biblioteca"
                  active={pathname === "/biblioteca" && !categoriaActiva}
                  icon={Grid2x2}
                  badge={totalProcesos}
                  onClick={onClose}
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
                    onClick={onClose}
                  >
                    {cat.nombre}
                  </NavLink>
                ))}
                <NavLink
                  href="/favoritos"
                  active={pathname === "/favoritos"}
                  icon={Star}
                  onClick={onClose}
                >
                  Mis favoritos
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        {isGerente && (
          <>
            <SectionLabel>Equipo (gerente)</SectionLabel>
            <NavLink href="/equipo" active={pathname === "/equipo"} icon={Users} onClick={onClose}>
              Carga del equipo
            </NavLink>

            <SectionLabel>Administración</SectionLabel>
            <NavLink href="/admin" active={pathname === "/admin"} icon={ShieldCheck} onClick={onClose}>
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
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
