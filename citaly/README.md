# Citaly (MVP)
1. Supabase > SQL Editor: pegar y ejecutar `supabase/schema.sql`.
2. Supabase > Authentication > Providers > Email: desactivar "Confirm email" (solo para pruebas).
3. Copiar `.env.example` a `.env.local` con la URL y la anon key (Project Settings > API).
4. Local: `npm install && npm run dev` → http://localhost:3000
5. Subir a GitHub y en Vercel: Add New Project → importar repo → agregar las 2 variables de entorno → Deploy.
