import { connection } from "next/server";
import { LoginPanel } from "@/app/login/login-panel";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function LoginPageContent() {
  await connection();
  const configured = isSupabaseConfigured();
  return <LoginPanel configured={configured} />;
}
