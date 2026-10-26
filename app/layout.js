import "./globals.css";
export const metadata = { title: "Citaly · Agenda y reservas", description: "Gestor de citas para profesionales independientes" };
export default function Layout({ children }) {
  return (<html lang="es"><body>{children}</body></html>);
}
