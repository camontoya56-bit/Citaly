"use client";
import { useEffect, useState } from "react";
import { supabase, hm, hoy, sumaDias, tel as telx, wame } from "../../lib/supabase";
export default function Reserva({ params }) {
  const { slug } = params;
  const [n, setN] = useState(null), [s, setS] = useState(null), [fecha, setFecha] = useState(hoy()), [oc, setOc] = useState([]);
  const [t, setT] = useState(null), [nom, setNom] = useState(""), [tel, setTel] = useState(""), [ok, setOk] = useState(false), [err, setErr] = useState(""), [conf, setConf] = useState(null);
  useEffect(() => { supabase.rpc("get_negocio_publico", { p_slug: slug }).then(({ data }) => { setN(data || false); if (data) setS(data.servicios[0]); }); }, [slug]);
  useEffect(() => { supabase.rpc("get_ocupado", { p_slug: slug, p_fecha: fecha }).then(({ data }) => setOc(data || [])); setT(null); }, [slug, fecha, ok]);
  if (n === null) return <div className="w">Cargando…</div>;
  if (n === false) return <div className="w">Este negocio no existe.</div>;
  if (!n.activo) return <div className="w"><div className="card"><h2>{n.nombre}</h2><p>Las reservas en línea no están disponibles por ahora. Contáctanos directamente.</p></div></div>;
  const libre = (m) => s && m + s.duracion <= n.hora_fin && !oc.some((o) => m < o.inicio + o.duracion && o.inicio < m + s.duracion);
  const slots = []; for (let m = n.hora_inicio; m < n.hora_fin; m += 30) slots.push(m);
  async function reservar() {
    setErr("");
    const { error } = await supabase.rpc("crear_reserva", { p_slug: slug, p_servicio: s.id, p_cliente: nom, p_tel: telx(tel), p_fecha: fecha, p_inicio: t });
    if (error) return setErr(error.message);
    setConf({ d: fecha, t, n: nom }); setOk(true);
  }
  if (ok) return <div className="w"><div className="card"><h2>✅ Reserva confirmada</h2><p>{conf.n}, te esperamos el {new Date(conf.d + "T12:00").toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })} a las {hm(conf.t)} en {n.nombre}.</p>{n.whatsapp && <><p><small>Un último paso: avísale al negocio por WhatsApp para que tu cita quede confirmada.</small></p><a href={wame(n.whatsapp, `Hola, soy ${conf.n}. Reservé ${s?.nombre} el ${conf.d} a las ${hm(conf.t)}.`)} target="_blank" rel="noreferrer"><button className="p">Confirmar por WhatsApp</button></a></>}</div></div>;
  return (
    <div className="w"><div className="card"><h2>{n.nombre}</h2>
      <b>1. Servicio</b><div className="chips">{n.servicios.map((x) => <button key={x.id} className={s?.id === x.id ? "on" : ""} onClick={() => { setS(x); setT(null); }}>{x.nombre} · ${x.precio}</button>)}</div>
      <b>2. Día</b><div className="chips">{Array.from({ length: 7 }, (_, i) => sumaDias(hoy(), i)).map((d) => <button key={d} className={fecha === d ? "on" : ""} onClick={() => setFecha(d)}>{new Date(d + "T12:00").toLocaleDateString("es", { weekday: "short", day: "numeric" })}</button>)}</div>
      <b>3. Hora</b><div className="chips">{slots.map((m) => <button key={m} disabled={!libre(m)} className={t === m ? "on" : ""} onClick={() => setT(m)}>{hm(m)}</button>)}</div>
      <b>4. Tus datos</b><input placeholder="Nombre completo" value={nom} onChange={(e) => setNom(e.target.value)} />
      <input placeholder="Tu WhatsApp (ej. 3001234567)" inputMode="tel" value={tel} onChange={(e) => setTel(e.target.value)} />
      {err && <p style={{ color: "#b91c1c" }}>{err}</p>}
      <button className="p" disabled={t === null || nom.trim().length < 2 || telx(tel).length < 11} onClick={reservar}>Confirmar reserva</button></div></div>
  );
}
