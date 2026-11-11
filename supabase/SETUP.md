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

## 3a. Invitado (Anonymous)

Para el botón **Continuar como invitado**:

1. **Authentication → Providers → Anonymous** → Enable → Save.

Sin eso, el login anónimo responde que el provider está deshabilitado. El invitado igual genera un usuario en `auth.users` y un `profiles` (email vacío), así el formulario se guarda con las mismas tablas.

Para que cada invitado tenga un nombre fijo (**Invitado 1**, **Invitado 2**, …), en el SQL Editor ejecutá también `supabase/migrations/20261030100000_guest_display_names.sql`. Eso numera a los que ya entraron y a los que entren después. Sin ese paso, en el panel se pueden separar igual mientras se vean varios a la vez, pero el nombre no queda guardado.

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

## 9. Recuperación de abandonos (pieza 4)

Correo automático una hora después de que alguien deja un borrador sin enviar, con un enlace para retomarlo en el paso exacto.

1. Aplicá `migrations/20261110120000_recovery_emails.sql` (columnas `recovery_email_status`, `recovery_email_at`, `email_reminders_opt_out` y extensiones `pg_cron` + `pg_net`).
2. En Vercel cargá como **Secret**: `SUPABASE_SERVICE_ROLE_KEY` (Settings → API) y `CRON_SECRET` (un valor aleatorio largo). También tienen que estar las variables de Resend.
3. En el SQL Editor guardá en Vault la URL de la app y el mismo `CRON_SECRET`, y programá la tarea: seguí `cron/recovery-emails.sql`.
4. Para probar a mano (con la app corriendo):

```bash
curl -X POST https://TU-APP.vercel.app/api/cron/recovery-emails -H "Authorization: Bearer $CRON_SECRET"
```

La respuesta resume cuántas sesiones evaluó y qué pasó con cada una (`sent`, `skipped_*`, `failed`). Cada sesión se evalúa una sola vez; las que fallaron al enviar se reintentan en la ejecución siguiente. Métricas y lista para el contacto humano: pestaña **Recuperación** del panel.

## 10. Leads calificados para contacto humano (pieza 4, +24 h)

A las 24 h el sistema no envía nada: una persona del equipo contacta a mano a los abandonos con interés real desde `/panel/leads` y registra el contacto.

1. Aplicá, en este orden y por separado, `migrations/20261111100000_marketing_role.sql` (agrega el rol `marketing`) y `migrations/20261111100100_qualified_leads.sql` (función `can_contact_leads`, tabla `lead_contacts` con RLS y funciones `qualified_leads` y `lead_contact_summary`). Tienen que ir en dos corridas: Postgres no deja usar un valor nuevo de un enum en la misma transacción en la que se agrega.
2. La persona de marketing entra una vez con Google y después, en el SQL Editor:

```sql
update public.profiles
set role = 'marketing'
where email = 'correo-de-marketing@gmail.com';
```

`marketing` ve solo la lista de leads y puede registrar contactos. No entra al panel de pruebas ni lee las tablas de research. `researcher` y `admin` también ven la lista. Para sacarle el acceso, volvé el rol a `tester`.

Criterios de la lista: [pieza 4, sección (d).3](../entregables/etapa-2-testing/pieza-4-recuperacion-de-abandonos/pieza-4-recuperacion-de-abandonos.md).

## Problemas frecuentes

| Síntoma | Causa probable |
|---------|----------------|
| Error al Run migration | Query incompleta o migración ya aplicada (revisar Table Editor) |
| RLS “permission denied” desde la app | Usuario no logueado o sesión no pertenece al `user_id` |
| Auth redirect loop | Falta la URL de Vercel en Redirect URLs |
| No veo datos en Table Editor | RLS oculta filas; entrá como service role en SQL o desactivá RLS solo en debug (no recomendado en prod) |

## Siguiente paso en el repo

Integrar en `prototipo/`: cliente Supabase, login Google, crear `test_sessions` al elegir modo en `/cargar-proyecto/modo`, persistir envío en `project_submissions`.
