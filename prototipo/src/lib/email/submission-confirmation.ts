export const REVIEW_TIME_LABEL = "5 días hábiles";

type SubmissionConfirmationInput = {
  firstName: string | null;
  submissionId: string;
  title: string;
  companyName: string;
  problem: string;
  deliverables: string[];
  myProjectsUrl: string;
};

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Número corto para que la persona pueda citar su envío si escribe al equipo. */
export function shortSubmissionId(submissionId: string) {
  return submissionId.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function buildSubmissionConfirmationEmail(input: SubmissionConfirmationInput) {
  const greeting = input.firstName ? `Hola ${input.firstName},` : "Hola,";
  const reference = shortSubmissionId(input.submissionId);
  const subject = `Recibimos tu desafío: ${input.title}`;
  const deliverables = input.deliverables.length ? input.deliverables.join(", ") : "A definir juntos";

  const text = [
    greeting,
    "",
    `Recibimos tu desafío "${input.title}" de ${input.companyName}.`,
    "",
    "Estado: En revisión",
    `Número de envío: ${reference}`,
    "",
    "Qué sigue",
    `1. El equipo de No Country revisa tu desafío y te escribe dentro de ${REVIEW_TIME_LABEL} para validarlo juntos.`,
    "2. Una vez validado, los equipos de la simulación lo toman.",
    "3. Al final recibís los entregables y decidís cómo seguir.",
    "",
    "Resumen de lo que enviaste",
    `Problema: ${input.problem}`,
    `Qué te gustaría recibir: ${deliverables}`,
    "",
    `Seguí el estado en Mis proyectos: ${input.myProjectsUrl}`,
    "",
    "Cargar un desafío no tiene costo. Si necesitás corregir algo, respondé este correo indicando tu número de envío.",
    "",
    "Equipo de No Country",
  ].join("\n");

  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;width:180px;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 0;color:#0f172a;font-size:14px">${escapeHtml(value)}</td></tr>`;

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;padding:32px">
            <tr><td>
              <p style="margin:0 0 4px;font-size:13px;font-weight:bold;color:#8b5cf6;letter-spacing:0.08em;text-transform:uppercase">No Country</p>
              <h1 style="margin:0 0 16px;font-size:22px;color:#0f172a">Recibimos tu desafío</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#334155">${escapeHtml(greeting)}<br />Recibimos <strong>"${escapeHtml(input.title)}"</strong> de ${escapeHtml(input.companyName)}.</p>
              <p style="display:inline-block;margin:0 0 20px;padding:6px 12px;border-radius:999px;background:#ede9fe;color:#6d28d9;font-size:13px;font-weight:bold">En revisión · Envío ${escapeHtml(reference)}</p>
              <h2 style="margin:0 0 8px;font-size:16px;color:#0f172a">Qué sigue</h2>
              <ol style="margin:0 0 20px;padding-left:20px;font-size:14px;line-height:1.6;color:#334155">
                <li>El equipo de No Country revisa tu desafío y te escribe <strong>dentro de ${escapeHtml(REVIEW_TIME_LABEL)}</strong> para validarlo juntos.</li>
                <li>Una vez validado, los equipos de la simulación lo toman.</li>
                <li>Al final recibís los entregables y decidís cómo seguir.</li>
              </ol>
              <h2 style="margin:0 0 8px;font-size:16px;color:#0f172a">Resumen de lo que enviaste</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
                ${row("Problema", input.problem)}
                ${row("Qué te gustaría recibir", deliverables)}
              </table>
              <a href="${escapeHtml(input.myProjectsUrl)}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#7c3aed;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none">Ver mis proyectos</a>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#64748b">Cargar un desafío no tiene costo. Si necesitás corregir algo, respondé este correo indicando tu número de envío.</p>
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
