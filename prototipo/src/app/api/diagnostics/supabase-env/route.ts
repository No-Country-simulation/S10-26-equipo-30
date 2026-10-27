import { NextResponse } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/** Solo para debug de deploy (no expone secretos). Quitar o proteger en prod si molesta. */
export async function GET() {
  const env = getSupabasePublicEnv();
  return NextResponse.json({
    configured: env !== null,
    hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()),
  });
}
