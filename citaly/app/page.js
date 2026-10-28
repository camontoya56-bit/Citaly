import Link from "next/link";
import { WA, PRECIO, wame } from "../lib/supabase";
const PARA = [["💈", "Barberías", "Agenda de cortes y barba sin llamadas"], ["💇", "Salones de belleza", "Peinado, uñas y tintes, cada uno con su duración"],
  ["📚", "Tutores y profesores", "Clases individuales y refuerzos organizados"], ["🧠", "Psicólogos y terapeutas", "Sesiones sin cruces y con trato discreto"], ["💼", "Consultores y coaches", "Llamadas y sesiones reservadas por tus clientes"]];
const PASOS = [["Crea tu agenda", "Escribe el nombre de tu negocio, tus servicios, precios y horario. Toma 5 minutos."], ["Comparte tu enlace", "Ponlo en tu WhatsApp, Instagram o en un código QR en el local."], ["Recibe reservas", "Tus clientes eligen hora solos. Tú ves el día completo y sin cruces."]];
const VENT = [["🚫", "Sin dobles reservas", "El sistema bloquea cualquier horario ocupado."], ["💬", "Recordatorios por WhatsApp", "Un toque y el mensaje sale listo para tu cliente."], ["📱", "Desde el celular", "Sin instalar nada, funciona en cualquier navegador."], ["🔒", "Datos protegidos", "Cada negocio ve solo su información."]];
export default function Home() {
  return (
    <div className="L">
      <section className="hero">
        <span className="badge">✨ 14 días gratis · Sin tarjeta · Listo en 5 minutos</span>
        <h1>Tu agenda llena, sin perseguir clientes por WhatsApp</h1>
        <p>Citaly te da un enlace para que tus clientes reserven solos, a cualquier hora. Tú ves el día completo en una pantalla y pierdes menos citas.</p>
        <Link href="/login"><button className="p big">Probar 14 días gratis</button></Link>{" "}
        <a href={wame(WA, "Hola, quiero información de Citaly")} target="_blank" rel="noreferrer"><button className="big">Hablar por WhatsApp</button></a>
      </section>
      <h2 className="s">Hecho para profesionales que viven de su agenda</h2>
      <div className="g">{PARA.map(([e, t, d]) => <div className="t" key={t}><div className="e">{e}</div><b>{t}</b><small>{d}</small></div>)}</div>
      <h2 className="s">Cómo funciona</h2>
      <div className="g">{PASOS.map(([t, d], i) => <div className="t" key={t}><span className="n">{i + 1}</span><b>{t}</b><small>{d}</small></div>)}</div>
      <h2 className="s">Lo que ganas</h2>
      <div className="g">{VENT.map(([e, t, d]) => <div className="t" key={t}><div className="e">{e}</div><b>{t}</b><small>{d}</small></div>)}</div>
      <h2 className="s">Un solo plan, simple</h2>
      <div className="t price"><b>Plan Profesional</b><div className="pr">{PRECIO.replace("/mes", "")}<small style={{ fontSize: 14 }}>/mes</small></div>
        <ul><li>Citas y servicios ilimitados</li><li>Tu enlace de reservas propio</li><li>Recordatorios por WhatsApp</li><li>Soporte por WhatsApp</li></ul>
        <Link href="/login"><button className="p big" style={{ width: "100%" }}>Empezar mis 14 días gratis</button></Link>
        <small style={{ marginTop: 8 }}>Sin tarjeta y sin permanencia.</small></div>
      <p style={{ textAlign: "center", marginTop: 40 }}><small>¿Dudas? Escríbenos por <a href={wame(WA, "Hola, tengo una pregunta sobre Citaly")} target="_blank" rel="noreferrer">WhatsApp</a>.</small><br /><small><a href="/terminos">Términos</a> · <a href="/privacidad">Privacidad</a></small></p>
    </div>
  );
}
