import type { TemplateId, TemplateMeta } from "./types";

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "moderno",
    name: "Moderno",
    category: "moderno",
    blurb: "Barra lateral, hierarquia clara e um ar contemporâneo.",
    premium: false,
    supportsPhoto: true,
  },
  {
    id: "executivo",
    name: "Executivo",
    category: "executivo",
    blurb: "Sério, corporativo e pensado para cargos de direcção.",
    premium: true,
    supportsPhoto: true,
  },
  {
    id: "minimalista",
    name: "Minimalista",
    category: "minimalista",
    blurb: "Muito espaço em branco e tipografia limpa.",
    premium: false,
    supportsPhoto: true,
  },
  {
    id: "criativo",
    name: "Criativo",
    category: "criativo",
    blurb: "Para marketing, design, comunicação e social media.",
    premium: true,
    supportsPhoto: true,
  },
  {
    id: "ats",
    name: "ATS",
    category: "ats",
    blurb: "Uma coluna, sem gráficos — fácil de ler por sistemas ATS.",
    premium: false,
    supportsPhoto: true,
  },
  {
    id: "classico",
    name: "Clássico",
    category: "profissional",
    blurb: "O currículo tradicional, centrado e elegante.",
    premium: true,
    supportsPhoto: true,
  },
  {
    id: "tecnico",
    name: "Técnico",
    category: "profissional",
    blurb: "Compacto, para informática, engenharia e tecnologia.",
    premium: true,
    supportsPhoto: true,
  },
  {
    id: "academico",
    name: "Académico",
    category: "simples",
    blurb: "Formação em destaque — ideal para o primeiro emprego.",
    premium: true,
    supportsPhoto: true,
  },
];

export const TEMPLATE_CATEGORIES: { id: TemplateMeta["category"] | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "moderno", label: "Moderno" },
  { id: "profissional", label: "Profissional" },
  { id: "simples", label: "Simples" },
  { id: "executivo", label: "Executivo" },
  { id: "criativo", label: "Criativo" },
  { id: "minimalista", label: "Minimalista" },
  { id: "ats", label: "ATS" },
];

export function getTemplate(id: string): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]!;
}

export function isTemplateId(id: string): id is TemplateId {
  return TEMPLATES.some((t) => t.id === id);
}
