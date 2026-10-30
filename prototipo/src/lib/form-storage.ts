export type CompanyFormData = {
  companyName: string;
  organizationType: string;
  organizationSize: string;
  country: string;
  phoneDialCode: string;
  phoneNumber: string;
};

export type ProjectFormData = {
  title: string;
  problem: string;
  challengeDescription: string;
  deliverables: string[];
  vertical: string;
  sectors: string[];
  stage: string;
  impact: string;
  roles: string[];
  tools: string[];
};

export type ProjectDraft = {
  company: CompanyFormData;
  project: ProjectFormData;
};

export const DRAFT_STORAGE_KEY = "nocountry-project-draft";
const STORAGE_KEY = DRAFT_STORAGE_KEY;

const emptyCompany = (): CompanyFormData => ({
  companyName: "",
  organizationType: "",
  organizationSize: "",
  country: "",
  phoneDialCode: "",
  phoneNumber: "",
});

const emptyProject = (): ProjectFormData => ({
  title: "",
  problem: "",
  challengeDescription: "",
  deliverables: [],
  vertical: "",
  sectors: [],
  stage: "",
  impact: "",
  roles: [],
  tools: [],
});

export function loadDraft(): ProjectDraft {
  if (typeof window === "undefined") {
    return { company: emptyCompany(), project: emptyProject() };
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { company: emptyCompany(), project: emptyProject() };
    }
    const parsed = JSON.parse(raw) as Partial<ProjectDraft>;
    return {
      company: { ...emptyCompany(), ...parsed.company },
      project: { ...emptyProject(), ...parsed.project },
    };
  } catch {
    return { company: emptyCompany(), project: emptyProject() };
  }
}

export function saveCompany(data: CompanyFormData) {
  const draft = loadDraft();
  draft.company = data;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function saveProject(data: ProjectFormData) {
  const draft = loadDraft();
  draft.project = data;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearDraft() {
  sessionStorage.removeItem(STORAGE_KEY);
}
