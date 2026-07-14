-- Task-it + EY Knowledge Hub | Datos de prueba
-- Cuentas demo (reemplazar por el equipo real de PAS antes de la entrega final):
--   gerente@pashub.test     / Demo1234!   (rol: gerente)
--   colaborador@pashub.test / Demo1234!   (rol: colaborador)
--   ana@pashub.test         / Demo1234!   (rol: colaborador)

-- 1) Usuarios demo en auth.users (dispara el trigger que crea la fila en public.usuarios)
-- Nota: los campos *_token y email_change* deben quedar en '' (no NULL), porque
-- GoTrue (Supabase Auth) rechaza el login con "Invalid login credentials" si son NULL.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change,
  email_change_token_new, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token
)
select
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  u.email,
  crypt('Demo1234!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nombre', u.nombre, 'rol', u.rol),
  '', '', '', '', '', '', '', ''
from (values
  ('gerente@pashub.test', 'Fabiana Gerente', 'gerente'),
  ('colaborador@pashub.test', 'Carlos Colaborador', 'colaborador'),
  ('ana@pashub.test', 'Ana Consultora', 'colaborador')
) as u(email, nombre, rol)
where not exists (select 1 from auth.users where email = u.email);

-- 2) Categorías de la Sección B
insert into public.categorias (nombre, icono, orden)
select * from (values
  ('Clientes recurrentes', 'refresh-cw', 1),
  ('Clientes nuevos', 'user-plus', 2),
  ('Facturación', 'receipt', 3),
  ('Otros procesos clave', 'list-checks', 4)
) as c(nombre, icono, orden)
where not exists (select 1 from public.categorias where categorias.nombre = c.nombre);

-- 3) Procesos publicados de ejemplo
insert into public.procesos (titulo, descripcion_corta, categoria_id, video_url, duracion_video, guia_contenido, buenas_practicas, estado, es_estable)
select
  p.titulo, p.descripcion_corta, cat.id, p.video_url, p.duracion_video, p.guia_contenido, p.buenas_practicas, 'publicado', true
from (values
  ('Elaboración de carta de trabajo', 'Cómo redactar y enviar la carta de trabajo a un cliente recurrente.', 'Clientes recurrentes', '', '4:30',
   E'1. Verificar los datos del cliente en el sistema.\n2. Usar la plantilla oficial de carta de trabajo.\n3. Completar alcance, honorarios y plazos.\n4. Enviar a revisión del gerente antes de remitir al cliente.',
   'Nunca modificar las cláusulas estándar sin aprobación del gerente. Confirmar siempre el correo de contacto vigente del cliente.'),
  ('Cómo calcular honorarios', 'Metodología estándar para calcular honorarios de facturación mensual.', 'Facturación', '', '5:15',
   E'1. Tomar las horas cargadas del periodo.\n2. Aplicar la tarifa según el nivel del consultor.\n3. Sumar gastos reembolsables si aplica.\n4. Generar el borrador de factura para revisión.',
   'Doble revisión de las tarifas antes de emitir. Cuadrar contra el engagement letter del cliente.'),
  ('Apertura de engagement en Interact', 'Pasos para abrir un nuevo engagement en el sistema Interact.', 'Clientes nuevos', '', '3:50',
   E'1. Solicitar el código de cliente nuevo.\n2. Registrar el engagement en Interact con el código de servicio correcto.\n3. Asociar al equipo asignado.\n4. Confirmar apertura con el gerente de cuenta.',
   'Completar el formulario de aceptación de cliente (KYC) antes de abrir el engagement.'),
  ('Carga de horas en el sistema', 'Proceso estándar semanal de carga de horas del equipo.', 'Otros procesos clave', '', '6:00',
   E'1. Ingresar al sistema de timesheet.\n2. Cargar horas por cliente/proyecto diariamente.\n3. Enviar para aprobación del gerente cada viernes.\n4. Corregir rechazos antes del cierre de semana.',
   'Cargar las horas a diario, no acumular al final de semana, para evitar errores de memoria.')
) as p(titulo, descripcion_corta, categoria_nombre, video_url, duracion_video, guia_contenido, buenas_practicas)
join public.categorias cat on cat.nombre = p.categoria_nombre
where not exists (select 1 from public.procesos where procesos.titulo = p.titulo);

-- 4) Tareas demo (vinculadas a los usuarios y procesos anteriores)
insert into public.tareas (titulo, descripcion, estado, usuario_asignado_id, creado_por, fecha_limite, etiqueta, proceso_id)
select
  t.titulo, t.descripcion, t.estado,
  asignado.id, gerente.id, t.fecha_limite, t.etiqueta, proc.id
from (values
  ('Elaborar carta de trabajo - Cliente X', 'Redactar y enviar la carta de trabajo para el cliente recurrente X.', 'pendiente', 'colaborador@pashub.test', current_date + 2, 'cliente', 'Elaboración de carta de trabajo'),
  ('Revisar contrato determinado - Empresa Y', 'Revisión legal del contrato a término fijo.', 'pendiente', 'ana@pashub.test', current_date + 5, 'cliente', null),
  ('Propuesta comercial - Grupo Z', 'Preparar propuesta comercial para el Grupo Z.', 'en_progreso', 'colaborador@pashub.test', current_date + 3, 'interno', null),
  ('Carga de horas Q2 en sistema', 'Cargar las horas del segundo trimestre.', 'en_progreso', 'ana@pashub.test', current_date + 1, 'interno', 'Carga de horas en el sistema'),
  ('MSA - Cliente Nuevo ABC', 'Firmar y archivar el Master Service Agreement.', 'completada', 'colaborador@pashub.test', current_date - 1, 'cliente', null),
  ('Factura julio - Cliente recurrente', 'Emitir factura de julio para cliente recurrente.', 'completada', 'ana@pashub.test', current_date - 2, 'facturacion', 'Cómo calcular honorarios')
) as t(titulo, descripcion, estado, asignado_email, fecha_limite, etiqueta, proceso_titulo)
join public.usuarios asignado on asignado.email = t.asignado_email
join public.usuarios gerente on gerente.email = 'gerente@pashub.test'
left join public.procesos proc on proc.titulo = t.proceso_titulo
where not exists (select 1 from public.tareas where tareas.titulo = t.titulo);
