-- Ejecutar en Supabase > SQL Editor
-- SEGURIDAD: evita que un dueño se auto-active el plan o cambie su fecha de vencimiento desde el navegador
revoke insert, update, delete on negocios from anon, authenticated;
grant update (nombre, tipo, hora_inicio, hora_fin) on negocios to authenticated;
