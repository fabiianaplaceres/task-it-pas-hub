# Task It — PAS Hub

Aplicación web para la gestión de tareas, procesos y equipos de PAS, construida con **Next.js**, **Tailwind CSS** y **Supabase**.

## Requisitos previos

Para trabajar con este proyecto en local necesitás tener instalado lo siguiente:

| Requisito | Versión mínima | Notas |
|---|---|---|
| [Node.js](https://nodejs.org/) | 20 o superior | Necesario para ejecutar Next.js 16 |
| npm | 10 o superior | Incluido con Node.js |
| [Git](https://git-scm.com/) | Cualquiera reciente | Para clonar y versionar el repositorio |
| Cuenta de [Supabase](https://supabase.com/) | — | Base de datos, autenticación y API |
| Cuenta de [Netlify](https://www.netlify.com/) | — | Solo necesaria para el despliegue |

## Instalación

1. Cloná el repositorio:

```bash
git clone <URL-del-repositorio>
cd task-it-pas-hub
```

2. Instalá las dependencias:

```bash
npm install
```

3. Creá un archivo `.env.local` en la raíz del proyecto con las variables de entorno detalladas en la sección siguiente.

4. Levantá el servidor de desarrollo:

```bash
npm run dev
```

5. Abrí [http://localhost:3000](http://localhost:3000) en el navegador.

## Variables de entorno necesarias

Estas variables se obtienen desde el panel de tu proyecto en Supabase (**Project Settings → API**) y deben cargarse en `.env.local` (local) y en la configuración de variables de entorno de Netlify (producción).

| Variable | ¿Dónde se usa? | ¿Pública? | Descripción |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente y servidor | Sí | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente y servidor | Sí | Clave anónima (`anon key`) de Supabase, usada para autenticación y consultas respetando RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor (acciones `"use server"`) | **No — nunca exponer al navegador** | Clave de servicio (`service_role key`), usada en `src/lib/actions/admin.ts` para operaciones administrativas |

> ⚠️ La `SUPABASE_SERVICE_ROLE_KEY` tiene permisos totales sobre la base de datos. Nunca debe usarse en código de cliente ni commitearse al repositorio.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | Genera el build de producción |
| `npm run start` | Sirve el build de producción ya generado |
| `npm run lint` | Corre ESLint sobre el proyecto |

## Base de datos (Supabase)

El esquema y los datos de ejemplo se encuentran en la carpeta `supabase/`:

| Archivo | Contenido |
|---|---|
| `supabase/schema.sql` | Esquema de tablas, relaciones y políticas RLS |
| `supabase/seed.sql` | Datos de ejemplo (seed) para poblar el entorno |

Para aplicarlos, ejecutá el contenido de ambos archivos desde el **SQL Editor** del panel de Supabase, en orden (`schema.sql` primero, `seed.sql` después).

## Despliegue en Netlify

El proyecto ya incluye `netlify.toml` con la configuración de build y el plugin de Next.js. Para desplegarlo:

1. En Netlify, vincular el repositorio de GitHub del proyecto.
2. Cargar las tres variables de entorno de la tabla anterior en **Site configuration → Environment variables**.
3. Netlify detecta automáticamente el comando de build (`npm run build`) y el plugin `@netlify/plugin-nextjs`.
4. Disparar el deploy.

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (React 19) |
| Estilos | Tailwind CSS 4 |
| Backend / Auth / DB | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) |
| Iconos | lucide-react |
| Hosting | Netlify (`@netlify/plugin-nextjs`) |
| Lenguaje | TypeScript |
