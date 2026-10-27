# Prototipo web (Vercel)

Prototipo funcional del flujo **Cargar Proyecto** de NoCountry (decisores). **Root Directory en Vercel:** `prototipo`.

Stack: **Next.js** (App Router) + TypeScript + Tailwind.

## Local

```bash
cd prototipo
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Deploy

1. Conectar el repo en Vercel.
2. Settings → General → **Root Directory** → `prototipo`.
3. **Production** desde `main`; **previews** por PR (abrir PR hacia `main` para obtener URL de preview).

## Flujo (alineado a `diseno/formulario-inicial/`)

| Ruta | Pantalla | Referencia diseño |
|------|----------|-------------------|
| `/simulation` | Dashboard simulación (métricas + equipos, datos demo) | ref. companies/simulation |
| `/` | Landing «Sube tu desafío» + Cómo funciona | form-01 |
| `/cargar-proyecto` | Plan Free Trial | form-02 |
| `/cargar-proyecto/modo` | Elegir flujo: clásico o preguntas guiadas | — |
| `/cargar-proyecto/compania` | Información de la compañía (esquema A) | form-03 |
| `/cargar-proyecto/detalles` | Detalles del proyecto (esquema B) | form-04 |
| `/cargar-proyecto/guiado` | Mismo esquema, una pregunta por paso | — |
| `/post-envio` | Confirmación de envío | form-05 |

Los datos del formulario se guardan en `sessionStorage` entre pasos. **Login:** Google vía Supabase (`/login`); rutas `/cargar-proyecto/*` y `/post-envio` requieren sesión si hay variables Supabase configuradas.

Variables: copiar `.env.example` → `.env.local`. Setup Supabase: [`../supabase/SETUP.md`](../supabase/SETUP.md).

Esquemas de campos: [`docs/02-testing/esquema-del-formulario-inicial/`](../docs/02-testing/esquema-del-formulario-inicial/).

## Rama de trabajo

Desarrollo del prototipo en ramas `feature/prototipo-*` con PR a `main`.
