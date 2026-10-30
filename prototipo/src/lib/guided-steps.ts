import { countries } from "@/lib/countries";
import {
  businessSectors,
  deliverables,
  impactOptions,
  organizationSizes,
  organizationTypes,
  projectStages,
  roles,
  tools,
  verticals,
} from "@/lib/form-options";
import type { ProjectDraft } from "@/lib/form-storage";

export const GUIDED_STEP_STORAGE_KEY = "nocountry-guided-step";

const TITLE_MAX = 100;
const PROBLEM_MAX = 512;
const DESCRIPTION_MAX = 10000;

type StepBase = {
  id: string;
  sectionLabel: string;
  question: string;
  hint?: string;
  required: boolean;
  /** Segundos que suele llevar responder este paso. Alimenta el tiempo restante. */
  estimatedSeconds: number;
};

export type GuidedStep =
  | (StepBase & {
      scope: "company";
      key: "companyName";
      kind: "text";
      placeholder: string;
    })
  | (StepBase & {
      scope: "company";
      key: "organizationType" | "organizationSize" | "country";
      kind: "select";
      placeholder: string;
      options: readonly string[];
    })
  | (StepBase & {
      scope: "company";
      key: "phoneNumber";
      kind: "phone";
      placeholder: string;
    })
  | (StepBase & {
      scope: "project";
      key: "title" | "problem";
      kind: "text";
      placeholder: string;
      maxLength: number;
    })
  | (StepBase & {
      scope: "project";
      key: "challengeDescription";
      kind: "textarea";
      placeholder: string;
      maxLength: number;
    })
  | (StepBase & {
      scope: "project";
      key: "vertical" | "stage" | "impact";
      kind: "select";
      placeholder: string;
      options: readonly string[];
    })
  | (StepBase & {
      scope: "project";
      key: "deliverables" | "sectors" | "roles" | "tools";
      kind: "multiselect";
      placeholder: string;
      options: readonly string[];
      max: number;
    });

export const guidedSteps: GuidedStep[] = [
  {
    id: "company-name",
    scope: "company",
    key: "companyName",
    kind: "text",
    sectionLabel: "Información de la compañía",
    question: "¿Cuál es el nombre de la compañía?",
    required: true,
    estimatedSeconds: 20,
    placeholder: "Ej. InnovaSoft",
  },
  {
    id: "organization-type",
    scope: "company",
    key: "organizationType",
    kind: "select",
    sectionLabel: "Información de la compañía",
    question: "¿Qué tipo de organización es?",
    required: true,
    estimatedSeconds: 12,
    placeholder: "Seleccionar…",
    options: organizationTypes,
  },
  {
    id: "organization-size",
    scope: "company",
    key: "organizationSize",
    kind: "select",
    sectionLabel: "Información de la compañía",
    question: "¿Cuál es el tamaño de la organización?",
    required: true,
    estimatedSeconds: 12,
    placeholder: "Seleccionar…",
    options: organizationSizes,
  },
  {
    id: "country",
    scope: "company",
    key: "country",
    kind: "select",
    sectionLabel: "Información de la compañía",
    question: "¿En qué país está la compañía?",
    required: true,
    estimatedSeconds: 15,
    placeholder: "Selecciona un país",
    options: countries.map((country) => country.name),
  },
  {
    id: "phone",
    scope: "company",
    key: "phoneNumber",
    kind: "phone",
    sectionLabel: "Información de la compañía",
    question: "¿Cuál es el teléfono de contacto?",
    hint: "El código de área se completa con el país que elegiste.",
    required: true,
    estimatedSeconds: 18,
    placeholder: "3751364441",
  },
  {
    id: "title",
    scope: "project",
    key: "title",
    kind: "text",
    sectionLabel: "Detalles del proyecto",
    question: "¿Cuál es el título del proyecto?",
    hint: `Hasta ${TITLE_MAX} caracteres.`,
    required: true,
    estimatedSeconds: 25,
    placeholder: "ej. Plataforma de E-commerce para PYMES",
    maxLength: TITLE_MAX,
  },
  {
    id: "problem",
    scope: "project",
    key: "problem",
    kind: "text",
    sectionLabel: "Detalles del proyecto",
    question: "¿Qué problema quieres resolver?",
    hint: `Hasta ${PROBLEM_MAX} caracteres.`,
    required: true,
    estimatedSeconds: 35,
    placeholder: "Ej. Reducir abandono en onboarding de usuarios",
    maxLength: PROBLEM_MAX,
  },
  {
    id: "description",
    scope: "project",
    key: "challengeDescription",
    kind: "textarea",
    sectionLabel: "Detalles del proyecto",
    question: "¿Cómo describirías el desafío?",
    hint: `Hasta ${DESCRIPTION_MAX} caracteres.`,
    required: true,
    estimatedSeconds: 90,
    placeholder:
      "Ej. Somos una startup B2B SaaS en etapa MVP. Notamos que muchos usuarios abandonan el onboarding antes de completar la primera acción clave...",
    maxLength: DESCRIPTION_MAX,
  },
  {
    id: "deliverables",
    scope: "project",
    key: "deliverables",
    kind: "multiselect",
    sectionLabel: "Detalles del proyecto",
    question: "¿Qué esperas que los equipos entreguen?",
    hint: "Podés elegir hasta 5.",
    required: true,
    estimatedSeconds: 25,
    placeholder: "Selecciona entregables",
    options: deliverables,
    max: 5,
  },
  {
    id: "vertical",
    scope: "project",
    key: "vertical",
    kind: "select",
    sectionLabel: "Detalles del proyecto",
    question: "¿Cuál es la vertical del proyecto?",
    required: true,
    estimatedSeconds: 15,
    placeholder: "Selecciona una vertical",
    options: verticals,
  },
  {
    id: "sectors",
    scope: "project",
    key: "sectors",
    kind: "multiselect",
    sectionLabel: "Detalles del proyecto",
    question: "¿Qué sectores de negocio abarca?",
    hint: "Podés elegir hasta 5.",
    required: true,
    estimatedSeconds: 30,
    placeholder: "Selecciona sectores",
    options: businessSectors,
    max: 5,
  },
  {
    id: "stage",
    scope: "project",
    key: "stage",
    kind: "select",
    sectionLabel: "Detalles del proyecto",
    question: "¿En qué etapa está el proyecto?",
    required: true,
    estimatedSeconds: 12,
    placeholder: "Selecciona la etapa",
    options: projectStages,
  },
  {
    id: "impact",
    scope: "project",
    key: "impact",
    kind: "select",
    sectionLabel: "Detalles del proyecto",
    question: "¿Qué impacto tendría resolver esto?",
    required: true,
    estimatedSeconds: 15,
    placeholder: "Selecciona el impacto",
    options: impactOptions,
  },
  {
    id: "roles",
    scope: "project",
    key: "roles",
    kind: "multiselect",
    sectionLabel: "Detalles del proyecto",
    question: "¿Qué roles te interesan?",
    hint: "Opcional. Hasta 7.",
    required: false,
    estimatedSeconds: 25,
    placeholder: "Selecciona roles",
    options: roles,
    max: 7,
  },
  {
    id: "tools",
    scope: "project",
    key: "tools",
    kind: "multiselect",
    sectionLabel: "Detalles del proyecto",
    question: "¿Qué herramientas te interesan?",
    hint: "Opcional. Hasta 10.",
    required: false,
    estimatedSeconds: 30,
    placeholder: "Selecciona herramientas",
    options: tools,
    max: 10,
  },
];

export function formatStepCounter(index: number, total = guidedSteps.length): string {
  const current = String(index + 1).padStart(2, "0");
  const all = String(total).padStart(2, "0");
  return `Paso ${current}/${all}`;
}

export function progressPercent(index: number, total = guidedSteps.length): number {
  if (total <= 0) return 0;
  return Math.round(((index + 1) / total) * 100);
}

export function remainingSeconds(index: number, steps: readonly GuidedStep[] = guidedSteps): number {
  return steps.slice(index).reduce((sum, step) => sum + step.estimatedSeconds, 0);
}

export function formatRemainingTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return "Listo para enviar";
  if (totalSeconds < 60) return "Menos de 1 min";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const minuteLabel = minutes === 1 ? "1 min" : `${minutes} min`;
  if (seconds === 0) {
    return minutes === 1 ? "≈ 1 min restante" : `≈ ${minutes} min restantes`;
  }
  return `≈ ${minuteLabel} ${seconds} s restantes`;
}

export function isStepFilled(step: GuidedStep, draft: ProjectDraft): boolean {
  if (step.scope === "company") {
    return draft.company[step.key].trim().length > 0;
  }
  const value = draft.project[step.key];
  if (Array.isArray(value)) return value.length > 0;
  return value.trim().length > 0;
}

export function canStayOnStep(draft: ProjectDraft, index: number): boolean {
  return guidedSteps
    .slice(0, index)
    .every((step) => !step.required || isStepFilled(step, draft));
}

export function firstIncompleteStep(draft: ProjectDraft): number {
  const index = guidedSteps.findIndex((step) => step.required && !isStepFilled(step, draft));
  return index === -1 ? guidedSteps.length - 1 : index;
}
