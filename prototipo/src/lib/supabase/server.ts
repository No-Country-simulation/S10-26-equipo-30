import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import type { AuthUserSummary } from "@/lib/supabase/types";

export type { AuthUserSummary };

export async function createClient() {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll desde Server Component; el middleware refresca la sesión.
        }
      },
    },
  });
}

export async function getAuthUser(): Promise<AuthUserSummary | null> {
  if (!getSupabasePublicEnv()) {
    return null;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  const meta = user.user_metadata as Record<string, unknown>;
  const isAnonymous = Boolean(user.is_anonymous) || !user.email;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const profileName =
    typeof profile?.full_name === "string" && profile.full_name.trim()
      ? profile.full_name.trim()
      : null;
  const metaFullName = typeof meta.full_name === "string" ? meta.full_name.trim() : "";
  const metaDisplayName = typeof meta.name === "string" ? meta.name.trim() : "";
  const metaName = metaFullName || metaDisplayName || null;
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profileName || metaName || (isAnonymous ? "Invitado" : null),
    avatarUrl: typeof meta.avatar_url === "string" ? meta.avatar_url : null,
    isAnonymous,
  };
}
