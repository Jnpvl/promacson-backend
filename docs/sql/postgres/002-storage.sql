-- Supabase Storage para imágenes del admin (Render / Vercel)
-- Ejecutar en SQL Editor después de 001-schema.sql

insert into storage.buckets (id, name, public)
values ('promacson', 'promacson', true)
on conflict (id) do update set public = excluded.public;

-- Lectura pública de objetos del bucket
drop policy if exists "promacson public read" on storage.objects;
create policy "promacson public read"
  on storage.objects for select
  using (bucket_id = 'promacson');

-- El API sube con SUPABASE_SERVICE_ROLE_KEY (bypass RLS). No hace falta policy de INSERT para anon.
