-- Ejecutar completo en Supabase > SQL Editor
alter table negocios alter column plan set default 'prueba';
alter table negocios add column if not exists vence timestamptz not null default now() + interval '14 days';
-- Tu negocio actual queda activo 1 año
update negocios set plan='activo', vence=now()+interval '1 year' where slug='barberia-don-pedro';

-- Crea el negocio automáticamente al registrarse (funciona aunque el correo se confirme después)
create or replace function crear_negocio_nuevo() returns trigger language plpgsql security definer set search_path=public as $$
declare nom text := coalesce(nullif(trim(new.raw_user_meta_data->>'nombre'),''),'Mi negocio');
  tp text := coalesce(new.raw_user_meta_data->>'tipo','Barbería'); nid uuid;
begin
  insert into negocios(owner,nombre,tipo,slug) values(new.id,nom,tp,
    trim(both '-' from lower(regexp_replace(translate(nom,'áéíóúñÁÉÍÓÚÑ','aeiounAEIOUN'),'[^a-zA-Z0-9]+','-','g')))||'-'||substr(md5(random()::text),1,4))
  returning id into nid;
  insert into servicios(negocio_id,nombre,duracion,precio)
  select nid, s->>0, (s->>1)::int, (s->>2)::numeric from jsonb_array_elements((case tp
    when 'Salón' then '[["Corte y peinado",60,25],["Manicura",45,15]]'
    when 'Tutor' then '[["Clase individual",60,18]]'
    when 'Psicólogo' then '[["Primera consulta",60,35],["Seguimiento",50,30]]'
    when 'Consultor' then '[["Diagnóstico",30,40],["Sesión estratégica",90,120]]'
    else '[["Corte clásico",30,12],["Corte + barba",60,20]]' end)::jsonb) s;
  return new;
end $$;
drop trigger if exists al_registrar on auth.users;
create trigger al_registrar after insert on auth.users for each row execute function crear_negocio_nuevo();

-- Página pública: informa si la suscripción está vigente
create or replace function get_negocio_publico(p_slug text) returns json
language sql security definer set search_path=public as $$
  select json_build_object('nombre',n.nombre,'hora_inicio',n.hora_inicio,'hora_fin',n.hora_fin,'activo',n.vence>now(),
    'servicios',coalesce((select json_agg(json_build_object('id',s.id,'nombre',s.nombre,'duracion',s.duracion,'precio',s.precio))
      from servicios s where s.negocio_id=n.id and s.activo),'[]'::json))
  from negocios n where n.slug=p_slug $$;

-- Reservas: solo con prueba o suscripción vigente (se elimina el plan gratis)
create or replace function crear_reserva(p_slug text,p_servicio uuid,p_cliente text,p_tel text,p_fecha date,p_inicio int)
returns uuid language plpgsql security definer set search_path=public as $$
declare n negocios; s servicios; nuevo uuid;
begin
  select * into n from negocios where slug=p_slug;
  if n.id is null then raise exception 'Negocio no existe'; end if;
  if n.vence<=now() then raise exception 'Las reservas en línea no están disponibles por ahora'; end if;
  select * into s from servicios where id=p_servicio and negocio_id=n.id and activo;
  if s.id is null then raise exception 'Servicio no válido'; end if;
  if length(trim(p_cliente))<2 or p_fecha<current_date then raise exception 'Datos no válidos'; end if;
  if p_inicio<n.hora_inicio or p_inicio+s.duracion>n.hora_fin then raise exception 'Fuera de horario'; end if;
  perform pg_advisory_xact_lock(hashtext(p_slug||p_fecha::text));
  if exists(select 1 from citas c where c.negocio_id=n.id and c.fecha=p_fecha and c.estado<>'cancelada'
     and p_inicio<c.inicio+c.duracion and c.inicio<p_inicio+s.duracion) then
    raise exception 'Ese horario ya fue tomado'; end if;
  insert into citas(negocio_id,servicio_id,cliente,telefono,fecha,inicio,duracion)
  values(n.id,s.id,trim(p_cliente),p_tel,p_fecha,p_inicio,s.duracion) returning id into nuevo;
  return nuevo;
end $$;

/* Cuando un cliente pague, actívalo así:
update negocios set plan='activo', vence=now()+interval '1 month' where slug='SLUG-DEL-CLIENTE'; */
