import Link from "next/link";
import { WA, PRECIO, wame } from "../lib/supabase";
export default function Home() {
  return (
    <div className="w" style={{ textAlign: "center", paddingTop: 70 }}>
      <h1>Llena tu agenda sin perseguir a nadie por WhatsApp</h1>
      <p>Tus clientes reservan desde tu enlace. Tú ves el día completo en una pantalla.</p>
      <p><Link href="/login"><button className="p">Probar 14 días gratis</button></Link>{" "}
        <a href={wame(WA, "Hola, quiero información de Citaly")} target="_blank" rel="noreferrer"><button>Hablar por WhatsApp</button></a></p>
      <p><small>Después de la prueba: {PRECIO}. Sin permanencia.</small></p>
    </div>
  );
}
