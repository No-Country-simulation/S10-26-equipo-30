# Crear el ambiente Supabase (UXFlow research)

Checklist para el equipo. Tiempo estimado: **15–20 min** la primera vez.

## 1. Proyecto en Supabase

1. Entrá a [supabase.com/dashboard](https://supabase.com/dashboard) (cuenta del equipo o personal del proyecto).
2. **New project**
   - **Name:** `uxflow-research-s10-30` (o el que acuerden).
   - **Database password:** generá una fuerte y guardala (1Password / Bitwarden). No va al repo.
   - **Region:** la más cercana a los testers (p. ej. `South America (São Paulo)` si aparece).
3. Esperá a que el proyecto termine de provisionarse (1–2 min).

Anotá:

| Dato | Dónde encontrarlo |
|------|-------------------|
| **Project URL** | Settings → API → Project URL |
| **anon public** | Settings → API → Project API keys → `anon` `public` |
| **service_role** | Misma pantalla (solo server / admins; **nunca** en el cliente Next) |
| **Project ref** | Settings → General → Reference ID (ej. `abcdefghijklmnop`) |

## 2. Aplicar el esquema (tablas + RLS)

### Opción recomendada: SQL Editor

1. Dashboard → **SQL** → **New query**.
2. Abrí en el repo `supabase/migrations/20261027100000_uxflow_research_schema.sql`.
3. Copiá **todo** el archivo → pegá en el editor → **Run**.
4. Debería terminar sin errores.

### Verificación rápida

Ejecutá `supabase/verify.sql` en el SQL Editor. Las consultas deben listar tablas y enums sin error.

## 3. Auth (URLs; Google más adelante)

**Authentication → URL Configuration**

| Campo | Valor |
|-------|--------|
| **Site URL** | `http://localhost:3000` (dev local) |
| **Redirect URLs** | Añadí cada una en una línea: |

```
http://localhost:3000/**
https://*.vercel.app/**
```

Cuando tengan dominio fijo de preview/production, sumen esa URL exacta.

**Google provider** (cuando integren login en el prototipo):

1. **Authentication → Providers → Google** → Enable.
2. Crear OAuth client en [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (Web application).
3. **Authorized redirect URI** (Supabase te la muestra), forma típica:  
   `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
4. Pegar Client ID y Client Secret en Supabase.

Hasta que el prototipo use auth, el esquema y las tablas ya funcionan; no hace falta Google el día 1.

## 3b. Google OAuth (requerido — error `Unsupported provider: provider is not enabled`)

Ese JSON aparece cuando **Google está apagado** en Supabase. Obligatorio antes de probar login:

1. Dashboard Supabase → **Authentication** → **Providers** → **Google**.
2. Activar **Enable Sign in with Google**.
3. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **OAuth client ID** → tipo **Web application**.
4. **Authorized JavaScript origins:**  
   `http://localhost:3000`  
   `https://<tu-proyecto>.vercel.app` (la preview concreta; Google no acepta `*.vercel.app` en origins).
5. **Authorized redirect URIs:** copiá la de Supabase en la misma pantalla del provider, forma:  
   `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
6. Pegar **Client ID** y **Client Secret** en Supabase → **Save**.

Sin el paso 2 (Enable + Save), el botón “Continuar con Google” falla aunque `.env.local` esté bien.

## 4. Variables en Vercel (preview + production del PR)

En el proyecto Vercel → **Settings → Environment Variables**:

| Variable | Valor | Entornos |
|----------|--------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Preview, Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key | Preview, Production |

Opcional (solo cuando haya Server Actions / API con privilegios):

| Variable | Entornos |
|----------|----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Preview, Production (nunca `NEXT_PUBLIC_`) |

**Redeploy** del PR después de guardar variables para que la preview las tome.

## 5. Variables locales

En `prototipo/`:

```bash
copy .env.example .env.local
```

Completá URL y anon key. Reiniciá `npm run dev`.

## 6. Roles del equipo (después del primer login con Google)

Cuando alguien del equipo entre por primera vez con Google, en SQL Editor:

```sql
update public.profiles
set role = 'researcher'
where email = 'correo-del-equipo@gmail.com';
```

Researchers ven todas las sesiones (RLS) y pueden escribir `moderation_notes`.

## 7. Invitados de test (opcional)

```sql
insert into public.tester_invites (email, notes)
values
  ('participante@gmail.com', 'Sesión moderada');
```

La app aún no valida la allowlist; queda lista para una Edge Function futura.

## 8. CLI (opcional)

Si instalan [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
cd supabase
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push
```

El repo ya incluye `config.toml` y `migrations/`.

## Problemas frecuentes

| Síntoma | Causa probable |
|---------|----------------|
| Error al Run migration | Query incompleta o migración ya aplicada (revisar Table Editor) |
| RLS “permission denied” desde la app | Usuario no logueado o sesión no pertenece al `user_id` |
| Auth redirect loop | Falta la URL de Vercel en Redirect URLs |
| No veo datos en Table Editor | RLS oculta filas; entrá como service role en SQL o desactivá RLS solo en debug (no recomendado en prod) |

## Siguiente paso en el repo

Integrar en `prototipo/`: cliente Supabase, login Google, crear `test_sessions` al elegir modo en `/cargar-proyecto/modo`, persistir envío en `project_submissions`.
