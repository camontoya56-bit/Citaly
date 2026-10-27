import { createClient } from "@supabase/supabase-js";
const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const hm = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!/^[0-9a-f-]{36}$/i.test(id || "")) return Response.json({ ok: false }, { status: 400 });
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data: c } = await db.from("citas").select("*, servicios(nombre,precio), negocios(nombre,slug,owner)").eq("id", id).maybeSingle();
    // Solo citas recién creadas y que no se hayan avisado antes (evita abusos y correos repetidos)
    if (!c || c.notificado || Date.now() - new Date(c.created_at).getTime() > 10 * 60 * 1000) return Response.json({ ok: false }, { status: 404 });
    const { data: u } = await db.auth.admin.getUserById(c.negocios.owner);
    const para = [...new Set([u?.user?.email, process.env.NOTIFY_ADMIN_EMAIL].filter(Boolean))];
    const fecha = new Date(c.fecha + "T12:00").toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });
    const tel = String(c.telefono || "").replace(/\D/g, "");
    const host = `https://${req.headers.get("host")}`;
    const html = `<div style="font-family:system-ui,sans-serif;max-width:480px">
      <h2>📅 Nueva cita en ${esc(c.negocios.nombre)}</h2>
      <p><b>${esc(c.cliente)}</b> reservó <b>${esc(c.servicios?.nombre)}</b> (${c.duracion} min, $${esc(c.servicios?.precio)}).</p>
      <p>🗓 ${esc(fecha)} a las <b>${hm(c.inicio)}</b></p>
      <p>📱 WhatsApp del cliente: ${tel ? `<a href="https://wa.me/${tel}">${esc(c.telefono)}</a>` : "no indicado"}</p>
      <p><a href="${host}/dashboard">Ver mi agenda</a></p></div>`;
    let enviado = false;
    for (const to of para) {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.EMAIL_FROM || "Citaly <onboarding@resend.dev>", to, subject: `Nueva cita: ${c.cliente} · ${fecha} ${hm(c.inicio)}`, html }),
      });
      if (r.ok) enviado = true; else console.error("Resend", to, r.status, await r.text());
    }
    if (enviado) await db.from("citas").update({ notificado: true }).eq("id", id);
    return Response.json({ ok: enviado });
  } catch (e) { console.error(e); return Response.json({ ok: false }, { status: 500 }); }
}
