"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase, hm, hoy, sumaDias } from "../../lib/supabase";
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
  const ingresos = citas.reduce((s, c) => s + Number(c.servicios?.precio || 0), 0);
  return (
    <div className="w">
      <div className="card"><b>{neg.nombre}</b><br /><small>Tu enlace de reservas:</small><br />
        <a href={link} target="_blank" rel="noreferrer">{link}</a>{" "}
        <button onClick={() => navigator.clipboard.writeText(link)}>Copiar</button>{" "}
        <button onClick={async () => { await supabase.auth.signOut(); r.push("/login"); }}>Salir</button></div>
      <div className="card">
        <div className="ap" style={{ border: 0 }}><button onClick={() => setFecha(sumaDias(fecha, -1))}>‹</button>
          <b>{new Date(fecha + "T12:00").toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}</b>
          <button onClick={() => setFecha(sumaDias(fecha, 1))}>›</button></div>
        <small>{citas.length} citas · ${ingresos} estimados</small>
        {citas.length === 0 && <p>Sin citas este día.</p>}
        {citas.map((c) => (
          <div className="ap" key={c.id}>
            <div><b>{hm(c.inicio)}</b> {c.cliente}<br /><small>{c.servicios?.nombre} · {c.duracion} min{c.estado === "completada" ? " · completada" : ""}</small></div>
            <div>{c.telefono && <a href={`https://wa.me/${c.telefono}?text=${encodeURIComponent(`Hola ${c.cliente}, te recordamos tu cita a las ${hm(c.inicio)}`)}`} target="_blank" rel="noreferrer">💬</a>}{" "}
              {c.estado !== "completada" && <button onClick={() => estado(c.id, "completada")}>✓</button>}{" "}
              <button onClick={() => estado(c.id, "cancelada")}>✕</button></div>
          </div>))}
      </div>
    </div>
  );
}
