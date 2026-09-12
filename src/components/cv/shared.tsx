import type { LanguageLevel, ResumePayload } from "@/lib/resume/types";

export const LEVEL_LABEL: Record<LanguageLevel, string> = {
  basico: "Básico",
  intermedio: "Intermédio",
  avancado: "Avançado",
  fluente: "Fluente",
  nativo: "Nativo",
};

export function formatPeriod(start: string, end: string, current?: boolean) {
  if (!start && !end && !current) return "";
  const a = start || "";
  const b = current ? "Presente" : end || "";
  return [a, b].filter(Boolean).join(" — ");
}

export function contactLine(p: ResumePayload["personal"]) {
  return [p.city && p.country ? `${p.city}, ${p.country}` : p.city || p.country, p.phone, p.email, p.linkedin, p.website]
    .filter(Boolean)
    .join("  ·  ");
}

export function hasContent(value: string | undefined | null) {
  return Boolean(value && value.trim());
}
