import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Download, Eye, Printer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label, Textarea } from "@/components/ui/input";
import { CvDocument } from "./document";
import { PhotoField } from "./photo-field";
import { ScaledPreview } from "./scaled-preview";
import { defaultSettings, emptyPayload, uid } from "@/lib/resume/defaults";
import { normalizePersonal } from "@/lib/resume/photo";
import { improveExperience, improveSummary, simplifyText, suggestSkills } from "@/lib/resume/improve";
import { TEMPLATES, getTemplate } from "@/lib/resume/templates";
import type { LanguageLevel, ResumePayload, ResumeRecord, ResumeSettings } from "@/lib/resume/types";
import { saveResume, recordDownload } from "@/lib/resume/server";
import { downloadCvPdf, printCv } from "@/lib/resume/pdf";
import { cn } from "@/lib/cn";

const STEPS = [
  { id: "info", label: "Informações" },
  { id: "perfil", label: "Perfil" },
  { id: "exp", label: "Experiência" },
  { id: "edu", label: "Formação" },
  { id: "skills", label: "Competências" },
  { id: "fim", label: "Finalizar" },
] as const;

export function EditorPage({ initial }: { initial: ResumeRecord }) {
  const [name, setName] = useState(initial.name);
  const [templateId, setTemplateId] = useState(initial.templateId);
  const [payload, setPayload] = useState<ResumePayload>(() => {
    const base = initial.payload ?? emptyPayload();
    return { ...base, personal: normalizePersonal(base.personal) };
  });
  const [settings, setSettings] = useState<ResumeSettings>(initial.settings ?? defaultSettings());
  const [step, setStep] = useState(0);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [mobilePreview, setMobilePreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef({ name, templateId, payload, settings });
  latest.current = { name, templateId, payload, settings };

  const persist = useCallback(async () => {
    setSaveState("saving");
    try {
      const cur = latest.current;
      await saveResume({
        data: {
          id: initial.id,
          name: cur.name,
          templateId: cur.templateId,
          payload: cur.payload,
          settings: cur.settings,
        },
      });
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }, [initial.id]);

  useEffect(() => {
    setSaveState("saving");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void persist();
    }, 700);
    return () => window.clearTimeout(timer.current);
  }, [name, templateId, payload, settings, persist]);

  const p = payload.personal;
  const noExp = payload.experience.length === 0;

  function patchPersonal(partial: Partial<ResumePayload["personal"]>) {
    setPayload((prev) => ({ ...prev, personal: { ...normalizePersonal(prev.personal), ...partial } }));
  }

  async function handlePdf() {
    const node = printRef.current?.querySelector(".cv-page") as HTMLElement | null;
    if (!node) return;
    await downloadCvPdf(node, name || "cv");
    void recordDownload({ data: { id: initial.id } });
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-dvh overflow-x-clip bg-paper pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-0">
      <header className="no-print sticky top-0 z-20 flex items-center gap-2 border-b border-line bg-cream/95 px-2 py-2 backdrop-blur sm:gap-3 sm:px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <Link
          to="/dashboard"
          className="flex size-11 shrink-0 items-center justify-center text-muted sm:w-auto sm:gap-1 sm:px-1"
          aria-label="Dashboard"
        >
          <ChevronLeft className="size-5" />
          <span className="hidden text-sm sm:inline">Dashboard</span>
        </Link>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 min-w-0 flex-1 text-center text-sm"
          aria-label="Nome do CV"
        />
        <p className="w-16 shrink-0 text-right text-[11px] text-muted sm:w-24 sm:text-xs">
          {saveState === "saving" && "A guardar…"}
          {saveState === "saved" && "Guardado"}
          {saveState === "error" && "Erro"}
        </p>
      </header>

      <div className="no-print h-1 bg-line">
        <div className="h-full bg-forest transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="mx-auto grid min-w-0 max-w-[1400px] lg:grid-cols-[minmax(0,1fr)_minmax(280px,520px)]">
        <div className="min-w-0 px-4 py-5 sm:px-6">
          <ol className="mb-5 flex gap-1 overflow-x-auto pb-1 text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STEPS.map((s, i) => (
              <li key={s.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className={cn("h-11 rounded-full px-3", i === step ? "bg-ink text-cream" : "text-muted")}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ol>

          {step === 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-2xl">Informações pessoais</h2>
              <Field label="Nome completo">
                <Input value={p.fullName} onChange={(e) => patchPersonal({ fullName: e.target.value })} />
              </Field>
              <Field label="Cargo / profissão">
                <Input value={p.title} onChange={(e) => patchPersonal({ title: e.target.value })} placeholder="Ex.: Técnico de contabilidade" />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Email">
                  <Input type="email" value={p.email} onChange={(e) => patchPersonal({ email: e.target.value })} />
                </Field>
                <Field label="Telefone">
                  <Input value={p.phone} onChange={(e) => patchPersonal({ phone: e.target.value })} />
                </Field>
                <Field label="Cidade">
                  <Input value={p.city} onChange={(e) => patchPersonal({ city: e.target.value })} />
                </Field>
                <Field label="País">
                  <Input value={p.country} onChange={(e) => patchPersonal({ country: e.target.value })} />
                </Field>
                <Field label="LinkedIn">
                  <Input value={p.linkedin} onChange={(e) => patchPersonal({ linkedin: e.target.value })} />
                </Field>
                <Field label="Website / portefólio">
                  <Input value={p.website} onChange={(e) => patchPersonal({ website: e.target.value })} />
                </Field>
              </div>
              <PhotoField
                personal={p}
                showPhoto={settings.showPhoto}
                onPersonal={patchPersonal}
                onShowPhoto={(value) => setSettings((s) => ({ ...s, showPhoto: value }))}
              />
            </section>
          )}

          {step === 1 && (
            <section>
              <h2 className="font-display text-2xl">Perfil profissional</h2>
              <FieldHint>Escreve brevemente quem és, a tua experiência e o que procuras.</FieldHint>
              <Textarea
                className="mt-3 min-h-40"
                value={payload.summary}
                onChange={(e) => setPayload((prev) => ({ ...prev, summary: e.target.value }))}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setPayload((p) => ({ ...p, summary: improveSummary(p.summary) }))}>
                  <Sparkles className="size-4" /> Melhorar texto
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setPayload((p) => ({ ...p, summary: simplifyText(p.summary) }))}>
                  Simplificar texto
                </Button>
                <Button type="button" variant="ghost" size="sm">
                  Corrigir erros
                </Button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h2 className="font-display text-2xl">Experiência profissional</h2>
              {noExp && (
                <div className="mt-3 rounded-md border border-line bg-forest-soft p-4 text-sm">
                  <p className="font-medium">Não tens experiência profissional? Não há problema.</p>
                  <p className="mt-1 text-muted">
                    Adiciona formação, cursos, projectos, voluntariado, competências, estágios ou actividades extracurriculares. Nunca inventamos experiências.
                  </p>
                </div>
              )}
              <RepeatList
                items={payload.experience}
                onChange={(experience) => setPayload((p) => ({ ...p, experience }))}
                addLabel="+ Adicionar experiência"
                blank={() => ({
                  id: uid(),
                  title: "",
                  company: "",
                  location: "",
                  startDate: "",
                  endDate: "",
                  current: false,
                  description: "",
                })}
                render={(item, update) => (
                  <div className="space-y-2">
                    <Input placeholder="Cargo" value={item.title} onChange={(e) => update({ title: e.target.value })} />
                    <Input placeholder="Empresa" value={item.company} onChange={(e) => update({ company: e.target.value })} />
                    <Input placeholder="Localização" value={item.location} onChange={(e) => update({ location: e.target.value })} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Início" value={item.startDate} onChange={(e) => update({ startDate: e.target.value })} />
                      <Input placeholder="Fim" value={item.endDate} onChange={(e) => update({ endDate: e.target.value })} disabled={item.current} />
                    </div>
                    <label className="flex h-11 items-center gap-2 text-sm">
                      <input type="checkbox" checked={item.current} onChange={(e) => update({ current: e.target.checked })} />
                      Trabalho actualmente aqui
                    </label>
                    <Textarea
                      placeholder="Descrição das funções"
                      value={item.description}
                      onChange={(e) => update({ description: e.target.value })}
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => update({ description: improveExperience(item.description) })}>
                      Melhorar descrição da experiência
                    </Button>
                  </div>
                )}
              />
            </section>
          )}

          {step === 3 && (
            <section>
              <h2 className="font-display text-2xl">Formação académica</h2>
              <RepeatList
                items={payload.education}
                onChange={(education) => setPayload((p) => ({ ...p, education }))}
                addLabel="+ Adicionar formação"
                blank={() => ({
                  id: uid(),
                  course: "",
                  institution: "",
                  location: "",
                  startDate: "",
                  endDate: "",
                  description: "",
                })}
                render={(item, update) => (
                  <div className="space-y-2">
                    <Input placeholder="Curso" value={item.course} onChange={(e) => update({ course: e.target.value })} />
                    <Input placeholder="Instituição" value={item.institution} onChange={(e) => update({ institution: e.target.value })} />
                    <Input placeholder="Localização" value={item.location} onChange={(e) => update({ location: e.target.value })} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Início" value={item.startDate} onChange={(e) => update({ startDate: e.target.value })} />
                      <Input placeholder="Conclusão" value={item.endDate} onChange={(e) => update({ endDate: e.target.value })} />
                    </div>
                    <Textarea placeholder="Descrição (opcional)" value={item.description} onChange={(e) => update({ description: e.target.value })} />
                  </div>
                )}
              />
            </section>
          )}

          {step === 4 && (
            <section className="space-y-8">
              <div>
                <h2 className="font-display text-2xl">Competências</h2>
                <ChipEditor
                  items={payload.skills}
                  onChange={(skills) => setPayload((p) => ({ ...p, skills }))}
                  placeholder="Ex.: Microsoft Excel"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    const extra = suggestSkills(payload.summary, payload.skills.map((s) => s.name));
                    setPayload((p) => ({
                      ...p,
                      skills: [...p.skills, ...extra.map((name) => ({ id: uid(), name }))],
                    }));
                  }}
                >
                  Sugerir competências
                </Button>
              </div>
              <div>
                <h3 className="font-medium">Idiomas</h3>
                <RepeatList
                  items={payload.languages}
                  onChange={(languages) => setPayload((p) => ({ ...p, languages }))}
                  addLabel="+ Adicionar idioma"
                  blank={() => ({ id: uid(), name: "", level: "intermedio" as LanguageLevel })}
                  render={(item, update) => (
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Idioma" value={item.name} onChange={(e) => update({ name: e.target.value })} />
                      <select
                        className="h-11 rounded-md border border-line bg-cream px-3"
                        value={item.level}
                        onChange={(e) => update({ level: e.target.value as LanguageLevel })}
                      >
                        <option value="basico">Básico</option>
                        <option value="intermedio">Intermédio</option>
                        <option value="avancado">Avançado</option>
                        <option value="fluente">Fluente</option>
                        <option value="nativo">Nativo</option>
                      </select>
                    </div>
                  )}
                />
              </div>
              <SimpleNamed
                title="Certificações"
                items={payload.certifications}
                onChange={(certifications) => setPayload((p) => ({ ...p, certifications }))}
              />
              <SimpleNamed title="Cursos" items={payload.courses} onChange={(courses) => setPayload((p) => ({ ...p, courses }))} />
              <div>
                <h3 className="font-medium">Projectos</h3>
                <RepeatList
                  items={payload.projects}
                  onChange={(projects) => setPayload((p) => ({ ...p, projects }))}
                  addLabel="+ Adicionar projecto"
                  blank={() => ({ id: uid(), name: "", description: "", url: "" })}
                  render={(item, update) => (
                    <div className="space-y-2">
                      <Input placeholder="Nome do projecto" value={item.name} onChange={(e) => update({ name: e.target.value })} />
                      <Textarea placeholder="Descrição" value={item.description} onChange={(e) => update({ description: e.target.value })} />
                      <Input placeholder="Link" value={item.url} onChange={(e) => update({ url: e.target.value })} />
                    </div>
                  )}
                />
              </div>
            </section>
          )}

          {step === 5 && (
            <section className="space-y-6">
              <h2 className="font-display text-2xl">Finalizar e personalizar</h2>
              <div>
                <Label>Modelo</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplateId(t.id)}
                      className={cn(
                        "h-11 rounded-md text-sm ring-1",
                        templateId === t.id ? "bg-ink text-cream ring-ink" : "bg-cream text-ink ring-line",
                      )}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Cor principal">
                  <Input type="color" value={settings.color} onChange={(e) => setSettings((s) => ({ ...s, color: e.target.value }))} />
                </Field>
                <Field label="Tipo de letra">
                  <select
                    className="h-11 w-full rounded-md border border-line bg-cream px-3"
                    value={settings.font}
                    onChange={(e) => setSettings((s) => ({ ...s, font: e.target.value as ResumeSettings["font"] }))}
                  >
                    <option value="sans">Sans</option>
                    <option value="serif">Serif</option>
                    <option value="mono">Mono</option>
                  </select>
                </Field>
                <Field label="Tamanho">
                  <select
                    className="h-11 w-full rounded-md border border-line bg-cream px-3"
                    value={settings.fontSize}
                    onChange={(e) => setSettings((s) => ({ ...s, fontSize: e.target.value as ResumeSettings["fontSize"] }))}
                  >
                    <option value="sm">Pequeno</option>
                    <option value="md">Médio</option>
                    <option value="lg">Grande</option>
                  </select>
                </Field>
                <Field label="Espaçamento">
                  <select
                    className="h-11 w-full rounded-md border border-line bg-cream px-3"
                    value={settings.spacing}
                    onChange={(e) => setSettings((s) => ({ ...s, spacing: e.target.value as ResumeSettings["spacing"] }))}
                  >
                    <option value="compact">Compacto</option>
                    <option value="normal">Normal</option>
                    <option value="relaxed">Folgado</option>
                  </select>
                </Field>
              </div>
              <label className="flex h-11 items-center justify-between gap-2 text-sm">
                <span>Mostrar foto no CV</span>
                <input
                  type="checkbox"
                  checked={settings.showPhoto}
                  onChange={(e) => {
                    const on = e.target.checked;
                    setSettings((s) => ({ ...s, showPhoto: on }));
                    patchPersonal({ photoEnabled: on });
                  }}
                />
              </label>
              <label className="flex h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.referencesOnRequest}
                  onChange={(e) => setSettings((s) => ({ ...s, referencesOnRequest: e.target.checked }))}
                />
                Referências disponíveis mediante solicitação
              </label>
              <div>
                <h3 className="font-medium">Referências</h3>
                <RepeatList
                  items={payload.references}
                  onChange={(references) => setPayload((p) => ({ ...p, references }))}
                  addLabel="+ Adicionar referências"
                  blank={() => ({ id: uid(), name: "", title: "", company: "", phone: "", email: "" })}
                  render={(item, update) => (
                    <div className="space-y-2">
                      <Input placeholder="Nome" value={item.name} onChange={(e) => update({ name: e.target.value })} />
                      <Input placeholder="Cargo" value={item.title} onChange={(e) => update({ title: e.target.value })} />
                      <Input placeholder="Empresa" value={item.company} onChange={(e) => update({ company: e.target.value })} />
                      <Input placeholder="Telefone" value={item.phone} onChange={(e) => update({ phone: e.target.value })} />
                      <Input placeholder="Email" value={item.email} onChange={(e) => update({ email: e.target.value })} />
                    </div>
                  )}
                />
              </div>
              <Button type="button" variant="outline" onClick={() => setSettings(defaultSettings())}>
                Restaurar modelo
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button type="button" onClick={() => void handlePdf()}>
                  <Download className="size-4" /> Descarregar PDF
                </Button>
                <Button type="button" variant="outline" onClick={() => setMobilePreview(true)} className="lg:hidden">
                  Pré-visualizar PDF
                </Button>
                <Button type="button" variant="ghost" onClick={() => printCv()} className="hidden sm:inline-flex">
                  <Printer className="size-4" /> Imprimir
                </Button>
              </div>
            </section>
          )}

          <div className="mt-8 flex justify-between gap-3 pb-4">
            <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft className="size-4" /> Voltar
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={() => setStep((s) => s + 1)}>
                Avançar <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Link to="/dashboard">
                <Button type="button">Concluir</Button>
              </Link>
            )}
          </div>
        </div>

        <aside className="no-print hidden min-w-0 border-l border-line bg-cream p-4 lg:block">
          <p className="mb-3 text-xs uppercase tracking-widest text-muted">Pré-visualização · {getTemplate(templateId).name}</p>
          <div className="sticky top-20">
            <ScaledPreview>
              <CvDocument payload={payload} settings={settings} templateId={templateId} />
            </ScaledPreview>
          </div>
        </aside>
      </div>

      <button
        type="button"
        className="no-print fixed right-4 z-20 flex h-12 items-center gap-2 rounded-full bg-ink px-4 text-cream shadow-card lg:hidden bottom-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.75rem))]"
        onClick={() => setMobilePreview(true)}
      >
        <Eye className="size-4" /> Ver CV
      </button>

      {mobilePreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <p className="text-sm text-cream">Pré-visualização</p>
            <Button variant="secondary" onClick={() => setMobilePreview(false)}>
              Fechar
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto bg-paper px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">
            <ScaledPreview>
              <CvDocument payload={payload} settings={settings} templateId={templateId} />
            </ScaledPreview>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden>
        <div ref={printRef}>
          <CvDocument payload={payload} settings={settings} templateId={templateId} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function RepeatList<T extends { id: string }>({
  items,
  onChange,
  blank,
  render,
  addLabel,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  blank: () => T;
  render: (item: T, update: (partial: Partial<T>) => void, index: number) => ReactNode;
  addLabel: string;
}) {
  return (
    <div className="mt-3 space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="rounded-md border border-line bg-cream p-3">
          {render(
            item,
            (partial) => onChange(items.map((x) => (x.id === item.id ? { ...x, ...partial } : x))),
            index,
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" variant="ghost" size="sm" disabled={index === 0} onClick={() => {
              const next = [...items];
              [next[index - 1], next[index]] = [next[index], next[index - 1]];
              onChange(next);
            }}>
              Subir
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={index === items.length - 1} onClick={() => {
              const next = [...items];
              [next[index + 1], next[index]] = [next[index], next[index + 1]];
              onChange(next);
            }}>
              Descer
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(items.filter((x) => x.id !== item.id))}>
              Eliminar
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => onChange([...items, blank()])}>
        {addLabel}
      </Button>
    </div>
  );
}

function ChipEditor({
  items,
  onChange,
  placeholder,
}: {
  items: { id: string; name: string }[];
  onChange: (next: { id: string; name: string }[]) => void;
  placeholder: string;
}) {
  const [value, setValue] = useState("");
  return (
    <div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((s) => (
          <button
            key={s.id}
            type="button"
            className="h-9 rounded-full bg-forest-soft px-3 text-sm text-forest"
            onClick={() => onChange(items.filter((x) => x.id !== s.id))}
          >
            {s.name} ×
          </button>
        ))}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const name = value.trim();
          if (!name) return;
          onChange([...items, { id: uid(), name }]);
          setValue("");
        }}
      >
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} />
        <Button type="submit" variant="outline">
          Adicionar
        </Button>
      </form>
    </div>
  );
}

function SimpleNamed({
  title,
  items,
  onChange,
}: {
  title: string;
  items: { id: string; name: string; institution: string; year: string }[];
  onChange: (next: { id: string; name: string; institution: string; year: string }[]) => void;
}) {
  return (
    <div>
      <h3 className="font-medium">{title}</h3>
      <RepeatList
        items={items}
        onChange={onChange}
        addLabel={`+ Adicionar ${title.toLowerCase()}`}
        blank={() => ({ id: uid(), name: "", institution: "", year: "" })}
        render={(item, update) => (
          <div className="space-y-2">
            <Input placeholder="Nome" value={item.name} onChange={(e) => update({ name: e.target.value })} />
            <Input placeholder="Instituição" value={item.institution} onChange={(e) => update({ institution: e.target.value })} />
            <Input placeholder="Ano" value={item.year} onChange={(e) => update({ year: e.target.value })} />
          </div>
        )}
      />
    </div>
  );
}


