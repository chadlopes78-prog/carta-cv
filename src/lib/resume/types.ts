export type LanguageLevel = "basico" | "intermedio" | "avancado" | "fluente" | "nativo";

export type PersonalInfo = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  linkedin: string;
  website: string;
  photo: string | null;
  photoUrl: string | null;
  photoEnabled: boolean;
  photoCrop: { x: number; y: number };
  photoPosition: { x: number; y: number };
  photoZoom: number;
  photoRotate: number;
  photoShape: "circle" | "square";
};

export type ExperienceItem = {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

export type EducationItem = {
  id: string;
  course: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type SkillItem = { id: string; name: string };
export type LanguageItem = { id: string; name: string; level: LanguageLevel };
export type CertificationItem = { id: string; name: string; institution: string; year: string };
export type CourseItem = { id: string; name: string; institution: string; year: string };
export type ProjectItem = { id: string; name: string; description: string; url: string };
export type ReferenceItem = {
  id: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
};

export type ResumeSettings = {
  color: string;
  font: "serif" | "sans" | "mono";
  fontSize: "sm" | "md" | "lg";
  spacing: "compact" | "normal" | "relaxed";
  showPhoto: boolean;
  referencesOnRequest: boolean;
};

export type ResumePayload = {
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  certifications: CertificationItem[];
  courses: CourseItem[];
  projects: ProjectItem[];
  references: ReferenceItem[];
  volunteer: ExperienceItem[];
};

export type ResumeRecord = {
  id: string;
  userId: string;
  name: string;
  templateId: string;
  payload: ResumePayload;
  settings: ResumeSettings;
  downloads: number;
  createdAt: string;
  updatedAt: string;
};

export type TemplateId =
  | "moderno"
  | "executivo"
  | "minimalista"
  | "criativo"
  | "ats"
  | "classico"
  | "tecnico"
  | "academico";

export type TemplateCategory =
  | "moderno"
  | "profissional"
  | "simples"
  | "executivo"
  | "criativo"
  | "minimalista"
  | "ats";

export type TemplateMeta = {
  id: TemplateId;
  name: string;
  category: TemplateCategory;
  blurb: string;
  premium: boolean;
  supportsPhoto: boolean;
};
