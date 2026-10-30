"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  asRecord,
  formatDuration,
  formatWhen,
  labelEvent,
  labelEventStep,
  labelExperience,
  labelFlowPiece,
  labelRole,
  labelSnapshotReason,
  labelStatus,
  sessionStatus,
  labelStep,
  labelVariant,
  textField,
} from "@/lib/research-labels";

type Row = Record<string, unknown>;

type TableId =
  | "resumen"
  | "personas"
  | "sesiones"
  | "envios"
  | "experiencia"
  | "borradores"
  | "actividad"
  | "notas"
  | "invitaciones";

type TableView = {
  id: Exclude<TableId, "resumen">;
  title: string;
  description: string;
  columns: string[];
  rows: string[][];
};

type Insight =
  | { id: "personas" }
  | { id: "envios" }
  | {
      id: "sesiones";
      status: "all" | "submitted" | "abandoned" | "in_progress";
      variant: "all" | "classic" | "guided";
      step: string | null;
    };

const tabs: { id: TableId; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "sesiones", label: "Pruebas" },
  { id: "envios", label: "Proyectos enviados" },
  { id: "experiencia", label: "Experiencia" },
  { id: "actividad", label: "Qué hizo cada persona" },
  { id: "borradores", label: "Borradores" },
  { id: "personas", label: "Personas" },
  { id: "notas", label: "Notas" },
  { id: "invitaciones", label: "Invitaciones" },
];

export function ResearchPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusSessionId = searchParams.get("sesion");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TableId>(focusSessionId ? "actividad" : "resumen");
  const [personId, setPersonId] = useState("all");
  const [insight, setInsight] = useState<Insight | null>(null);
  const detailRef = useRef<HTMLElement>(null);
  const [fullView, setFullView] = useState(false);
  const [profiles, setProfiles] = useState<Row[]>([]);
  const [sessions, setSessions] = useState<Row[]>([]);
  const [submissions, setSubmissions] = useState<Row[]>([]);
  const [drafts, setDrafts] = useState<Row[]>([]);
  const [events, setEvents] = useState<Row[]>([]);
  const [notes, setNotes] = useState<Row[]>([]);
  const [invites, setInvites] = useState<Row[]>([]);
  const [feedback, setFeedback] = useState<Row[]>([]);
  const [focusEvents, setFocusEvents] = useState<Row[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        if (!cancelled) {
          setError("Tenés que iniciar sesión para ver el panel.");
          setLoading(false);
        }
        return;
      }

      const [profileRes, sessionRes, submissionRes, draftRes, eventRes, noteRes, inviteRes, feedbackRes] =
        await Promise.all([
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase.from("test_sessions").select("*").order("started_at", { ascending: false }),
          supabase.from("project_submissions").select("*").order("submitted_at", { ascending: false }),
          supabase.from("form_draft_snapshots").select("*").order("captured_at", { ascending: false }),
          supabase.from("session_events").select("*").order("created_at", { ascending: false }).limit(500),
          supabase.from("moderation_notes").select("*").order("created_at", { ascending: false }),
          supabase.from("tester_invites").select("*").order("created_at", { ascending: false }),
          supabase
            .from("session_experience_feedback")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

      if (cancelled) return;
      const firstError = [profileRes, sessionRes, submissionRes, draftRes, eventRes].find(
        (result) => result.error,
      );
      if (firstError?.error) {
        setError(firstError.error.message);
        setLoading(false);
        return;
      }

      const people = (profileRes.data ?? []) as Row[];
      const me = people.find((person) => person.id === authData.user.id);
      setFullView(me?.role === "researcher" || me?.role === "admin");
      setProfiles(people);
      setSessions((sessionRes.data ?? []) as Row[]);
      setSubmissions((submissionRes.data ?? []) as Row[]);
      setDrafts((draftRes.data ?? []) as Row[]);
      setEvents((eventRes.data ?? []) as Row[]);
      setNotes((noteRes.error ? [] : (noteRes.data ?? [])) as Row[]);
      setInvites((inviteRes.error ? [] : (inviteRes.data ?? [])) as Row[]);
      setFeedback((feedbackRes.error ? [] : (feedbackRes.data ?? [])) as Row[]);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!focusSessionId) {
      setFocusEvents(null);
      return;
    }
    let cancelled = false;
    setFocusEvents(null);
    const supabase = createClient();
    void supabase
      .from("session_events")
      .select("*")
      .eq("session_id", focusSessionId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (!cancelled) setFocusEvents((data ?? []) as Row[]);
      });
    return () => {
      cancelled = true;
    };
  }, [focusSessionId]);

  useEffect(() => {
    if (!focusSessionId || loading) return;
    const session = sessions.find((item) => String(item.id) === focusSessionId);
    if (!session) return;
    setPersonId(String(session.user_id ?? "all"));
    setTab("actividad");
  }, [focusSessionId, loading, sessions]);

  const names = useMemo(() => labelsForPeople(profiles), [profiles]);

  const sessionById = useMemo(() => {
    const map = new Map<string, Row>();
    for (const session of sessions) map.set(String(session.id), session);
    return map;
  }, [sessions]);

  const personForSession = (sessionId: unknown) => {
    const session = sessionById.get(String(sessionId ?? ""));
    if (!session) return "—";
    return names.get(String(session.user_id ?? "")) ?? "Participante";
  };

  const scope = useMemo(() => {
    if (personId === "all") {
      return { profiles, sessions, submissions, drafts, events, notes, feedback };
    }
    const scopedSessions = sessions.filter((session) => String(session.user_id ?? "") === personId);
    const sessionIds = new Set(scopedSessions.map((session) => String(session.id)));
    return {
      profiles: profiles.filter((person) => String(person.id ?? "") === personId),
      sessions: scopedSessions,
      submissions: submissions.filter((row) => sessionIds.has(String(row.session_id ?? ""))),
      drafts: drafts.filter((row) => sessionIds.has(String(row.session_id ?? ""))),
      events: events.filter((row) => sessionIds.has(String(row.session_id ?? ""))),
      notes: notes.filter((row) => String(row.author_id ?? "") === personId),
      feedback: feedback.filter((row) => sessionIds.has(String(row.session_id ?? ""))),
    };
  }, [drafts, events, feedback, notes, personId, profiles, sessions, submissions]);

  const tables = useMemo<TableView[]>(() => {
    const source = scope;
    const testedIds = new Set(source.sessions.map((session) => String(session.user_id ?? "")));
    const profiles =
      insight?.id === "personas"
        ? source.profiles.filter((person) => testedIds.has(String(person.id ?? "")))
        : source.profiles;
    const sessions =
      insight?.id === "sesiones"
        ? source.sessions.filter((session) => matchesSession(session, insight))
        : source.sessions;
    const { submissions, drafts, notes, feedback } = source;
    const events = focusSessionId ? (focusEvents ?? []) : source.events;
    return [
      {
        id: "personas",
        title: "Personas",
        description: "Quién entró con Google o como invitado.",
        columns: ["Nombre", "Correo", "Rol", "Entró el"],
        rows: profiles.map((person) => [
          names.get(String(person.id ?? "")) ?? "Invitado",
          typeof person.email === "string" && person.email ? person.email : "Sin correo (invitado)",
          labelRole(typeof person.role === "string" ? person.role : null),
          formatWhen(typeof person.created_at === "string" ? person.created_at : null),
        ]),
      },
      {
        id: "sesiones",
        title: "Pruebas",
        description:
          "Cada vez que alguien empezó a cargar un proyecto, clásico o guiado. Si pasan 10 minutos sin actividad, también al cerrar la pestaña, la prueba pasa a abandonada.",
        columns: [
          "Persona",
          "Qué probó",
          "Tipo de formulario",
          "Estado",
          "Inicio",
          "Última actividad",
          "Cierre",
          "Dónde quedó",
          "Cuenta",
        ],
        rows: sessions
          .filter(
            (session) => session.flow_variant === "classic" || session.flow_variant === "guided",
          )
          .map((session) => {
          const meta = asRecord(session.client_meta);
          const guest = meta.guest === true;
          const lastActivity =
            typeof session.last_activity_at === "string"
              ? session.last_activity_at
              : typeof session.started_at === "string"
                ? session.started_at
                : null;
          return [
            names.get(String(session.user_id ?? "")) ?? "Participante",
            labelFlowPiece(typeof session.flow_piece === "string" ? session.flow_piece : null),
            labelVariant(typeof session.flow_variant === "string" ? session.flow_variant : null),
            labelStatus(sessionStatus(typeof session.status === "string" ? session.status : null, lastActivity)),
            formatWhen(typeof session.started_at === "string" ? session.started_at : null),
            formatWhen(lastActivity),
            formatWhen(typeof session.completed_at === "string" ? session.completed_at : null),
            labelStep(
              typeof session.current_step_id === "string" ? session.current_step_id : null,
              typeof session.flow_variant === "string" ? session.flow_variant : null,
            ),
            guest ? "Invitado" : "Google",
          ];
        }),
      },
      {
        id: "envios",
        title: "Proyectos enviados",
        description: "La versión final que la persona publicó.",
        columns: [
          "Persona",
          "Enviado el",
          "Tiempo hasta enviar",
          "Compañía",
          "País",
          "Título",
          "Problema",
          "Tipo de formulario",
        ],
        rows: submissions.map((submission) => {
          const company = asRecord(submission.company);
          const project = asRecord(submission.project);
          const session = sessionById.get(String(submission.session_id ?? ""));
          return [
            personForSession(submission.session_id),
            formatWhen(typeof submission.submitted_at === "string" ? submission.submitted_at : null),
            formatDuration(
              typeof session?.started_at === "string" ? session.started_at : null,
              typeof submission.submitted_at === "string" ? submission.submitted_at : null,
            ),
            textField(company, "companyName"),
            textField(company, "country"),
            textField(project, "title"),
            textField(project, "problem"),
            labelVariant(typeof session?.flow_variant === "string" ? session.flow_variant : null),
          ];
        }),
      },
      {
        id: "experiencia",
        title: "Experiencia al publicar",
        description:
          "Lo que dijeron después de publicar. No entra en el resumen ni en el recorrido: el formulario ya había terminado. Cada fila corresponde a una sesión y a su tipo de formulario.",
        columns: ["Persona", "Tipo de formulario", "Experiencia", "Comentario", "Cuándo"],
        rows: feedback.map((row) => {
          const session = sessionById.get(String(row.session_id ?? ""));
          const text = typeof row.comment === "string" ? row.comment.trim() : "";
          return [
            personForSession(row.session_id),
            labelVariant(typeof session?.flow_variant === "string" ? session.flow_variant : null),
            labelExperience(typeof row.rating === "string" ? row.rating : null),
            text || "—",
            formatWhen(typeof row.created_at === "string" ? row.created_at : null),
          ];
        }),
      },
      {
        id: "borradores",
        title: "Borradores",
        description: "Copias intermedias, útiles para ver hasta dónde llegó alguien que no envió.",
        columns: ["Persona", "Guardado el", "Por qué se guardó", "Paso", "Compañía", "Título"],
        rows: drafts.map((draft) => {
          const company = asRecord(draft.company);
          const project = asRecord(draft.project);
          const draftVariant = sessionById.get(String(draft.session_id ?? ""))?.flow_variant;
          return [
            personForSession(draft.session_id),
            formatWhen(typeof draft.captured_at === "string" ? draft.captured_at : null),
            labelSnapshotReason(typeof draft.capture_reason === "string" ? draft.capture_reason : null),
            labelStep(
              typeof draft.step_id === "string" ? draft.step_id : null,
              typeof draftVariant === "string" ? draftVariant : null,
            ),
            textField(company, "companyName"),
            textField(project, "title"),
          ];
        }),
      },
      {
        id: "actividad",
        title: "Qué hizo cada persona",
        description: focusSessionId
          ? "Los pasos, del primero al último, con los que se armó este envío. El número es el orden de esa vista o pregunta. El tiempo es cuánto pasó hasta el paso siguiente."
          : "El recorrido paso a paso. El número es el orden de esa vista o pregunta en su formulario. El tiempo es cuánto pasó hasta el registro siguiente de la misma prueba. Si hay muchas filas, se muestran las 500 más recientes.",
        columns: ["Cuándo", "Persona", "Qué pasó", "En qué paso", "Tiempo en este paso"],
        rows: events.map((event) => {
          const eventVariant = sessionById.get(String(event.session_id ?? ""))?.flow_variant;
          return [
            formatWhen(typeof event.created_at === "string" ? event.created_at : null),
            personForSession(event.session_id),
            labelEvent(typeof event.event_type === "string" ? event.event_type : null),
            labelEventStep(
              typeof event.event_type === "string" ? event.event_type : null,
              typeof event.step_id === "string" ? event.step_id : null,
              asRecord(event.payload),
              typeof eventVariant === "string" ? eventVariant : null,
            ),
            timeOnStep(events, event),
          ];
        }),
      },
      {
        id: "notas",
        title: "Notas del moderador",
        description: "Observaciones escritas por el equipo de research.",
        columns: ["Cuándo", "Autor", "Nota"],
        rows: notes.map((note) => [
          formatWhen(typeof note.created_at === "string" ? note.created_at : null),
          names.get(String(note.author_id ?? "")) ?? "Equipo",
          typeof note.note === "string" ? note.note : "—",
        ]),
      },
      {
        id: "invitaciones",
        title: "Invitaciones",
        description: "Correos habilitados para participar, si el equipo cargó una lista.",
        columns: ["Correo", "Nota", "Invitado el"],
        rows: invites.map((invite) => [
          typeof invite.email === "string" ? invite.email : "—",
          typeof invite.notes === "string" && invite.notes ? invite.notes : "—",
          formatWhen(typeof invite.created_at === "string" ? invite.created_at : null),
        ]),
      },
    ];
  }, [focusEvents, focusSessionId, insight, invites, names, personForSession, scope, sessionById]);

  const stats = useMemo(
    () => buildStats(scope.sessions, scope.submissions),
    [scope.sessions, scope.submissions],
  );
  const people = useMemo(
    () =>
      [...names.entries()]
        .map(([id, label]) => ({ id, label }))
        .sort((a, b) => a.label.localeCompare(b.label, "es")),
    [names],
  );
  const activeTable = tables.find((table) => table.id === tab);
  const focusLabel = useMemo(() => {
    if (!focusSessionId) return null;
    const submission = submissions.find((row) => String(row.session_id) === focusSessionId);
    const project = asRecord(submission?.project);
    const title = textField(project, "title");
    const who = names.get(String(sessionById.get(focusSessionId)?.user_id ?? "")) ?? "esta persona";
    return `pasos para armar «${title === "—" ? "este envío" : title}», de ${who}`;
  }, [focusSessionId, names, sessionById, submissions]);

  function clearFocus() {
    router.replace("/panel");
  }

  useEffect(() => {
    if (tab === "resumen" || (!insight && !focusSessionId)) return;
    detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusEvents, focusSessionId, insight, tab]);

  if (loading) {
    return <p className="rp-lead">Cargando los datos de las pruebas…</p>;
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  return (
    <div className="rp">
      <header className="rp-header">
        <p className="rp-eyebrow">Research</p>
        <h1 className="rp-title">Panel de pruebas</h1>
        <p className="rp-lead">
          {fullView
            ? "Estás viendo las pruebas de todo el equipo. Los números de abajo sirven para comparar el formulario clásico con las preguntas guiadas."
            : "Estás viendo solo tus pruebas. Para analizar las de todas las personas, alguien del equipo tiene que marcarte como investigador en la base."}
        </p>
        <label className="rp-filter">
          <span>Persona</span>
          <select
            value={personId}
            onChange={(event) => {
              setPersonId(event.target.value);
              if (focusSessionId) clearFocus();
            }}
          >
            <option value="all">Todas</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="rp-tabs" role="tablist" aria-label="Secciones del panel">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? "rp-tab is-active" : "rp-tab"}
            onClick={() => {
              setTab(item.id);
              setInsight(null);
              if (focusSessionId && item.id !== "actividad") clearFocus();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "resumen" ? (
        <Summary
          stats={stats}
          onOpen={(next) => {
            setInsight(next);
            setTab(next.id);
          }}
        />
      ) : null}
      {tab === "actividad" && focusSessionId && focusEvents === null ? (
        <p className="rp-lead">Cargando el recorrido…</p>
      ) : null}
      {activeTable && !(tab === "actividad" && focusSessionId && focusEvents === null) ? (
        <DataTable
          table={activeTable}
          detailRef={detailRef}
          detailLabel={focusLabel ?? (insight ? insightText(insight) : null)}
          onClearDetail={() => {
            if (focusSessionId) {
              clearFocus();
              return;
            }
            setInsight(null);
          }}
        />
      ) : null}
    </div>
  );
}

type Stats = ReturnType<typeof buildStats>;

function Summary({ stats, onOpen }: { stats: Stats; onOpen: (insight: Insight) => void }) {
  const cards: { label: string; value: string; insight: Insight }[] = [
    { label: "Personas que probaron", value: String(stats.peopleHint), insight: { id: "personas" } },
    {
      label: "Pruebas iniciadas",
      value: String(stats.started),
      insight: { id: "sesiones", status: "all", variant: "all", step: null },
    },
    {
      label: "Enviadas",
      value: `${stats.submitted} (${stats.submittedPct})`,
      insight: { id: "sesiones", status: "submitted", variant: "all", step: null },
    },
    {
      label: "Abandonadas",
      value: `${stats.abandoned} (${stats.abandonedPct})`,
      insight: { id: "sesiones", status: "abandoned", variant: "all", step: null },
    },
    {
      label: "En curso",
      value: String(stats.inProgress),
      insight: { id: "sesiones", status: "in_progress", variant: "all", step: null },
    },
    { label: "Proyectos publicados", value: String(stats.submissions), insight: { id: "envios" } },
  ];

  return (
    <section className="rp-summary" aria-label="Resumen">
      <ul className="rp-cards">
        {cards.map((card) => (
          <li key={card.label} className="rp-card">
            <button type="button" className="rp-card-button" onClick={() => onOpen(card.insight)}>
              <span className="rp-card-value">{card.value}</span>
              <span className="rp-card-label">{card.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="rp-compare">
        <h2>Formulario clásico y preguntas guiadas</h2>
        <table className="rp-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Iniciadas</th>
              <th>Enviadas</th>
              <th>Llegaron a enviar</th>
            </tr>
          </thead>
          <tbody>
            {stats.variants.map((row) => (
              <tr key={row.key}>
                <td>
                  <button
                    type="button"
                    className="rp-insight"
                    aria-label={`${row.label}: ver las pruebas iniciadas`}
                    onClick={() => onOpen({ id: "sesiones", status: "all", variant: row.key, step: null })}
                  >
                    {row.label}
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    className="rp-insight"
                    aria-label={`${row.label}: ${row.started} iniciadas`}
                    onClick={() => onOpen({ id: "sesiones", status: "all", variant: row.key, step: null })}
                  >
                    {row.started}
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    className="rp-insight"
                    aria-label={`${row.label}: ${row.submitted} enviadas`}
                    onClick={() =>
                      onOpen({ id: "sesiones", status: "submitted", variant: row.key, step: null })
                    }
                  >
                    {row.submitted}
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    className="rp-insight"
                    aria-label={`${row.label}: ${row.rate} llegaron a enviar`}
                    onClick={() =>
                      onOpen({ id: "sesiones", status: "submitted", variant: row.key, step: null })
                    }
                  >
                    {row.rate}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rp-compare">
        <h2>Dónde se frenan las pruebas que no se enviaron</h2>
        {stats.stuck.length === 0 ? (
          <p className="rp-muted">Todavía no hay pruebas abandonadas o a medias.</p>
        ) : (
          <table className="rp-table">
            <thead>
              <tr>
                <th>Paso</th>
                <th>Tipo de formulario</th>
                <th>Pruebas</th>
              </tr>
            </thead>
            <tbody>
              {stats.stuck.map((row) => (
                <tr
                  key={`${row.variantKey}-${row.label}`}
                  className="rp-row-link"
                  tabIndex={0}
                  onClick={() =>
                    onOpen({
                      id: "sesiones",
                      status: "all",
                      variant: row.variantKey,
                      step: row.label,
                    })
                  }
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    onOpen({
                      id: "sesiones",
                      status: "all",
                      variant: row.variantKey,
                      step: row.label,
                    });
                  }}
                >
                  <td>{row.label}</td>
                  <td>{row.variant}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function DataTable({
  table,
  detailRef,
  detailLabel,
  onClearDetail,
}: {
  table: TableView;
  detailRef: RefObject<HTMLElement | null>;
  detailLabel: string | null;
  onClearDetail: () => void;
}) {
  return (
    <section ref={detailRef} className="rp-section" aria-label={table.title}>
      <div className="rp-section-head">
        <div>
          <h2>{table.title}</h2>
          <p>{table.description}</p>
          {detailLabel ? (
            <p className="rp-detail">
              Detalle: {detailLabel}
              <button type="button" onClick={onClearDetail}>
                Ver todo
              </button>
            </p>
          ) : null}
        </div>
        <button type="button" className="rp-download" onClick={() => downloadCsv(table)}>
          Descargar Excel
        </button>
      </div>
      {table.rows.length === 0 ? (
        <p className="rp-muted">Todavía no hay datos en esta tabla.</p>
      ) : (
        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                {table.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, index) => (
                <tr key={`${table.id}-${index}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${table.columns[cellIndex]}-${index}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function rawPersonName(person: Row) {
  const fullName = typeof person.full_name === "string" ? person.full_name.trim() : "";
  const email = typeof person.email === "string" ? person.email.trim() : "";
  return fullName || email || "Invitado";
}

function isGuestProfile(person: Row) {
  const email = typeof person.email === "string" ? person.email.trim() : "";
  return email.length === 0;
}

function labelsForPeople(profiles: Row[]) {
  const labels = new Map<string, string>();
  for (const person of profiles) {
    labels.set(String(person.id ?? ""), rawPersonName(person));
  }

  const unnamedGuests = profiles
    .filter((person) => isGuestProfile(person) && rawPersonName(person) === "Invitado")
    .slice()
    .sort((a, b) => {
      const createdA = String(a.created_at ?? "");
      const createdB = String(b.created_at ?? "");
      if (createdA !== createdB) return createdA < createdB ? -1 : 1;
      return String(a.id ?? "").localeCompare(String(b.id ?? ""));
    });

  if (unnamedGuests.length > 1) {
    unnamedGuests.forEach((person, index) => {
      labels.set(String(person.id ?? ""), `Invitado ${index + 1}`);
    });
  }

  return labels;
}

function buildStats(sessions: Row[], submissions: Row[]) {
  const formSessions = sessions.filter((session) => session.flow_piece === "formulario_inicial");
  const started = formSessions.length;
  const submitted = formSessions.filter((session) => session.status === "submitted").length;
  const abandoned = formSessions.filter((session) => activityStatus(session) === "abandoned").length;
  const inProgress = formSessions.filter((session) => activityStatus(session) === "in_progress").length;
  const people = new Set(sessions.map((session) => String(session.user_id ?? ""))).size;

  const variants = (["classic", "guided"] as const).map((variant) => {
    const rows = formSessions.filter((session) => session.flow_variant === variant);
    const done = rows.filter((session) => session.status === "submitted").length;
    return {
      key: variant,
      label: labelVariant(variant),
      started: rows.length,
      submitted: done,
      rate: percent(done, rows.length),
    };
  });

  const stuckMap = new Map<
    string,
    { label: string; variant: string; variantKey: "classic" | "guided"; count: number }
  >();
  for (const session of formSessions) {
    if (session.status === "submitted") continue;
    const variantKey = session.flow_variant === "guided" ? "guided" : "classic";
    const label = labelStep(
      typeof session.current_step_id === "string" ? session.current_step_id : null,
      variantKey,
    );
    const variant = labelVariant(variantKey);
    const key = `${variantKey}\u0000${label}`;
    const current = stuckMap.get(key);
    if (current) {
      current.count += 1;
    } else {
      stuckMap.set(key, { label, variant, variantKey, count: 1 });
    }
  }
  const stuck = [...stuckMap.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"));

  return {
    peopleHint: people,
    started,
    submitted,
    abandoned,
    inProgress,
    submissions: submissions.length,
    submittedPct: percent(submitted, started),
    abandonedPct: percent(abandoned, started),
    variants,
    stuck,
  };
}

function timeOnStep(events: Row[], event: Row) {
  const sessionId = String(event.session_id ?? "");
  const currentAt = typeof event.created_at === "string" ? event.created_at : "";
  if (!sessionId || !currentAt) return "—";

  let nextAt: string | null = null;
  for (const other of events) {
    if (String(other.session_id ?? "") !== sessionId) continue;
    const createdAt = typeof other.created_at === "string" ? other.created_at : "";
    if (!createdAt || createdAt < currentAt) continue;
    if (createdAt === currentAt && Number(other.id ?? 0) <= Number(event.id ?? 0)) continue;
    if (!nextAt || createdAt < nextAt) nextAt = createdAt;
  }

  return formatDuration(currentAt, nextAt);
}

function matchesSession(session: Row, insight: Extract<Insight, { id: "sesiones" }>) {
  if (session.flow_piece !== "formulario_inicial") return false;
  if (insight.variant !== "all" && session.flow_variant !== insight.variant) return false;
  if (insight.step) {
    if (session.status === "submitted") return false;
    const step = labelStep(
      typeof session.current_step_id === "string" ? session.current_step_id : null,
      session.flow_variant === "guided" ? "guided" : "classic",
    );
    return step === insight.step;
  }
  return insight.status === "all" || activityStatus(session) === insight.status;
}

function activityStatus(session: Row) {
  const lastActivity =
    typeof session.last_activity_at === "string"
      ? session.last_activity_at
      : typeof session.started_at === "string"
        ? session.started_at
        : null;
  return sessionStatus(typeof session.status === "string" ? session.status : null, lastActivity);
}

function insightText(insight: Insight) {
  if (insight.id === "personas") return "personas que probaron";
  if (insight.id === "envios") return "proyectos publicados";
  if (insight.step) {
    return `pruebas frenadas en “${insight.step}” · ${labelVariant(insight.variant)}`;
  }
  const status =
    insight.status === "submitted"
      ? "enviadas"
      : insight.status === "abandoned"
        ? "abandonadas"
        : insight.status === "in_progress"
          ? "en curso"
          : "iniciadas";
  return insight.variant === "all"
    ? `pruebas ${status}`
    : `pruebas ${status} · ${labelVariant(insight.variant)}`;
}

function percent(part: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function downloadCsv(table: TableView) {
  const lines = [table.columns, ...table.rows].map((row) =>
    row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";"),
  );
  const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${table.id}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
