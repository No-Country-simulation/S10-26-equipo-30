import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** Firma del enlace de baja: sin la firma, nadie puede dar de baja a otra persona con su id. */
function secret() {
  return process.env.CRON_SECRET?.trim() ?? "";
}

export function unsubscribeToken(userId: string) {
  return createHmac("sha256", secret()).update(`unsubscribe:${userId}`).digest("hex");
}

export function isValidUnsubscribeToken(userId: string, token: string) {
  if (!secret() || !token) return false;
  const expected = Buffer.from(unsubscribeToken(userId));
  const received = Buffer.from(token);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
