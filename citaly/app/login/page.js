"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
const TIPOS = ["Barbería", "Salón", "Tutor", "Psicólogo", "Consultor"];
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
    const { data, error } = await supabase.auth.signUp({ email: f.email, password: f.pw, options: { data: { nombre: f.nombre, tipo: f.tipo } } });
    if (error) return setErr(error.message);
    if (!data.session) { setReg(false); return setErr("Cuenta creada. Confirma tu correo y luego inicia sesión."); }
    r.push("/dashboard");
  }
  return (
    <div className="w"><form className="card" onSubmit={enviar}>
      <h2>{reg ? "Crear mi agenda (14 días gratis)" : "Iniciar sesión"}</h2>
      {reg && <><input placeholder="Nombre de tu negocio" value={f.nombre} onChange={set("nombre")} required />
        <select value={f.tipo} onChange={set("tipo")}>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></>}
      <input type="email" placeholder="Correo" value={f.email} onChange={set("email")} required />
      <input type="password" placeholder="Contraseña (mín. 6)" minLength={6} value={f.pw} onChange={set("pw")} required />
      {err && <p style={{ color: err.startsWith("Cuenta") ? "#0f766e" : "#b91c1c" }}>{err}</p>}
      <button className="p" type="submit">{reg ? "Crear cuenta" : "Entrar"}</button>{" "}
      <button type="button" onClick={() => setReg(!reg)}>{reg ? "Ya tengo cuenta" : "Soy nuevo"}</button>
    </form></div>
  );
}
