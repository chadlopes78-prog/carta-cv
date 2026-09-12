/** Local text polish — never invents facts the user did not write. */

function tidy(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function capFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function improveSummary(text: string): string {
  const t = tidy(text);
  if (!t) return t;
  let out = capFirst(t);
  if (!/[.!?]$/.test(out)) out += ".";
  return out;
}

export function improveExperience(text: string): string {
  const t = tidy(text);
  if (!t) return t;
  const sentences = t
    .split(/(?<=[.!?])\s+/)
    .map((s) => capFirst(s.replace(/^[•\-*]\s*/, "")))
    .filter(Boolean);
  return sentences.join(" ");
}

export function suggestSkills(payloadSummary: string, existing: string[]): string[] {
  const pool = [
    "Comunicação",
    "Trabalho em equipa",
    "Organização",
    "Microsoft Office",
    "Atendimento ao cliente",
    "Resolução de problemas",
    "Pontualidade",
    "Gestão de tempo",
  ];
  const have = new Set(existing.map((s) => s.toLowerCase()));
  const extra = pool.filter((s) => !have.has(s.toLowerCase()));
  if (/excel|dados|contab/i.test(payloadSummary)) extra.unshift("Microsoft Excel");
  if (/program|dev|soft/i.test(payloadSummary)) extra.unshift("Programação");
  return extra.slice(0, 5);
}

export function simplifyText(text: string): string {
  return tidy(text)
    .replace(/\b(actualmente|atualmente)\b/gi, "hoje")
    .replace(/\bresponsável por\b/gi, "fiz")
    .replace(/\bno sentido de\b/gi, "para");
}
