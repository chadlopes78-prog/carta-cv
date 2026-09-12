import type { ResumePayload, ResumeSettings } from "./types";
import { defaultPhotoFields } from "./photo";

export function uid(prefix = "id"): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export const defaultSettings = (): ResumeSettings => ({
  color: "#1F5C45",
  font: "sans",
  fontSize: "md",
  spacing: "normal",
  showPhoto: true,
  referencesOnRequest: true,
});

export const emptyPayload = (): ResumePayload => ({
  personal: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    city: "",
    country: "Moçambique",
    linkedin: "",
    website: "",
    ...defaultPhotoFields(),
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  courses: [],
  projects: [],
  references: [],
  volunteer: [],
});

export const samplePayload = (): ResumePayload => ({
  personal: {
    fullName: "Ana Lúcia Machava",
    title: "Assistente administrativa",
    email: "ana.machava@email.com",
    phone: "+258 84 123 4567",
    city: "Maputo",
    country: "Moçambique",
    linkedin: "linkedin.com/in/anamachava",
    website: "",
    ...defaultPhotoFields(),
  },
  summary:
    "Profissional organizada, com 4 anos de experiência em atendimento, gestão de documentos e apoio à direcção. Procuro uma posição onde possa contribuir com rigor, comunicação clara e sentido de responsabilidade.",
  experience: [
    {
      id: "ex1",
      title: "Assistente administrativa",
      company: "Grupo Teles",
      location: "Maputo",
      startDate: "2021-03",
      endDate: "",
      current: true,
      description:
        "Gestão de agenda da direcção, atendimento a clientes e fornecedores, organização de arquivos e apoio em processos de RH.",
    },
    {
      id: "ex2",
      title: "Recepcionista",
      company: "Hotel Polana",
      location: "Maputo",
      startDate: "2019-01",
      endDate: "2021-02",
      current: false,
      description: "Atendimento presencial e telefónico, check-in de hóspedes e coordenação com equipas de operações.",
    },
  ],
  education: [
    {
      id: "ed1",
      course: "Licenciatura em Gestão",
      institution: "Universidade Eduardo Mondlane",
      location: "Maputo",
      startDate: "2015",
      endDate: "2019",
      description: "",
    },
  ],
  skills: [
    { id: "s1", name: "Microsoft Excel" },
    { id: "s2", name: "Atendimento ao cliente" },
    { id: "s3", name: "Organização" },
    { id: "s4", name: "Português e Inglês" },
  ],
  languages: [
    { id: "l1", name: "Português", level: "nativo" },
    { id: "l2", name: "Inglês", level: "intermedio" },
    { id: "l3", name: "Changana", level: "fluente" },
  ],
  certifications: [{ id: "c1", name: "Excel avançado", institution: "Microsoft", year: "2023" }],
  courses: [{ id: "co1", name: "Gestão de escritório", institution: "ISCTEM", year: "2022" }],
  projects: [],
  references: [],
  volunteer: [],
});
