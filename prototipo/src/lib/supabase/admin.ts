import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Cliente con la service role: saltea RLS. Solo para tareas del servidor que no actúan en nombre
 * de un usuario (por ejemplo, la tarea programada de recuperación). Nunca importarlo en el cliente.
 */
export function createAdminClient() {
  const env = getSupabasePublicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!env || !serviceRoleKey) return null;
  return createClient(env.url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
