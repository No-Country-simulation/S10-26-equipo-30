import { escapeHtml } from "@/lib/email/submission-confirmation";

export const DRAFT_RETENTION_LABEL = "7 días";

type RecoveryReminderInput = {
  firstName: string | null;
  organization: string;
  title: string;
  minutesLeft: number;
  resumeUrl: string;
  unsubscribeUrl: string;
};

/** Copy de la pieza 4: "terminar de enviar a revisión", nunca "publicar". */
export function buildRecoveryReminderEmail(input: RecoveryReminderInput) {
  const greeting = input.firstName ? `Hola ${input.firstName},` : "Hola,";
  const remaining =
    input.minutesLeft <= 1 ? "menos de un minuto" : `unos ${input.minutesLeft} minutos`;
  const subject = input.organization
    ? `Tu desafío para ${input.organization}: te faltan ~${Math.max(input.minutesLeft, 1)} min`
    : `Tu desafío: te faltan ~${Math.max(input.minutesLeft, 1)} min`;
  const savedName = input.title || input.organization || "tu desafío";

  const text = [
    greeting,
    "",
    `Guardamos tu avance en "${savedName}". Te faltan ${remaining} para terminar de enviar tu desafío a revisión.`,
    "",
    "La revisión es gratuita y no te compromete a nada.",
    "",
    `Continuar formulario: ${input.resumeUrl}`,
    "",
    `Guardamos tu borrador durante ${DRAFT_RETENTION_LABEL}. Si ya no te interesa, no hace falta que hagas nada.`,
    "",
    `¿No querés recibir más recordatorios? ${input.unsubscribeUrl}`,
    "",
    "Equipo de No Country",
  ].join("\n");

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;padding:32px">
            <tr><td>
              <p style="margin:0 0 4px;font-size:13px;font-weight:bold;color:#8b5cf6;letter-spacing:0.08em;text-transform:uppercase">No Country</p>
              <h1 style="margin:0 0 16px;font-size:22px;color:#0f172a">Tu desafío te espera</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#334155">${escapeHtml(greeting)}<br />Guardamos tu avance en <strong>"${escapeHtml(savedName)}"</strong>. Te faltan <strong>${escapeHtml(remaining)}</strong> para terminar de enviar tu desafío a revisión.</p>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.5;color:#334155">La revisión es gratuita y no te compromete a nada.</p>
              <a href="${escapeHtml(input.resumeUrl)}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#7c3aed;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none">Continuar formulario</a>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#64748b">Guardamos tu borrador durante ${escapeHtml(DRAFT_RETENTION_LABEL)}. Si ya no te interesa, no hace falta que hagas nada.</p>
              <p style="margin:12px 0 0;font-size:13px;color:#64748b">Equipo de No Country</p>
              <p style="margin:24px 0 0;font-size:12px;color:#94a3b8"><a href="${escapeHtml(input.unsubscribeUrl)}" style="color:#94a3b8">No quiero recibir más recordatorios</a></p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
