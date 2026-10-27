"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, hm, tel } from "../../../lib/supabase";
const HORAS = Array.from({ length: 35 }, (_, i) => 360 + i * 30);
const DUR = [15, 30, 45, 60, 75, 90, 120, 150, 180];
export default function Config() {
  const r = useRouter();
  const [neg, setNeg] = useState(null), [sv, setSv] = useState([]), [msg, setMsg] = useState(""), [nuevo, setNuevo] = useState({ nombre: "", duracion: 30, precio: "" });
  const cargar = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return r.push("/login");
    const { data: n } = await supabase.from("negocios").select("*").maybeSingle();
    if (!n) return r.push("/login");
    setNeg(n);
    const { data: s } = await supabase.from("servicios").select("*").eq("negocio_id", n.id).eq("activo", true).order("nombre");
    setSv(s || []);
  }, [r]);
  useEffect(() => { cargar(); }, [cargar]);
  const avisa = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2500); };
  const edNeg = (k, v) => setNeg({ ...neg, [k]: v });
  const edSv = (i, k, v) => setSv(sv.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  async function guardaNeg() {
    if (neg.hora_fin <= neg.hora_inicio) return avisa("La hora de cierre debe ser después de la apertura");
    const { error } = await supabase.from("negocios").update({ nombre: neg.nombre.trim(), hora_inicio: neg.hora_inicio, hora_fin: neg.hora_fin, whatsapp: tel(neg.whatsapp || "") || null }).eq("id", neg.id);
    avisa(error ? error.message : "Negocio guardado ✓");
  }
  async function guardaSv(s) {
    if (!s.nombre.trim()) return avisa("El servicio necesita nombre");
    const { error } = await supabase.from("servicios").update({ nombre: s.nombre.trim(), duracion: +s.duracion, precio: +s.precio || 0 }).eq("id", s.id);
    avisa(error ? error.message : "Servicio guardado ✓");
  }
  async function quita(s) {
    if (!confirm(`¿Quitar «${s.nombre}»? Las citas ya hechas se conservan.`)) return;
    await supabase.from("servicios").update({ activo: false }).eq("id", s.id); cargar();
  }
  async function agrega() {
    if (!nuevo.nombre.trim()) return avisa("Escribe el nombre del servicio");
    const { error } = await supabase.from("servicios").insert({ negocio_id: neg.id, nombre: nuevo.nombre.trim(), duracion: +nuevo.duracion, precio: +nuevo.precio || 0 });
    if (error) return avisa(error.message);
    setNuevo({ nombre: "", duracion: 30, precio: "" }); cargar(); avisa("Servicio agregado ✓");
  }
  if (!neg) return <div className="w">Cargando…</div>;
  return (
    <div className="w">
      <p><Link href="/dashboard"><button>← Volver a la agenda</button></Link> <b style={{ color: "#0f766e" }}>{msg}</b></p>
      <div className="card"><h2>Mi negocio</h2>
        <small>Nombre</small><input value={neg.nombre} onChange={(e) => edNeg("nombre", e.target.value)} />
        <small>WhatsApp del negocio (con código de país, ej. 573001234567). Recibirás las confirmaciones aquí.</small><input inputMode="tel" value={neg.whatsapp || ""} onChange={(e) => edNeg("whatsapp", e.target.value)} placeholder="573001234567" />
        <small>Horario de atención</small>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={neg.hora_inicio} onChange={(e) => edNeg("hora_inicio", +e.target.value)}>{HORAS.map((h) => <option key={h} value={h}>Abre {hm(h)}</option>)}</select>
          <select value={neg.hora_fin} onChange={(e) => edNeg("hora_fin", +e.target.value)}>{HORAS.map((h) => <option key={h} value={h}>Cierra {hm(h)}</option>)}</select>
        </div>
        <button className="p" onClick={guardaNeg}>Guardar negocio</button></div>
      <div className="card"><h2>Servicios</h2>
        {sv.map((s, i) => (
          <div key={s.id} style={{ borderBottom: "1px solid #e4e2da", paddingBottom: 8, marginBottom: 8 }}>
            <input value={s.nombre} onChange={(e) => edSv(i, "nombre", e.target.value)} />
            <div style={{ display: "flex", gap: 8 }}>
              <select value={s.duracion} onChange={(e) => edSv(i, "duracion", e.target.value)}>{DUR.map((d) => <option key={d} value={d}>{d} min</option>)}</select>
              <input type="number" min="0" value={s.precio} onChange={(e) => edSv(i, "precio", e.target.value)} placeholder="Precio" />
            </div>
            <button onClick={() => guardaSv(s)}>Guardar</button> <button onClick={() => quita(s)}>Quitar</button>
          </div>))}
        <b>Agregar servicio</b>
        <input placeholder="Nombre (ej. Corte infantil)" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} style={{ marginTop: 8 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <select value={nuevo.duracion} onChange={(e) => setNuevo({ ...nuevo, duracion: e.target.value })}>{DUR.map((d) => <option key={d} value={d}>{d} min</option>)}</select>
          <input type="number" min="0" placeholder="Precio" value={nuevo.precio} onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })} />
        </div>
        <button className="p" onClick={agrega}>Agregar</button></div>
    </div>
  );
}
