"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
const TIPOS = { "Barbería": [["Corte clásico",30,12],["Corte + barba",60,20]], "Salón": [["Corte y peinado",60,25],["Manicura",45,15]],
  "Tutor": [["Clase individual",60,18]], "Psicólogo": [["Primera consulta",60,35],["Seguimiento",50,30]], "Consultor": [["Diagnóstico",30,40],["Sesión estratégica",90,120]] };
const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export default function Login() {
  const r = useRouter();
  const [reg, setReg] = useState(false), [f, setF] = useState({ email: "", pw: "", nombre: "", tipo: "Barbería" }), [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function enviar(e) {
    e.preventDefault(); setErr("");
    if (!reg) {
      const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.pw });
      return error ? setErr(error.message) : r.push("/dashboard");
    }
    const { data, error } = await supabase.auth.signUp({ email: f.email, password: f.pw });
    if (error) return setErr(error.message);
    if (!data.session) return setErr("Revisa tu correo para confirmar la cuenta y luego inicia sesión.");
    const slug = slugify(f.nombre) + "-" + Math.random().toString(36).slice(2, 5);
    const { data: n, error: e2 } = await supabase.from("negocios").insert({ owner: data.user.id, nombre: f.nombre, tipo: f.tipo, slug }).select().single();
    if (e2) return setErr(e2.message);
    await supabase.from("servicios").insert(TIPOS[f.tipo].map(([nombre, duracion, precio]) => ({ negocio_id: n.id, nombre, duracion, precio })));
    r.push("/dashboard");
  }
  return (
    <div className="w"><form className="card" onSubmit={enviar}>
      <h2>{reg ? "Crear mi agenda" : "Iniciar sesión"}</h2>
      {reg && <><input placeholder="Nombre de tu negocio" value={f.nombre} onChange={set("nombre")} required />
        <select value={f.tipo} onChange={set("tipo")}>{Object.keys(TIPOS).map((t) => <option key={t}>{t}</option>)}</select></>}
      <input type="email" placeholder="Correo" value={f.email} onChange={set("email")} required />
      <input type="password" placeholder="Contraseña (mín. 6)" minLength={6} value={f.pw} onChange={set("pw")} required />
      {err && <p style={{ color: "#b91c1c" }}>{err}</p>}
      <button className="p" type="submit">{reg ? "Crear cuenta" : "Entrar"}</button>{" "}
      <button type="button" onClick={() => setReg(!reg)}>{reg ? "Ya tengo cuenta" : "Soy nuevo"}</button>
    </form></div>
  );
}
