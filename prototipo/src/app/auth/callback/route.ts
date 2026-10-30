import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

function safeNextPath(raw: string | null, origin: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/cargar-proyecto";
  }
  try {
    const url = new URL(raw, origin);
    if (url.origin !== origin) {
      return "/cargar-proyecto";
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return "/cargar-proyecto";
  }
}

export async function GET(request: NextRequest) {
  const env = getSupabasePublicEnv();
  const origin = request.nextUrl.origin;
  if (!env) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  const code = request.nextUrl.searchParams.get("code");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"), origin);

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
