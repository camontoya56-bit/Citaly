export const metadata = { title: "Política de privacidad · Citaly" };
const RESP = "[Nombre o razón social del responsable]", MAIL = "camontoya56@gmail.com";
const T = [["1. Quién trata tus datos", `${RESP} (Citaly) es responsable de los datos de las cuentas de los negocios. Cada negocio es responsable de los datos de sus propios clientes, y Citaly actúa como encargado que los almacena por cuenta del negocio.`],
["2. Qué datos recogemos", "De los negocios: nombre, correo, WhatsApp, servicios y horario. De los clientes que reservan: nombre, número de WhatsApp, y el servicio, día y hora de la cita. No pedimos datos sensibles ni información clínica."],
["3. Para qué los usamos", "Para gestionar agenda y reservas, enviar avisos de nuevas citas y permitir el contacto entre el negocio y su cliente. No vendemos tus datos ni los usamos para publicidad de terceros."],
["4. Con quién los compartimos", "Con los proveedores que hacen posible el servicio: Supabase (base de datos), Vercel (alojamiento) y Resend (envío de correos). También los ve el negocio con el que reservaste."],
["5. Tus derechos", "Conforme a la Ley 1581 de 2012 de Colombia puedes conocer, actualizar, rectificar y solicitar la supresión de tus datos, o revocar tu autorización. Escríbenos y respondemos en un plazo razonable."],
["6. Seguridad y conservación", "Aplicamos controles de acceso para que cada negocio vea solo su información. Conservamos los datos mientras la cuenta esté activa o sea necesario, y los eliminamos cuando lo solicites."],
["7. Cambios", "Si cambiamos esta política publicaremos la nueva versión en esta página."]];
export default function Privacidad() {
  return (<div className="w"><div className="card"><h1>Política de privacidad</h1><small>Última actualización: 27 de octubre de 2026</small>
    {T.map(([t, p]) => <div key={t}><h3>{t}</h3><p>{p}</p></div>)}<p>Contacto para ejercer tus derechos: <a href={`mailto:${MAIL}`}>{MAIL}</a></p><a href="/">← Volver</a></div></div>);
}
