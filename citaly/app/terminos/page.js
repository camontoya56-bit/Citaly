export const metadata = { title: "Términos de uso · Citaly" };
const RESP = "[Nombre o razón social del responsable]", MAIL = "camontoya56@gmail.com";
const T = [["1. Qué es Citaly", "Citaly es una herramienta en línea para que profesionales y negocios gestionen su agenda y reciban reservas de sus clientes."],
["2. Cuenta", "Debes dar datos verdaderos y cuidar tu contraseña. Eres responsable de lo que ocurra con tu cuenta."],
["3. Prueba y pago", "Cada negocio nuevo tiene 14 días de prueba sin costo. Después, el servicio requiere un plan de pago mensual. Si el plan vence, las reservas en línea se suspenden y tus datos se conservan para cuando lo reactives."],
["4. Uso permitido", "No uses Citaly para actividades ilegales, para enviar spam ni para afectar a otros usuarios. Podemos suspender cuentas que incumplan estas reglas."],
["5. Datos de tus clientes", "Tú decides qué datos de tus clientes registras y eres responsable de usarlos con su autorización. Citaly los almacena y los trata por tu cuenta, según la Política de privacidad. No registres historias clínicas ni información sensible de salud."],
["6. Disponibilidad", "Trabajamos para que el servicio esté siempre disponible, pero no garantizamos que funcione sin interrupciones ni errores."],
["7. Límite de responsabilidad", "Citaly no responde por pérdidas indirectas, como citas no atendidas o ingresos no recibidos, en la medida que permita la ley."],
["8. Cancelación", "Puedes dejar de usar el servicio cuando quieras. Para eliminar tu cuenta y tus datos, escríbenos."],
["9. Cambios y ley aplicable", "Podemos actualizar estos términos y avisaremos los cambios importantes. Se rigen por las leyes de Colombia."]];
export default function Terminos() {
  return (<div className="w"><div className="card"><h1>Términos de uso</h1><small>Última actualización: 27 de octubre de 2026 · Responsable: {RESP}</small>
    {T.map(([t, p]) => <div key={t}><h3>{t}</h3><p>{p}</p></div>)}<p>Contacto: <a href={`mailto:${MAIL}`}>{MAIL}</a></p><a href="/">← Volver</a></div></div>);
}
