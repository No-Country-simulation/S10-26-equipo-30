import { escapeHtml, shortSubmissionId } from "@/lib/email/submission-confirmation";

type ApprovalNotificationInput = {
  firstName: string | null;
  submissionId: string;
  title: string;
  companyName: string;
  myProjectsUrl: string;
  /** Mensaje interno del revisor; opcional en el cuerpo. */
  reviewerNote: string | null;
};

export function buildApprovalNotificationEmail(input: ApprovalNotificationInput) {
  const greeting = input.firstName ? `Hola ${input.firstName},` : "Hola,";
  const reference = shortSubmissionId(input.submissionId);
  const subject = `Tu desafío fue aprobado: ${input.title}`;
  const noteBlock = input.reviewerNote?.trim()
    ? `\n\nMensaje del equipo:\n${input.reviewerNote.trim()}`
    : "";

  const text = [
    greeting,
    "",
    `Tu desafío "${input.title}" de ${input.companyName} fue aprobado y pasa a la etapa activa de la simulación.`,
    "",
    "Estado: Aprobado · En simulación",
    `Referencia: ${reference}`,
    "",
    "Qué hacer ahora",
    "1. Entrá a Mis Proyectos y revisá el brief aprobado y el resumen del proyecto.",
    "2. Cuando asignemos equipos, vas a ver su actividad y podés responder dudas (te sugerimos hacerlo en hasta 48 h).",
    "3. Anotá en tu calendario la primera reunión de alineación cuando te confirmemos fecha.",
    noteBlock,
    "",
    `Acción: abrí Mis Proyectos: ${input.myProjectsUrl}`,
    "",
    "Gracias por confiar en No Country. Si tenés preguntas antes del inicio, respondé este correo indicando tu referencia.",
    "",
    "Equipo de No Country",
  ]
    .filter(Boolean)
    .join("\n");

  const noteHtml = input.reviewerNote?.trim()
    ? `<div style="margin:0 0 20px;padding:14px 16px;border-radius:10px;background:#f0fdf4;border:1px solid #bbf7d0">
         <p style="margin:0 0 6px;font-size:12px;font-weight:bold;color:#15803d;text-transform:uppercase;letter-spacing:0.06em">Mensaje del equipo</p>
         <p style="margin:0;font-size:14px;line-height:1.55;color:#166534;white-space:pre-wrap">${escapeHtml(input.reviewerNote.trim())}</p>
       </div>`
  : "";

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;padding:32px">
            <tr><td>
              <p style="margin:0 0 4px;font-size:13px;font-weight:bold;color:#8b5cf6;letter-spacing:0.08em;text-transform:uppercase">No Country</p>
              <h1 style="margin:0 0 16px;font-size:22px;color:#0f172a">Tu desafío fue aprobado</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#334155">${escapeHtml(greeting)}<br /><strong>"${escapeHtml(input.title)}"</strong> de ${escapeHtml(input.companyName)} ya está aprobado y entra en la simulación.</p>
              <p style="display:inline-block;margin:0 0 20px;padding:6px 12px;border-radius:999px;background:#dcfce7;color:#15803d;font-size:13px;font-weight:bold">En simulación · Ref. ${escapeHtml(reference)}</p>
              ${noteHtml}
              <h2 style="margin:0 0 8px;font-size:16px;color:#0f172a">Qué hacer ahora</h2>
              <ol style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.6;color:#334155">
                <li>Revisá el brief y el estado del proyecto en <strong>Mis Proyectos</strong>.</li>
                <li>Cuando publiquemos los equipos, respondé sus dudas en hasta <strong>48 h</strong>.</li>
                <li>Preparate para la primera reunión de alineación (te confirmamos fecha por correo o WhatsApp).</li>
              </ol>
              <a href="${escapeHtml(input.myProjectsUrl)}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#7c3aed;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none">Ver equipos y brief</a>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#64748b">Si tenés preguntas antes del inicio, respondé este correo indicando tu referencia.</p>
              <p style="margin:12px 0 0;font-size:13px;color:#64748b">Equipo de No Country</p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
