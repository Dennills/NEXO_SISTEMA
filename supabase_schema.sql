-- ==============================================================================
-- NEXO PLATFORM - SCHEMA COMPLETO DE BASE DE DATOS POSTGRESQL (SUPABASE)
-- Todas las tablas conectadas con Foreign Keys explícitas y Auth configurado
-- ==============================================================================

-- 1. Extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. TABLAS CON RELACIONES EXPLÍCITAS (FOREIGN KEYS CONECTADAS)
-- ==============================================================================

-- 2.1 Perfiles vinculados directamente a auth.users de Supabase
create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  nombre text not null,
  rol text not null check (rol in ('ADMINISTRADOR', 'OPERADOR')),
  negocio_nombre text default 'Confecciones & Almacén Gómez',
  created_at timestamp with time zone default now()
);

-- 2.2 Casas vinculadas al perfil creador
create table if not exists public.casas (
  id text primary key,
  usuario_id uuid references public.perfiles(id) on delete set null,
  nombre text not null,
  descripcion text default '',
  color text default '#00cec8',
  icon text default 'home',
  created_at timestamp with time zone default now()
);

-- 2.3 Bloques vinculados a una Casa
create table if not exists public.bloques (
  id text primary key,
  casa_id text not null,
  nombre text not null,
  descripcion text default '',
  icono text default 'box',
  campos jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  constraint fk_bloques_casa foreign key (casa_id) references public.casas(id) on delete cascade
);

-- 2.4 Registros vinculados al Bloque y a la Casa
create table if not exists public.registros (
  id text primary key,
  bloque_id text not null,
  casa_id text not null,
  datos jsonb not null default '{}'::jsonb,
  creado_por text default 'Operador',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint fk_registros_bloque foreign key (bloque_id) references public.bloques(id) on delete cascade,
  constraint fk_registros_casa foreign key (casa_id) references public.casas(id) on delete cascade
);

-- 2.5 Relaciones (⋈) conectando Bloque Origen y Bloque Destino dentro de la Casa
create table if not exists public.relaciones (
  id text primary key,
  casa_id text not null,
  nombre text not null,
  source_block_id text not null,
  target_block_id text not null,
  source_field_id text not null,
  target_field_id text not null,
  calculated_fields jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  constraint fk_relaciones_casa foreign key (casa_id) references public.casas(id) on delete cascade,
  constraint fk_relaciones_source_block foreign key (source_block_id) references public.bloques(id) on delete cascade,
  constraint fk_relaciones_target_block foreign key (target_block_id) references public.bloques(id) on delete cascade
);

-- ==============================================================================
-- 3. HABILITAR PERMISOS RLS (Row Level Security)
-- ==============================================================================
alter table public.perfiles enable row level security;
alter table public.casas enable row level security;
alter table public.bloques enable row level security;
alter table public.registros enable row level security;
alter table public.relaciones enable row level security;

-- Políticas de acceso para la aplicación web
drop policy if exists "Acceso total perfiles" on public.perfiles;
create policy "Acceso total perfiles" on public.perfiles for all using (true);

drop policy if exists "Acceso total casas" on public.casas;
create policy "Acceso total casas" on public.casas for all using (true);

drop policy if exists "Acceso total bloques" on public.bloques;
create policy "Acceso total bloques" on public.bloques for all using (true);

drop policy if exists "Acceso total registros" on public.registros;
create policy "Acceso total registros" on public.registros for all using (true);

drop policy if exists "Acceso total relaciones" on public.relaciones;
create policy "Acceso total relaciones" on public.relaciones for all using (true);

-- ==============================================================================
-- 4. CONFIGURACIÓN DE CUENTAS DE LOGIN EN SUPABASE AUTH (CON CONTRASEÑAS HASH)
-- Administrador: admin@nexo.pe / admin123
-- Operario: operador@nexo.pe / operador123
-- ==============================================================================

-- 4.1 Insertar usuarios en auth.users con contraseñas encriptadas (Bcrypt)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@nexo.pe',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"nombre":"Marta Gómez","rol":"ADMINISTRADOR"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'operador@nexo.pe',
    crypt('operador123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"nombre":"Carlos Rojas","rol":"OPERADOR"}',
    now(),
    now()
  )
on conflict (id) do update set
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = now();

-- 4.2 Identidades en auth.identities (Requerido por Supabase para login con contraseña)
insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    '{"sub":"a0000000-0000-0000-0000-000000000001","email":"admin@nexo.pe"}',
    'email',
    'admin@nexo.pe',
    now(),
    now(),
    now()
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    '{"sub":"a0000000-0000-0000-0000-000000000002","email":"operador@nexo.pe"}',
    'email',
    'operador@nexo.pe',
    now(),
    now(),
    now()
  )
on conflict (provider, provider_id) do nothing;

-- 4.3 Vincular a la tabla perfiles con sus roles
insert into public.perfiles (id, email, nombre, rol, negocio_nombre)
values 
  ('a0000000-0000-0000-0000-000000000001', 'admin@nexo.pe', 'Marta Gómez', 'ADMINISTRADOR', 'Confecciones & Almacén Gómez'),
  ('a0000000-0000-0000-0000-000000000002', 'operador@nexo.pe', 'Carlos Rojas', 'OPERADOR', 'Confecciones & Almacén Gómez')
on conflict (id) do update set
  rol = excluded.rol,
  nombre = excluded.nombre;

-- ==============================================================================
-- 5. DATOS SEMILLA (Casas, Bloques, Inventario y Relación ⋈)
-- ==============================================================================

-- Casa
insert into public.casas (id, usuario_id, nombre, descripcion, color, icon)
values (
  'house-almacen-ventas',
  'a0000000-0000-0000-0000-000000000001',
  'Almacén y ventas',
  'Controla existencias, productos y ventas diarias de tu taller.',
  '#00cec8',
  'bag'
) on conflict (id) do nothing;

-- Bloques
insert into public.bloques (id, casa_id, nombre, descripcion, icono, campos)
values 
(
  'block-productos',
  'house-almacen-ventas',
  'Productos',
  'Catálogo de existencias y precios unitarios',
  'box',
  '[
    {"id": "nombre", "name": "Nombre del producto", "type": "text", "required": true},
    {"id": "precio", "name": "Precio unitario", "type": "currency", "required": true, "unit": "$"},
    {"id": "stock", "name": "Stock disponible", "type": "number", "required": true, "unit": "uds."},
    {"id": "categoria", "name": "Categoría", "type": "category", "required": false, "options": ["Insumos", "Textil", "Accesorios"]}
  ]'::jsonb
),
(
  'block-ventas',
  'house-almacen-ventas',
  'Ventas diarias',
  'Registro periódico de salidas y ventas',
  'grid',
  '[
    {"id": "producto", "name": "Producto vendido", "type": "text", "required": true},
    {"id": "cantidad", "name": "Unidades vendidas", "type": "number", "required": true, "unit": "uds."},
    {"id": "fecha", "name": "Fecha de venta", "type": "date", "required": true},
    {"id": "cliente", "name": "Cliente", "type": "text", "required": false}
  ]'::jsonb
),
(
  'block-pedidos',
  'house-almacen-ventas',
  'Pedidos a proveedores',
  'Seguimiento a compromisos de entrega e hilos',
  'truck',
  '[
    {"id": "proveedor", "name": "Proveedor", "type": "text", "required": true},
    {"id": "material", "name": "Material / Insumo", "type": "text", "required": true},
    {"id": "fecha_entrega", "name": "Fecha comprometida", "type": "date", "required": true},
    {"id": "estado", "name": "Estado del pedido", "type": "status", "required": true, "options": ["Pendiente", "Atrasado", "Completado"]}
  ]'::jsonb
)
on conflict (id) do nothing;

-- Registros
insert into public.registros (id, bloque_id, casa_id, datos, creado_por)
values
  ('rec-p1', 'block-productos', 'house-almacen-ventas', '{"nombre": "Tela azul marino", "precio": 18.5, "stock": 42, "categoria": "Textil"}'::jsonb, 'Marta Gómez'),
  ('rec-p2', 'block-productos', 'house-almacen-ventas', '{"nombre": "Hilo blanco", "precio": 3.75, "stock": 8, "categoria": "Insumos"}'::jsonb, 'Marta Gómez'),
  ('rec-p3', 'block-productos', 'house-almacen-ventas', '{"nombre": "Botones de nácar", "precio": 6.2, "stock": 0, "categoria": "Accesorios"}'::jsonb, 'Marta Gómez'),
  ('rec-p4', 'block-productos', 'house-almacen-ventas', '{"nombre": "Cremallera beige", "precio": 4.8, "stock": 15, "categoria": "Accesorios"}'::jsonb, 'Marta Gómez'),
  ('rec-p5', 'block-productos', 'house-almacen-ventas', '{"nombre": "Cinta de algodón", "precio": 7.25, "stock": 27, "categoria": "Insumos"}'::jsonb, 'Marta Gómez'),
  ('rec-v1', 'block-ventas', 'house-almacen-ventas', '{"producto": "Tela azul marino", "cantidad": 18, "fecha": "2026-11-16", "cliente": "Taller San Pedro"}'::jsonb, 'Carlos Rojas'),
  ('rec-v2', 'block-ventas', 'house-almacen-ventas', '{"producto": "Hilo blanco", "cantidad": 31, "fecha": "2026-11-16", "cliente": "Confecciones Lima"}'::jsonb, 'Carlos Rojas'),
  ('rec-v3', 'block-ventas', 'house-almacen-ventas', '{"producto": "Botones de nácar", "cantidad": 24, "fecha": "2026-11-15", "cliente": "Diseños Camila"}'::jsonb, 'Carlos Rojas'),
  ('rec-ped1', 'block-pedidos', 'house-almacen-ventas', '{"proveedor": "Hilandería Norte", "material": "Hilaza de algodón 40/1", "fecha_entrega": "2026-11-12", "estado": "Atrasado"}'::jsonb, 'Marta Gómez')
on conflict (id) do nothing;

-- Relación ⋈
insert into public.relaciones (id, casa_id, nombre, source_block_id, target_block_id, source_field_id, target_field_id, calculated_fields)
values (
  'rel-productos-ventas',
  'house-almacen-ventas',
  'Cruce Productos ⋈ Ventas diarias',
  'block-productos',
  'block-ventas',
  'nombre',
  'producto',
  '[{"id": "total_ingreso", "label": "Total generado", "operation": "multiply", "sourceFieldId": "precio", "targetFieldId": "cantidad", "format": "currency"}]'::jsonb
) on conflict (id) do nothing;
