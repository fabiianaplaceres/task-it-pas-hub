-- Task-it + EY Knowledge Hub | Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecutado directamente contra el proyecto Supabase del curso.
-- Idempotente: puede correrse varias veces sin duplicar objetos.

create extension if not exists pgcrypto;

-- =========================================================
-- TABLAS
-- =========================================================

create table if not exists public.usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  email text not null unique,
  rol text not null default 'colaborador' check (rol in ('gerente', 'colaborador')),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  icono text,
  orden int not null default 0
);

create table if not exists public.procesos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion_corta text,
  categoria_id uuid references public.categorias (id) on delete set null,
  video_url text,
  duracion_video text,
  guia_contenido text,
  buenas_practicas text,
  estado text not null default 'borrador' check (estado in ('borrador', 'publicado')),
  es_estable boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.plantillas (
  id uuid primary key default gen_random_uuid(),
  proceso_id uuid references public.procesos (id) on delete cascade,
  nombre text not null,
  archivo_url text not null,
  tipo text not null check (tipo in ('docx', 'xlsx', 'pdf'))
);

create table if not exists public.tareas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'en_progreso', 'completada')),
  usuario_asignado_id uuid references public.usuarios (id) on delete set null,
  creado_por uuid references public.usuarios (id) on delete set null,
  fecha_limite date,
  etiqueta text check (etiqueta in ('cliente', 'interno', 'facturacion')),
  proceso_id uuid references public.procesos (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favoritos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios (id) on delete cascade,
  proceso_id uuid references public.procesos (id) on delete cascade,
  guardado_en timestamptz not null default now(),
  unique (usuario_id, proceso_id)
);

-- =========================================================
-- FUNCIONES Y TRIGGERS
-- =========================================================

-- Crea automáticamente la fila en public.usuarios cuando se registra un auth.users nuevo
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.usuarios (id, nombre, email, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'rol', 'colaborador')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at automático en tareas
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tareas_set_updated_at on public.tareas;
create trigger tareas_set_updated_at
  before update on public.tareas
  for each row execute function public.set_updated_at();

-- helper: verifica si un usuario tiene rol gerente (security definer evita recursion en RLS)
create or replace function public.is_gerente(uid uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.usuarios u where u.id = uid and u.rol = 'gerente'
  );
$$;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.usuarios enable row level security;
alter table public.categorias enable row level security;
alter table public.procesos enable row level security;
alter table public.plantillas enable row level security;
alter table public.tareas enable row level security;
alter table public.favoritos enable row level security;

-- usuarios: cualquier autenticado puede leer (para asignar tareas / ver equipo); cada quien edita su propia fila
drop policy if exists "usuarios_select_authenticated" on public.usuarios;
create policy "usuarios_select_authenticated" on public.usuarios
  for select to authenticated using (true);

drop policy if exists "usuarios_update_self" on public.usuarios;
create policy "usuarios_update_self" on public.usuarios
  for update to authenticated using (auth.uid() = id);

-- categorias y procesos: lectura para cualquier autenticado; escritura solo gerente
drop policy if exists "categorias_select_authenticated" on public.categorias;
create policy "categorias_select_authenticated" on public.categorias
  for select to authenticated using (true);

drop policy if exists "categorias_write_gerente" on public.categorias;
create policy "categorias_write_gerente" on public.categorias
  for all to authenticated
  using (public.is_gerente(auth.uid()))
  with check (public.is_gerente(auth.uid()));

drop policy if exists "procesos_select_authenticated" on public.procesos;
create policy "procesos_select_authenticated" on public.procesos
  for select to authenticated using (true);

drop policy if exists "procesos_write_gerente" on public.procesos;
create policy "procesos_write_gerente" on public.procesos
  for all to authenticated
  using (public.is_gerente(auth.uid()))
  with check (public.is_gerente(auth.uid()));

drop policy if exists "plantillas_select_authenticated" on public.plantillas;
create policy "plantillas_select_authenticated" on public.plantillas
  for select to authenticated using (true);

drop policy if exists "plantillas_write_gerente" on public.plantillas;
create policy "plantillas_write_gerente" on public.plantillas
  for all to authenticated
  using (public.is_gerente(auth.uid()))
  with check (public.is_gerente(auth.uid()));

-- tareas: el gerente ve/gestiona todo; el colaborador ve y actualiza estado de lo suyo
drop policy if exists "tareas_select" on public.tareas;
create policy "tareas_select" on public.tareas
  for select to authenticated
  using (
    usuario_asignado_id = auth.uid()
    or creado_por = auth.uid()
    or public.is_gerente(auth.uid())
  );

drop policy if exists "tareas_insert_gerente" on public.tareas;
create policy "tareas_insert_gerente" on public.tareas
  for insert to authenticated
  with check (public.is_gerente(auth.uid()));

drop policy if exists "tareas_update" on public.tareas;
create policy "tareas_update" on public.tareas
  for update to authenticated
  using (usuario_asignado_id = auth.uid() or public.is_gerente(auth.uid()));

drop policy if exists "tareas_delete_gerente" on public.tareas;
create policy "tareas_delete_gerente" on public.tareas
  for delete to authenticated
  using (public.is_gerente(auth.uid()));

-- favoritos: cada usuario gestiona solo los suyos
drop policy if exists "favoritos_all_self" on public.favoritos;
create policy "favoritos_all_self" on public.favoritos
  for all to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());
