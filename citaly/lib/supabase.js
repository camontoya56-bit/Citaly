import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
export const hm = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
export const hoy = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
export const sumaDias = (s, n) => { const d = new Date(s + "T12:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
export const WA = "573216571440";
export const PRECIO = "$59.000 COP/mes";
export const PRECIO_FUNDADOR = "$39.000 COP/mes";
export const PRECIO_ANUAL = "$590.000 COP/año";
export const tel = (t = "") => { let d = String(t).replace(/\D/g, ""); if (d.startsWith("00")) d = d.slice(2); if (d.length === 10) d = "57" + d; return d; };
export const wame = (num, msg) => `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
