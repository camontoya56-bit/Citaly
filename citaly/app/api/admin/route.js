import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
async function admin(req) {
  const t = (req.headers.get("authorization") || "").replace("Bearer ", "");
  if (!t) return null;
  const c = db(); const { data } = await c.auth.getUser(t); const u = data?.user;
  const ok = u?.email_confirmed_at && u.email?.toLowerCase() === (process.env.NOTIFY_ADMIN_EMAIL || "").trim().toLowerCase();
  return ok ? c : null;
}
export async function GET(req) {
  const c = await admin(req); if (!c) return Response.json({ error: "no" }, { status: 403 });
  const { data: neg } = await c.from("negocios").select("id,nombre,tipo,slug,plan,vence,whatsapp,owner,created_at").order("created_at", { ascending: false });
  const { data: us } = await c.auth.admin.listUsers({ perPage: 1000 });
  const { data: ci } = await c.from("citas").select("negocio_id").limit(20000);
  const mail = Object.fromEntries((us?.users || []).map((u) => [u.id, u.email]));
  const cnt = {}; (ci || []).forEach((x) => { cnt[x.negocio_id] = (cnt[x.negocio_id] || 0) + 1; });
  return Response.json({ negocios: (neg || []).map((n) => ({ ...n, email: mail[n.owner] || "", citas: cnt[n.id] || 0 })) });
}
export async function POST(req) {
  const c = await admin(req); if (!c) return Response.json({ error: "no" }, { status: 403 });
  const { id, meses } = await req.json();
  if (!/^[0-9a-f-]{36}$/i.test(id || "") || ![0, 1, 3, 12].includes(meses)) return Response.json({ error: "datos" }, { status: 400 });
  if (meses === 0) await c.from("negocios").update({ plan: "vencido", vence: new Date().toISOString() }).eq("id", id);
  else {
    const { data: n } = await c.from("negocios").select("vence").eq("id", id).single();
    const b = new Date(Math.max(Date.now(), new Date(n.vence).getTime())); b.setMonth(b.getMonth() + meses);
    await c.from("negocios").update({ plan: "activo", vence: b.toISOString() }).eq("id", id);
  }
  return Response.json({ ok: true });
}
