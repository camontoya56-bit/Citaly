import Link from "next/link";
export default function Home() {
  return (
    <div className="w" style={{ textAlign: "center", paddingTop: 80 }}>
      <h1>Llena tu agenda, sin perseguir a nadie por WhatsApp</h1>
      <p>Tus clientes reservan desde tu enlace. Tú ves el día completo en una pantalla.</p>
      <Link href="/login"><button className="p">Crear mi agenda gratis</button></Link>
    </div>
  );
}
