# Checklist PR + preview (Supabase + Google auth)

Antes de mergear a `main`:

## GitHub

- [ ] PR abierto hacia `main` desde `feature/testing-supabase-modo-flujo` (o rama actual).
- [ ] Build de Vercel en verde en el PR.

## Vercel → Environment Variables

| Variable | Preview | Production |
|----------|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | ✓ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | ✓ |

**Redeploy** del deployment del PR tras guardar variables.

## Supabase

- [ ] Migración aplicada (`supabase/migrations/20261027100000_uxflow_research_schema.sql`).
- [ ] **Authentication → URL Configuration:** `http://localhost:3000/**`, `https://*.vercel.app/**`.
- [ ] **Google** provider habilitado con OAuth client (redirect URI de Supabase).
- [ ] Tras primer login del equipo: `update public.profiles set role = 'researcher' where email = '...';`

## Probar en preview

1. Abrir URL de preview del PR.
2. **Cargar Proyecto** → redirige a `/login` si no hay sesión.
3. **Continuar con Google** → vuelve a `/cargar-proyecto`.
4. Plan → **modo** → clásico o guiado → completar hasta post-envio.
5. Header muestra nombre/email y **Salir**.
