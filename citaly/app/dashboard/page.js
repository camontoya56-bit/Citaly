"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, hm, hoy, sumaDias, WA, PRECIO, tel, wame } from "../../lib/supabase";
export default function Dashboard() {
  const r = useRouter();
  const [neg, setNeg] = useState(null), [fecha, setFecha] = useState(hoy()), [citas, setCitas] = useState([]);
  const cargar = useCallback(async (n, d) => {
    const { data } = await supabase.from("citas").select("*, servicios(nombre,precio)").eq("negocio_id", n.id).eq("fecha", d).neq("estado", "cancelada").order("inicio");
    setCitas(data || []);
  }, []);
  useEffect(() => { (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return r.push("/login");
    const { data: n } = await supabase.from("negocios").select("*").maybeSingle();
    if (!n) return r.push("/login");
    setNeg(n);
  })(); }, [r]);
  useEffect(() => { if (neg) cargar(neg, fecha); }, [neg, fecha, cargar]);
  async function estado(id, e) { await supabase.from("citas").update({ estado: e }).eq("id", id); cargar(neg, fecha); }
  if (!neg) return <div className="w">Cargando…</div>;
  const link = typeof window !== "undefined" ? `${location.origin}/${neg.slug}` : "";
  const dias = Math.ceil((new Date(neg.vence) - Date.now()) / 864e5), vigente = dias > 0;
  const activar = wame(WA, `Hola, quiero activar Citaly para ${neg.nombre} (${neg.slug}). Plan ${PRECIO}.`);
  const ingresos = citas.reduce((s, c) => s + Number(c.servicios?.precio || 0), 0);
  const salir = async () => { await supabase.auth.signOut(); r.push("/login"); };
  if (!vigente) return (
    <div className="w"><div className="card"><h2>Tu periodo de prueba terminó</h2>
      <p>Tus datos están guardados. Activa tu plan ({PRECIO}) para volver a recibir reservas.</p>
      <a href={activar} target="_blank" rel="noreferrer"><button className="p">Activar por WhatsApp</button></a>{" "}<button onClick={salir}>Salir</button></div></div>);
  return (
    <div className="w">
      {neg.plan !== "activo" && <div className="card" style={{ background: "#d1f0ea" }}>Prueba gratis: te quedan <b>{dias} días</b>. <a href={activar} target="_blank" rel="noreferrer">Activar plan</a></div>}
      <div className="card"><b>{neg.nombre}</b><br /><small>Tu enlace de reservas:</small><br />
        <a href={link} target="_blank" rel="noreferrer">{link}</a>{" "}
        <button onClick={() => navigator.clipboard.writeText(link)}>Copiar</button>{" "}<Link href="/dashboard/config"><button className="p">Configurar</button></Link>{" "}<button onClick={salir}>Salir</button></div>
      <div className="card">
        <div className="ap" style={{ border: 0 }}><button onClick={() => setFecha(sumaDias(fecha, -1))}>‹</button>
          <b>{new Date(fecha + "T12:00").toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}</b>
          <button onClick={() => setFecha(sumaDias(fecha, 1))}>›</button></div>
        <small>{citas.length} citas · ${ingresos} estimados</small>
        {citas.length === 0 && <p>Sin citas este día.</p>}
        {citas.map((c) => (
          <div className="ap" key={c.id}>
            <div><b>{hm(c.inicio)}</b> {c.cliente}<br /><small>{c.servicios?.nombre} · {c.duracion} min{c.estado === "completada" ? " · completada" : ""}</small></div>
            <div>{c.telefono && <a href={wame(tel(c.telefono), `Hola ${c.cliente}, te recordamos tu cita en ${neg.nombre} a las ${hm(c.inicio)}. ¡Te esperamos!`)} target="_blank" rel="noreferrer"><button>Recordar</button></a>}{" "}
              {c.estado !== "completada" && <button onClick={() => estado(c.id, "completada")}>✓</button>}{" "}
              <button onClick={() => estado(c.id, "cancelada")}>✕</button></div>
          </div>))}
      </div>
    </div>
  );
}
