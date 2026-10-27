-- Ejecutar completo en Supabase > SQL Editor
alter table negocios add column if not exists whatsapp text;
revoke insert, update, delete on negocios from anon, authenticated;
grant update (nombre, tipo, hora_inicio, hora_fin, whatsapp) on negocios to authenticated;
create or replace function get_negocio_publico(p_slug text) returns json
language sql security definer set search_path=public as $$
  select json_build_object('nombre',n.nombre,'hora_inicio',n.hora_inicio,'hora_fin',n.hora_fin,'activo',n.vence>now(),'whatsapp',n.whatsapp,
    'servicios',coalesce((select json_agg(json_build_object('id',s.id,'nombre',s.nombre,'duracion',s.duracion,'precio',s.precio))
      from servicios s where s.negocio_id=n.id and s.activo),'[]'::json))
  from negocios n where n.slug=p_slug $$;
