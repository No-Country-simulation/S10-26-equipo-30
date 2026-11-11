"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  fieldInputClass,
  fieldLabelClass,
  fieldTextareaClass,
  formErrorClass,
} from "@/components/form-styles";
import { cx } from "@/lib/cx";
import { formatWhenArgentina, labelStep, labelVariant } from "@/lib/research-labels";
import {
  MAX_INTEREST_SCORE,
  contactChannelSuggestions,
  contactOutcomes,
  formatLeadPhone,
  interestLevel,
  labelContactOutcome,
  labelRecoveryStatus,
  suggestedQuestion,
  type ContactOutcome,
  type LeadContactSummary,
  type QualifiedLead,
} from "@/lib/qualified-leads";
import { createClient } from "@/lib/supabase/client";

const mutedTextClass = "leading-normal text-nc-muted";

const cardClass = "rounded-[0.9rem] border border-nc-border bg-[rgba(12,18,28,0.75)] px-5 py-4";

const termClass = "text-[0.72rem] font-[650] tracking-[0.04em] text-slate-400 uppercase";

const valueClass = "text-[0.88rem] break-words text-slate-100";

const smallButtonClass =
  "cursor-pointer rounded-full border border-nc-border bg-transparent px-3 py-[0.35rem] text-[0.8rem] text-slate-200 transition-colors hover:border-violet-500/50 hover:bg-violet-500/15 disabled:cursor-not-allowed disabled:opacity-50";

const primaryButtonClass =
  "cursor-pointer rounded-full border border-violet-500/50 bg-violet-500/25 px-4 py-[0.45rem] text-[0.85rem] font-semibold text-slate-100 transition-colors hover:bg-violet-500/35 disabled:cursor-wait disabled:opacity-60";

const interestToneClass = {
  high: "border-emerald-400/40 bg-emerald-400/15 text-emerald-200",
  medium: "border-amber-400/40 bg-amber-400/15 text-amber-200",
  low: "border-slate-400/30 bg-slate-400/10 text-slate-300",
} as const;

async function fetchLeads(): Promise<{
  leads: QualifiedLead[];
  summary: LeadContactSummary | null;
  error: string | null;
}> {
  const supabase = createClient();
  const [leadsRes, summaryRes] = await Promise.all([
    supabase.rpc("qualified_leads"),
    supabase.rpc("lead_contact_summary", { days: 30 }),
  ]);
  if (leadsRes.error) {
    return {
      leads: [],
      summary: null,
      error:
        "No se pudo leer la lista de leads. Si la migración de la pieza 4 todavía no está aplicada, pedile al equipo que la corra.",
    };
  }
  const firstSummary = Array.isArray(summaryRes.data) ? summaryRes.data[0] : null;
  return {
    leads: (leadsRes.data ?? []) as QualifiedLead[],
    summary: (firstSummary as LeadContactSummary | undefined) ?? null,
    error: null,
  };
}

export function QualifiedLeadsView({ showPanelLink }: { showPanelLink: boolean }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<QualifiedLead[]>([]);
  const [summary, setSummary] = useState<LeadContactSummary | null>(null);
  const [hideContacted, setHideContacted] = useState(false);
  const [openFormId, setOpenFormId] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void fetchLeads().then((result) => {
      if (cancelled) return;
      setError(result.error);
      if (!result.error) {
        setLeads(result.leads);
        setSummary(result.summary);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const visible = useMemo(
    () => (hideContacted ? leads.filter((lead) => lead.contacts_count === 0) : leads),
    [hideContacted, leads],
  );
  const pending = leads.filter((lead) => lead.contacts_count === 0).length;

  if (loading) {
    return <p className={mutedTextClass}>Cargando los leads…</p>;
  }

  return (
    <div>
      <header>
        <p className="mb-1 text-xs tracking-[0.08em] text-nc-muted uppercase">
          Recuperación de abandonos
        </p>
        <h1 className="mb-2 text-[1.7rem]">Leads calificados</h1>
        <p className={cx(mutedTextClass, "max-w-[52rem]")}>
          Personas que empezaron a cargar un proyecto, mostraron interés real y no lo enviaron. Se
          les escribe a mano, una sola vez, por el canal que te parezca mejor. El sistema no les
          manda nada a las 24 h: el único aviso automático es el correo de la primera hora.
        </p>
        <details className="mt-3 max-w-[52rem] text-[0.85rem] text-nc-muted">
          <summary className="cursor-pointer text-slate-300">¿Quién aparece en esta lista?</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Dejó la carga sin enviar hace más de 24 h y menos de 7 días, y no empezó otra carga
              después.
            </li>
            <li>Entró con su cuenta (no como invitado) y no pidió la baja de los recordatorios.</li>
            <li>
              Completó los datos de la organización, o llegó al brief: escribió el problema o la
              descripción, o pasó 30 s o más en esas preguntas.
            </li>
            <li>Dejó un teléfono o tiene el correo de su cuenta.</li>
          </ul>
          <p className="mt-2">
            Primero aparecen los que todavía no contactó nadie y, dentro de ellos, los de más
            interés. El interés suma un punto por cada señal: organización completa, brief escrito,
            30 s o más en el brief, teléfono cargado y haber retomado el borrador.
          </p>
        </details>
        {showPanelLink ? (
          <p className="mt-3 text-[0.85rem]">
            <Link href="/panel" className="text-nc-cyan">
              ← Volver al panel de pruebas
            </Link>
          </p>
        ) : null}
      </header>

      {error ? <p className={cx(formErrorClass, "mt-5")}>{error}</p> : null}

      <ul className="my-5 grid list-none grid-cols-2 gap-3 p-0 min-[801px]:grid-cols-4">
        <Stat value={String(leads.length)} label="Leads en la lista" />
        <Stat value={String(pending)} label="Sin contactar" />
        <Stat
          value={summary ? String(summary.leads_contacted) : "—"}
          label="Contactados (30 días)"
        />
        <Stat
          value={
            summary ? `${summary.resumed_after_contact} / ${summary.submitted_after_contact}` : "—"
          }
          label="Retomaron / enviaron después del contacto"
        />
      </ul>

      <label className="mb-4 flex items-center gap-2 text-[0.85rem] text-nc-muted">
        <input
          type="checkbox"
          checked={hideContacted}
          onChange={(event) => setHideContacted(event.target.checked)}
        />
        Ocultar los que ya se contactaron
      </label>

      {visible.length === 0 ? (
        <p className={mutedTextClass}>
          {leads.length === 0
            ? "Por ahora no hay leads calificados. Cuando alguien con interés real deje una carga sin enviar por más de 24 h, va a aparecer acá."
            : "Ya se contactó a todos los leads de la lista."}
        </p>
      ) : (
        <ol className="flex list-none flex-col gap-4 p-0">
          {visible.map((lead) => (
            <li key={lead.session_id}>
              <LeadCard
                lead={lead}
                formOpen={openFormId === lead.session_id}
                onToggleForm={() =>
                  setOpenFormId((current) => (current === lead.session_id ? null : lead.session_id))
                }
                onSaved={() => {
                  setOpenFormId(null);
                  setReloadKey((key) => key + 1);
                }}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <li className="rounded-[0.8rem] border border-nc-border bg-[rgba(12,18,28,0.75)] px-4 py-[0.9rem]">
      <span className="block text-[1.35rem] font-bold">{value}</span>
      <span className="text-[0.82rem] text-nc-muted">{label}</span>
    </li>
  );
}

function Field({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div>
      <dt className={termClass}>{term}</dt>
      <dd className={cx(valueClass, "m-0 mt-[0.15rem]")}>{children}</dd>
    </div>
  );
}

function LeadCard({
  lead,
  formOpen,
  onToggleForm,
  onSaved,
}: {
  lead: QualifiedLead;
  formOpen: boolean;
  onToggleForm: () => void;
  onSaved: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const interest = interestLevel(lead.interest_score);
  const question = suggestedQuestion(lead);
  const phone = formatLeadPhone(lead);
  const organization = [
    lead.company_name,
    lead.organization_type,
    lead.organization_size,
    lead.country,
  ]
    .filter(Boolean)
    .join(" · ");
  const signals = [
    lead.company_complete ? "Organización completa" : null,
    lead.brief_written ? "Escribió el brief" : null,
    lead.brief_seconds >= 30
      ? `${Math.round(lead.brief_seconds / 60) || "<1"} min en el brief`
      : null,
    phone ? "Dejó teléfono" : null,
    lead.resumed_draft ? "Retomó el borrador" : null,
  ].filter(Boolean);

  async function copyQuestion() {
    try {
      await navigator.clipboard.writeText(question.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className={cardClass}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-[1.05rem]">{lead.account_name || "Sin nombre"}</h2>
          <p className="m-0 text-[0.85rem] text-nc-muted">{lead.account_email || "Sin correo"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {lead.contacts_count > 0 ? (
            <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-[0.6rem] py-[0.15rem] text-[0.75rem] text-cyan-200">
              Contactado
            </span>
          ) : null}
          <span
            className={cx(
              "rounded-full border px-[0.6rem] py-[0.15rem] text-[0.75rem]",
              interestToneClass[interest.tone],
            )}
            title={signals.join(" · ")}
          >
            Interés {interest.label.toLowerCase()} ({lead.interest_score}/{MAX_INTEREST_SCORE})
          </span>
        </div>
      </header>

      <dl className="mt-4 grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 min-[901px]:grid-cols-3">
        <Field term="Organización">{organization || "—"}</Field>
        <Field term="Teléfono">{phone ?? "No lo dejó"}</Field>
        <Field term="Proyecto">{lead.project_title || "Sin título todavía"}</Field>
        <Field term="Dónde quedó">
          {labelStep(lead.last_step_id, lead.flow_variant)}
          <span className="block text-[0.78rem] text-nc-muted">
            {labelVariant(lead.flow_variant)}
          </span>
        </Field>
        <Field term="Última actividad (hora de Argentina)">
          {formatWhenArgentina(lead.last_activity_at)}
        </Field>
        <Field term="Correo +1 h">
          {labelRecoveryStatus(lead.recovery_email_status)}
          {lead.recovery_email_at ? (
            <span className="block text-[0.78rem] text-nc-muted">
              {formatWhenArgentina(lead.recovery_email_at)}
            </span>
          ) : null}
        </Field>
      </dl>

      {signals.length > 0 ? (
        <p className="mt-3 mb-0 text-[0.8rem] text-nc-muted">Señales: {signals.join(" · ")}</p>
      ) : null}

      <section className="mt-4 rounded-[0.7rem] border border-violet-500/25 bg-violet-500/8 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="m-0 text-[0.85rem] font-semibold text-slate-200">
            Pregunta sugerida · {question.label}
          </h3>
          <button type="button" className={smallButtonClass} onClick={() => void copyQuestion()}>
            {copied ? "Copiada" : "Copiar"}
          </button>
        </div>
        <p className="mt-2 mb-0 text-[0.88rem] leading-relaxed text-slate-100">{question.text}</p>
        <p className="mt-2 mb-0 text-[0.75rem] text-nc-muted">
          Es una guía: adaptala a tu forma de escribir. Una sola pregunta, sin hablar de «publicar»;
          mejor «enviar a revisión».
        </p>
      </section>

      <footer className="mt-4 flex flex-col gap-3">
        {lead.last_contact_at ? (
          <p className="m-0 text-[0.85rem] text-slate-300">
            Último contacto: {formatWhenArgentina(lead.last_contact_at)} por{" "}
            {lead.last_contact_channel || "—"}, de {lead.last_contact_by || "alguien del equipo"}.{" "}
            Resultado: {labelContactOutcome(lead.last_contact_outcome)}.
            {lead.last_contact_note ? (
              <span className="block text-nc-muted">Nota: {lead.last_contact_note}</span>
            ) : null}
            {lead.contacts_count > 1 ? (
              <span className="block text-nc-muted">
                Contactos registrados: {lead.contacts_count}
              </span>
            ) : null}
          </p>
        ) : null}
        <div>
          <button type="button" className={smallButtonClass} onClick={onToggleForm}>
            {formOpen
              ? "Cancelar"
              : lead.contacts_count > 0
                ? "Registrar otro contacto"
                : "Marcar como contactado"}
          </button>
        </div>
        {formOpen ? <ContactForm sessionId={lead.session_id} onSaved={onSaved} /> : null}
      </footer>
    </article>
  );
}

function ContactForm({ sessionId, onSaved }: { sessionId: string; onSaved: () => void }) {
  const [channel, setChannel] = useState("");
  const [outcome, setOutcome] = useState<ContactOutcome>("sin_respuesta");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listId = `canales-${sessionId}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedChannel = channel.trim();
    if (!trimmedChannel) {
      setError("Contanos por qué canal lo contactaste.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setError("Tu sesión se cerró. Volvé a iniciar sesión.");
      setSaving(false);
      return;
    }
    const { error: insertError } = await supabase.from("lead_contacts").insert({
      session_id: sessionId,
      contacted_by: authData.user.id,
      channel: trimmedChannel.slice(0, 60),
      outcome,
      note: note.trim() ? note.trim().slice(0, 2000) : null,
    });
    if (insertError) {
      setError("No se pudo guardar el contacto. Probá de nuevo.");
      setSaving(false);
      return;
    }
    setSaving(false);
    onSaved();
  }

  return (
    <form
      className="grid grid-cols-1 gap-3 rounded-[0.7rem] border border-nc-border bg-nc-inner px-4 py-3 sm:grid-cols-2"
      onSubmit={(event) => void submit(event)}
    >
      <div>
        <label className={fieldLabelClass} htmlFor={`canal-${sessionId}`}>
          Canal
        </label>
        <input
          id={`canal-${sessionId}`}
          className={fieldInputClass}
          list={listId}
          maxLength={60}
          placeholder="WhatsApp, correo, llamada…"
          value={channel}
          onChange={(event) => setChannel(event.target.value)}
        />
        <datalist id={listId}>
          {contactChannelSuggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      </div>
      <div>
        <label className={fieldLabelClass} htmlFor={`resultado-${sessionId}`}>
          Resultado
        </label>
        <select
          id={`resultado-${sessionId}`}
          className={fieldInputClass}
          value={outcome}
          onChange={(event) => setOutcome(event.target.value as ContactOutcome)}
        >
          {contactOutcomes.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={fieldLabelClass} htmlFor={`nota-${sessionId}`}>
          Nota <span className="font-normal text-slate-500">(opcional)</span>
        </label>
        <textarea
          id={`nota-${sessionId}`}
          className={fieldTextareaClass}
          maxLength={2000}
          placeholder="Qué le preguntaste, qué te respondió, si quedó en retomar…"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
      {error ? <p className={cx(formErrorClass, "m-0 sm:col-span-2")}>{error}</p> : null}
      <div className="sm:col-span-2">
        <button type="submit" className={primaryButtonClass} disabled={saving}>
          {saving ? "Guardando…" : "Guardar contacto"}
        </button>
      </div>
    </form>
  );
}
