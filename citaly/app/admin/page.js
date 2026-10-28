"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase, wame, tel } from "../../lib/supabase";
export default function Admin() {
  const r = useRouter();
  const [lista, setLista] = useState(null), [err, setErr] = useState("");
  const llamar = useCallback(async (body) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return r.push("/login");
    const res = await fetch("/api/admin", { method: body ? "POST" : "GET", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 403) return setErr("No tienes permiso para ver esta página.");
    if (body) return llamar();
    setLista((await res.json()).negocios);
  }, [r]);
  useEffect(() => { llamar(); }, [llamar]);
  if (err) return <div className="w"><div className="card">{err}</div></div>;
  if (!lista) return <div className="w">Cargando…</div>;
  const ahora = Date.now(), est = (n) => (n.plan === "activo" && new Date(n.vence) > ahora ? "activo" : new Date(n.vence) > ahora ? "prueba" : "vencido");
  const cuenta = (e) => lista.filter((n) => est(n) === e).length;
  const dias = (n) => Math.ceil((new Date(n.vence) - ahora) / 864e5);
  const col = { activo: "#0f766e", prueba: "#b45309", vencido: "#b91c1c" };
  return (
    <div className="w" style={{ maxWidth: 760 }}>
      <div className="card"><h2>Panel de administración</h2>
        <b>{lista.length}</b> negocios · <b style={{ color: col.activo }}>{cuenta("activo")}</b> pagando · <b style={{ color: col.prueba }}>{cuenta("prueba")}</b> en prueba · <b style={{ color: col.vencido }}>{cuenta("vencido")}</b> vencidos</div>
      {lista.map((n) => { const e = est(n); return (
        <div className="card" key={n.id}>
          <b>{n.nombre}</b> <small>· {n.tipo}</small> <b style={{ color: col[e], float: "right" }}>{e === "vencido" ? "Vencido" : e === "activo" ? `Activo · ${dias(n)} d` : `Prueba · ${dias(n)} d`}</b><br />
          <small>{n.email} · {n.citas} citas · registrado {new Date(n.created_at).toLocaleDateString("es")} · vence {new Date(n.vence).toLocaleDateString("es")}</small><br />
          <small>/{n.slug}</small>
          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[[1, "+1 mes"], [3, "+3 meses"], [12, "+12 meses"]].map(([m, t]) => <button key={m} className="p" onClick={() => llamar({ id: n.id, meses: m })}>{t}</button>)}
            {e !== "vencido" && <button onClick={() => confirm(`¿Pausar ${n.nombre}?`) && llamar({ id: n.id, meses: 0 })}>Pausar</button>}
            {n.whatsapp && <a href={wame(tel(n.whatsapp), `Hola, te escribimos de Citaly sobre ${n.nombre}.`)} target="_blank" rel="noreferrer"><button>WhatsApp</button></a>}
          </div>
        </div>); })}
    </div>
  );
}
