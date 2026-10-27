-- Ejecutar en Supabase > SQL Editor
alter table citas add column if not exists notificado boolean not null default false;
