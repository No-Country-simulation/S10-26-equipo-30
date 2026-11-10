import { NextResponse, type NextRequest } from "next/server";
import { isValidUnsubscribeToken } from "@/lib/email/unsubscribe-token";
import { createAdminClient } from "@/lib/supabase/admin";

async function optOut(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("u") ?? "";
  const token = request.nextUrl.searchParams.get("t") ?? "";
  if (!userId || !isValidUnsubscribeToken(userId, token)) return false;

  const admin = createAdminClient();
  if (!admin) return false;
  const { error } = await admin
    .from("profiles")
    .update({ email_reminders_opt_out: true })
    .eq("id", userId);
  return !error;
}

/** Enlace "No quiero recibir más recordatorios" del correo de recuperación. */
export async function GET(request: NextRequest) {
  const ok = await optOut(request);
  return NextResponse.redirect(
    new URL(ok ? "/recordatorios-baja" : "/recordatorios-baja/error", request.nextUrl.origin),
  );
}

/** Baja con un clic desde Gmail u Outlook (encabezado List-Unsubscribe-Post). */
export async function POST(request: NextRequest) {
  const ok = await optOut(request);
  return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
}
