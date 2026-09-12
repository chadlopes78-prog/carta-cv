import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/resume/templates";
import { samplePayload, defaultSettings } from "@/lib/resume/defaults";
import { CvDocument } from "@/components/cv/document";
import { ScaledPreview } from "@/components/cv/scaled-preview";
import { createResume } from "@/lib/resume/server";
import { cn } from "@/lib/cn";

type Search = { modelo?: string };

export const Route = createFileRoute("/cv/novo")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    modelo: typeof s.modelo === "string" ? s.modelo : undefined,
  }),
  component: NovoCv,
});

function NovoCv() {
  const { modelo } = Route.useSearch();
  const navigate = useNavigate();
  const [cat, setCat] = useState<(typeof TEMPLATE_CATEGORIES)[number]["id"]>("todos");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const list = useMemo(
    () => TEMPLATES.filter((t) => cat === "todos" || t.category === cat || t.id === modelo),
    [cat, modelo],
  );

  async function useTemplate(id: string) {
    setBusy(id);
    setError("");
    try {
      const { id: resumeId } = await createResume({ data: { templateId: id, name: "CV sem título" } });
      navigate({ to: "/cv/$id/editar", params: { id: resumeId } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível criar o CV.");
      setBusy(null);
    }
  }

  return (
    <AppShell>
      <h1 className="font-display text-2xl sm:text-3xl">Escolhe o teu modelo</h1>
      <p className="mt-2 text-muted">Depois preenches os dados. Podes mudar de modelo a qualquer momento.</p>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={cn(
              "h-10 shrink-0 rounded-full px-4 text-sm",
              cat === c.id ? "bg-ink text-cream" : "bg-cream text-muted ring-1 ring-line",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {list.map((t) => (
          <article key={t.id} className="overflow-hidden rounded-lg bg-cream shadow-card">
            <ScaledPreview>
              <CvDocument payload={samplePayload()} settings={defaultSettings()} templateId={t.id} />
            </ScaledPreview>
            <div className="flex flex-col gap-3 border-t border-line p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium">
                  {t.name} {t.premium && <span className="ml-1 text-xs text-forest">Premium</span>}
                </p>
                <p className="text-sm text-muted">{t.category}</p>
              </div>
              <Button className="w-full sm:w-auto" onClick={() => useTemplate(t.id)} disabled={busy === t.id}>
                {busy === t.id ? "A criar…" : "Usar este modelo"}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
