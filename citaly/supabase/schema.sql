-- Ejecutar completo en Supabase > SQL Editor
create table negocios(
  id uuid primary key default gen_random_uuid(),
  owner uuid not null unique references auth.users(id) on delete cascade,
  nombre text not null, tipo text, slug text not null unique,
  hora_inicio int not null default 540, hora_fin int not null default 1080,
  plan text not null default 'gratis', created_at timestamptz default now());
create table servicios(
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios(id) on delete cascade,
  nombre text not null, duracion int not null check (duracion between 15 and 480),
  precio numeric not null default 0, activo boolean not null default true);
create table citas(
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios(id) on delete cascade,
  servicio_id uuid references servicios(id) on delete set null,
  cliente text not null, telefono text, fecha date not null,
  inicio int not null, duracion int not null,
  estado text not null default 'confirmada' check (estado in ('confirmada','completada','cancelada')),
  created_at timestamptz default now());
create index on citas(negocio_id, fecha);

alter table negocios enable row level security;
alter table servicios enable row level security;
alter table citas enable row level security;
create policy "dueño negocio" on negocios for all using (owner = auth.uid()) with check (owner = auth.uid());
create policy "dueño servicios" on servicios for all
  using (exists(select 1 from negocios n where n.id = negocio_id and n.owner = auth.uid()))
  with check (exists(select 1 from negocios n where n.id = negocio_id and n.owner = auth.uid()));
create policy "dueño citas" on citas for all
  using (exists(select 1 from negocios n where n.id = negocio_id and n.owner = auth.uid()))
  with check (exists(select 1 from negocios n where n.id = negocio_id and n.owner = auth.uid()));

-- Acceso público (solo lo necesario para reservar; nunca se exponen datos de clientes)
create function get_negocio_publico(p_slug text) returns json
language sql security definer set search_path=public as $$
  select json_build_object('nombre',n.nombre,'hora_inicio',n.hora_inicio,'hora_fin',n.hora_fin,
    'servicios',coalesce((select json_agg(json_build_object('id',s.id,'nombre',s.nombre,'duracion',s.duracion,'precio',s.precio))
      from servicios s where s.negocio_id=n.id and s.activo),'[]'::json))
  from negocios n where n.slug=p_slug $$;

create function get_ocupado(p_slug text, p_fecha date) returns table(inicio int, duracion int)
language sql security definer set search_path=public as $$
  select c.inicio,c.duracion from citas c join negocios n on n.id=c.negocio_id
  where n.slug=p_slug and c.fecha=p_fecha and c.estado<>'cancelada' $$;

create function crear_reserva(p_slug text,p_servicio uuid,p_cliente text,p_tel text,p_fecha date,p_inicio int)
returns uuid language plpgsql security definer set search_path=public as $$
declare n negocios; s servicios; nuevo uuid;
begin
  select * into n from negocios where slug=p_slug;
  if n.id is null then raise exception 'Negocio no existe'; end if;
  select * into s from servicios where id=p_servicio and negocio_id=n.id and activo;
  if s.id is null then raise exception 'Servicio no válido'; end if;
  if length(trim(p_cliente))<2 or p_fecha<current_date then raise exception 'Datos no válidos'; end if;
  if p_inicio<n.hora_inicio or p_inicio+s.duracion>n.hora_fin then raise exception 'Fuera de horario'; end if;
  perform pg_advisory_xact_lock(hashtext(p_slug||p_fecha::text));
  if exists(select 1 from citas c where c.negocio_id=n.id and c.fecha=p_fecha and c.estado<>'cancelada'
     and p_inicio<c.inicio+c.duracion and c.inicio<p_inicio+s.duracion) then
    raise exception 'Ese horario ya fue tomado'; end if;
  if n.plan='gratis' and (select count(*) from citas c where c.negocio_id=n.id
     and date_trunc('month',c.fecha)=date_trunc('month',p_fecha))>=20 then
    raise exception 'Este negocio alcanzó su límite mensual'; end if;
  insert into citas(negocio_id,servicio_id,cliente,telefono,fecha,inicio,duracion)
  values(n.id,s.id,trim(p_cliente),p_tel,p_fecha,p_inicio,s.duracion) returning id into nuevo;
  return nuevo;
end $$;
grant execute on function get_negocio_publico, get_ocupado, crear_reserva to anon, authenticated;
