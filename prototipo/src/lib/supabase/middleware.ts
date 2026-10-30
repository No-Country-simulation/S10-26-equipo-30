import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

const PROTECTED_PREFIXES = ["/cargar-proyecto", "/post-envio", "/mis-proyectos", "/panel"];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

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

export async function updateSession(request: NextRequest) {
  const env = getSupabasePublicEnv();
  if (!env) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/auth/callback")) {
    return supabaseResponse;
  }

  if (pathname === "/login" && user) {
    const next = safeNextPath(request.nextUrl.searchParams.get("next"), request.nextUrl.origin);
    const redirect = request.nextUrl.clone();
    redirect.pathname = next.split("?")[0] ?? "/cargar-proyecto";
    redirect.search = next.includes("?") ? next.slice(next.indexOf("?")) : "";
    return NextResponse.redirect(redirect);
  }

  if (isProtectedPath(pathname) && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(redirect);
  }

  return supabaseResponse;
}
