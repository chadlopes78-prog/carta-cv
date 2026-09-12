import type { CSSProperties } from "react";
import type { PersonalInfo, ResumePayload, ResumeSettings, TemplateId } from "@/lib/resume/types";
import { displayPhoto, normalizePersonal, photoVisible } from "@/lib/resume/photo";
import { contactLine, formatPeriod, hasContent, LEVEL_LABEL } from "./shared";
import { cn } from "@/lib/cn";

const FONT: Record<ResumeSettings["font"], string> = {
  sans: "var(--font-cv-sans)",
  serif: "var(--font-cv-serif)",
  mono: "var(--font-cv-mono)",
};

const SIZE: Record<ResumeSettings["fontSize"], { body: number; name: number }> = {
  sm: { body: 11, name: 22 },
  md: { body: 12, name: 26 },
  lg: { body: 13.5, name: 30 },
};

const SPACE: Record<ResumeSettings["spacing"], number> = {
  compact: 10,
  normal: 14,
  relaxed: 18,
};

type Props = {
  payload: ResumePayload;
  settings: ResumeSettings;
  templateId: string;
};

export function CvDocument({ payload, settings, templateId }: Props) {
  const id = (templateId || "moderno") as TemplateId;
  const style = {
    fontFamily: FONT[settings.font],
    fontSize: SIZE[settings.fontSize].body,
    ["--cv-accent" as string]: settings.color,
    ["--cv-gap" as string]: `${SPACE[settings.spacing]}px`,
    ["--cv-name" as string]: `${SIZE[settings.fontSize].name}px`,
  } as CSSProperties;

  return (
    <div
      className="cv-page bg-white text-ink shadow-card"
      style={{
        ...style,
        width: "210mm",
        minHeight: "297mm",
        color: "#1a1916",
      }}
    >
      {id === "moderno" && <Moderno payload={payload} settings={settings} />}
      {id === "executivo" && <Executivo payload={payload} settings={settings} />}
      {id === "minimalista" && <Minimalista payload={payload} settings={settings} />}
      {id === "criativo" && <Criativo payload={payload} settings={settings} />}
      {id === "ats" && <Ats payload={payload} settings={settings} />}
      {id === "classico" && <Classico payload={payload} settings={settings} />}
      {id === "tecnico" && <Tecnico payload={payload} settings={settings} />}
      {id === "academico" && <Academico payload={payload} settings={settings} />}
    </div>
  );
}

function Photo({
  personal,
  show,
  className,
}: {
  personal: PersonalInfo;
  show: boolean;
  className?: string;
}) {
  const p = normalizePersonal(personal);
  const src = displayPhoto(p);
  if (!photoVisible(p, show) || !src) return null;
  return (
    <img
      src={src}
      alt=""
      className={cn("object-cover", p.photoShape === "square" ? "rounded-sm" : "rounded-full", className)}
    />
  );
}

function SectionTitle({ children, rule = true }: { children: string; rule?: boolean }) {
  return (
    <h3
      className="mb-2 font-semibold tracking-[0.14em] uppercase"
      style={{ fontSize: "0.78em", color: "var(--cv-accent)", borderBottom: rule ? "1px solid color-mix(in srgb, var(--cv-accent) 35%, transparent)" : undefined, paddingBottom: rule ? 4 : 0 }}
    >
      {children}
    </h3>
  );
}

function Moderno({ payload, settings }: { payload: ResumePayload; settings: ResumeSettings }) {
  const p = payload.personal;
  return (
    <div className="flex min-h-[297mm]">
      <aside className="w-[72mm] px-6 py-8 text-white" style={{ background: "var(--cv-accent)" }}>
        <p className="text-[0.7em] tracking-[0.2em] uppercase opacity-80">Contacto</p>
        <ul className="mt-2 space-y-1.5 text-[0.92em] leading-snug opacity-95">
          {p.phone && <li>{p.phone}</li>}
          {p.email && <li className="break-all">{p.email}</li>}
          {(p.city || p.country) && <li>{[p.city, p.country].filter(Boolean).join(", ")}</li>}
          {p.linkedin && <li className="break-all">{p.linkedin}</li>}
          {p.website && <li className="break-all">{p.website}</li>}
        </ul>
        {payload.skills.length > 0 && (
          <div className="mt-8">
            <p className="text-[0.7em] tracking-[0.2em] uppercase opacity-80">Competências</p>
            <ul className="mt-2 space-y-1 text-[0.92em]">
              {payload.skills.map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          </div>
        )}
        {payload.languages.length > 0 && (
          <div className="mt-8">
            <p className="text-[0.7em] tracking-[0.2em] uppercase opacity-80">Idiomas</p>
            <ul className="mt-2 space-y-1 text-[0.92em]">
              {payload.languages.map((l) => (
                <li key={l.id}>
                  {l.name} · {LEVEL_LABEL[l.level]}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
      <main className="flex-1 px-8 py-8" style={{ paddingBottom: "var(--cv-gap)" }}>
        <div className="flex items-center gap-4">
          <Photo personal={p} show={settings.showPhoto} className="size-[24mm] shrink-0 outline outline-2 outline-white" />
          <div>
            <h1 className="font-display font-medium leading-none" style={{ fontSize: "var(--cv-name)" }}>
              {p.fullName || "O teu nome"}
            </h1>
            <p className="mt-2 tracking-wide" style={{ color: "var(--cv-accent)" }}>
              {p.title || "Cargo pretendido"}
            </p>
          </div>
        </div>
        {payload.summary && <p className="mt-5 leading-relaxed">{payload.summary}</p>}
        <BodySections payload={payload} />
      </main>
    </div>
  );
}

function Executivo({ payload, settings }: { payload: ResumePayload; settings: ResumeSettings }) {
  const p = payload.personal;
  return (
    <div className="px-10 py-9">
      <header className="flex items-start justify-between gap-6 border-b-2 pb-5" style={{ borderColor: "var(--cv-accent)" }}>
        <div>
          <h1 className="font-display font-semibold tracking-tight" style={{ fontSize: "var(--cv-name)" }}>
            {p.fullName || "O teu nome"}
          </h1>
          <p className="mt-1 text-[0.95em] tracking-[0.18em] uppercase">{p.title}</p>
          <p className="mt-3 text-[0.88em] text-[#555]">{contactLine(p)}</p>
        </div>
        <Photo personal={p} show={settings.showPhoto} className="size-[22mm] shrink-0" />
      </header>
      {payload.summary && (
        <section className="mt-5 break-inside-avoid">
          <SectionTitle>Perfil</SectionTitle>
          <p className="leading-relaxed">{payload.summary}</p>
        </section>
      )}
      <BodySections payload={payload} />
    </div>
  );
}

function Minimalista({ payload, settings }: { payload: ResumePayload; settings: ResumeSettings }) {
  const p = payload.personal;
  return (
    <div className="px-12 py-12">
      <div className="flex items-start gap-5">
        <Photo personal={p} show={settings.showPhoto} className="size-[16mm] shrink-0 opacity-95" />
        <div>
          <h1 className="font-display font-medium" style={{ fontSize: "calc(var(--cv-name) + 4px)" }}>
            {p.fullName || "O teu nome"}
          </h1>
          <p className="mt-1 text-[#666]">{p.title}</p>
        </div>
      </div>
      <p className="mt-4 max-w-[140mm] text-[0.88em] leading-relaxed text-[#555]">{contactLine(p)}</p>
      <div className="mt-10 space-y-8">
        {payload.summary && (
          <section>
            <p className="mb-2 text-[0.68em] tracking-[0.22em] uppercase text-[#888]">Sobre</p>
            <p className="max-w-[150mm] leading-relaxed">{payload.summary}</p>
          </section>
        )}
        <PlainLists payload={payload} />
      </div>
    </div>
  );
}

function Criativo({ payload, settings }: { payload: ResumePayload; settings: ResumeSettings }) {
  const p = payload.personal;
  return (
    <div className="relative min-h-[297mm] overflow-hidden">
      <div className="absolute top-0 right-0 h-[46mm] w-[46mm]" style={{ background: "var(--cv-accent)" }} />
      <div className="relative px-10 pt-12 pb-8">
        <div className="flex items-end gap-6">
          <Photo personal={p} show={settings.showPhoto} className="size-[38mm] shrink-0 outline outline-4 outline-white" />
          <div>
            <h1 className="font-display font-medium leading-[0.95]" style={{ fontSize: "calc(var(--cv-name) + 6px)" }}>
              {p.fullName || "O teu nome"}
            </h1>
            <p className="mt-2 text-[1.05em]">{p.title}</p>
          </div>
        </div>
        <p className="mt-5 text-[0.88em]">{contactLine(p)}</p>
        {payload.summary && <p className="mt-6 max-w-[160mm] leading-relaxed">{payload.summary}</p>}
        <div className="mt-8 grid grid-cols-[1.4fr_1fr] gap-8">
          <div>
            <Jobs payload={payload} />
            <Edu payload={payload} />
            <Projects payload={payload} />
          </div>
          <div>
            <SkillsBlock payload={payload} chips />
            <Langs payload={payload} />
            <Certs payload={payload} />
            <Courses payload={payload} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Ats({ payload, settings }: { payload: ResumePayload; settings: ResumeSettings }) {
  const p = payload.personal;
  return (
    <div className="px-10 py-8" style={{ fontFamily: "var(--font-cv-sans)" }}>
      <div className="flex items-start gap-3">
        <Photo personal={p} show={settings.showPhoto} className="size-[16mm] shrink-0" />
        <div>
          <h1 className="text-[22px] font-bold">{p.fullName || "O teu nome"}</h1>
          <p>{p.title}</p>
          <p className="mt-1">{contactLine(p)}</p>
        </div>
      </div>
      {payload.summary && (
        <section className="mt-4">
          <h3 className="font-bold">Resumo profissional</h3>
          <p>{payload.summary}</p>
        </section>
      )}
      {payload.experience.length > 0 && (
        <section className="mt-4">
          <h3 className="font-bold">Experiência profissional</h3>
          {payload.experience.map((e) => (
            <div key={e.id} className="mt-2">
              <p className="font-semibold">
                {e.title} — {e.company}
              </p>
              <p>
                {e.location} {formatPeriod(e.startDate, e.endDate, e.current)}
              </p>
              {e.description && <p>{e.description}</p>}
            </div>
          ))}
        </section>
      )}
      {payload.education.length > 0 && (
        <section className="mt-4">
          <h3 className="font-bold">Formação académica</h3>
          {payload.education.map((e) => (
            <div key={e.id} className="mt-2">
              <p className="font-semibold">
                {e.course} — {e.institution}
              </p>
              <p>{formatPeriod(e.startDate, e.endDate)}</p>
            </div>
          ))}
        </section>
      )}
      {payload.skills.length > 0 && (
        <section className="mt-4">
          <h3 className="font-bold">Competências</h3>
          <p>{payload.skills.map((s) => s.name).join(", ")}</p>
        </section>
      )}
      {payload.languages.length > 0 && (
        <section className="mt-4">
          <h3 className="font-bold">Idiomas</h3>
          <p>{payload.languages.map((l) => `${l.name} (${LEVEL_LABEL[l.level]})`).join(", ")}</p>
        </section>
      )}
      {payload.certifications.length > 0 && (
        <section className="mt-4">
          <h3 className="font-bold">Certificações</h3>
          {payload.certifications.map((c) => (
            <p key={c.id}>
              {c.name}, {c.institution} {c.year}
            </p>
          ))}
        </section>
      )}
      {payload.courses.length > 0 && (
        <section className="mt-4">
          <h3 className="font-bold">Cursos</h3>
          {payload.courses.map((c) => (
            <p key={c.id}>
              {c.name}, {c.institution} {c.year}
            </p>
          ))}
        </section>
      )}
      {payload.projects.length > 0 && (
        <section className="mt-4">
          <h3 className="font-bold">Projectos</h3>
          {payload.projects.map((c) => (
            <p key={c.id}>
              {c.name}. {c.description} {c.url}
            </p>
          ))}
        </section>
      )}
    </div>
  );
}

function Classico({ payload, settings }: { payload: ResumePayload; settings: ResumeSettings }) {
  const p = payload.personal;
  return (
    <div className="px-12 py-10 text-center">
      <Photo personal={p} show={settings.showPhoto} className="mx-auto mb-3 size-[24mm]" />
      <h1 className="font-display font-medium tracking-wide" style={{ fontSize: "var(--cv-name)" }}>
        {p.fullName || "O teu nome"}
      </h1>
      <p className="mt-1 italic">{p.title}</p>
      <p className="mt-2 text-[0.85em]">{contactLine(p)}</p>
      <div className="mx-auto my-5 h-px w-24" style={{ background: "var(--cv-accent)" }} />
      <div className="text-left">
        {payload.summary && (
          <section className="mb-5">
            <SectionTitle>Perfil profissional</SectionTitle>
            <p className="leading-relaxed">{payload.summary}</p>
          </section>
        )}
        <BodySections payload={payload} />
      </div>
    </div>
  );
}

function Tecnico({ payload, settings }: { payload: ResumePayload; settings: ResumeSettings }) {
  const p = payload.personal;
  return (
    <div className="flex min-h-[297mm]">
      <div className="w-[7mm]" style={{ background: "var(--cv-accent)" }} />
      <div className="flex-1 px-8 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-semibold tracking-tight" style={{ fontSize: "var(--cv-name)", fontFamily: "var(--font-cv-sans)" }}>
              {p.fullName || "O teu nome"}
            </h1>
            <p className="font-mono text-[0.85em] uppercase tracking-widest" style={{ color: "var(--cv-accent)" }}>
              {p.title}
            </p>
          </div>
          <Photo personal={p} show={settings.showPhoto} className="size-[18mm] shrink-0" />
        </div>
        <p className="mt-2 font-mono text-[0.78em] text-[#555]">{contactLine(p)}</p>
        {payload.summary && <p className="mt-5 leading-relaxed">{payload.summary}</p>}
        <div className="mt-6 grid grid-cols-[1.5fr_1fr] gap-8">
          <div>
            <Jobs payload={payload} />
            <Projects payload={payload} />
            <Edu payload={payload} />
          </div>
          <div>
            <SkillsBlock payload={payload} />
            <Langs payload={payload} />
            <Certs payload={payload} />
            <Courses payload={payload} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Academico({ payload, settings }: { payload: ResumePayload; settings: ResumeSettings }) {
  const p = payload.personal;
  return (
    <div className="px-11 py-10">
      <header className="mb-6 flex items-center gap-5">
        <Photo personal={p} show={settings.showPhoto} className="size-[22mm] shrink-0" />
        <div>
          <h1 className="font-display" style={{ fontSize: "var(--cv-name)" }}>
            {p.fullName || "O teu nome"}
          </h1>
          <p>{p.title}</p>
          <p className="text-[0.85em] text-[#555]">{contactLine(p)}</p>
        </div>
      </header>
      {payload.summary && (
        <section className="mb-5">
          <SectionTitle>Objectivo</SectionTitle>
          <p>{payload.summary}</p>
        </section>
      )}
      <Edu payload={payload} />
      <Courses payload={payload} />
      <Certs payload={payload} />
      <Projects payload={payload} />
      <Jobs payload={payload} label="Experiência e estágios" />
      <SkillsBlock payload={payload} chips />
      <Langs payload={payload} />
      <Refs payload={payload} onRequest={settings.referencesOnRequest} />
    </div>
  );
}

function BodySections({ payload }: { payload: ResumePayload }) {
  return (
    <>
      <Jobs payload={payload} />
      <Edu payload={payload} />
      <SkillsBlock payload={payload} chips />
      <Langs payload={payload} />
      <Certs payload={payload} />
      <Courses payload={payload} />
      <Projects payload={payload} />
      <Refs payload={payload} />
    </>
  );
}

function PlainLists({ payload }: { payload: ResumePayload }) {
  return (
    <>
      {payload.experience.length > 0 && (
        <section className="break-inside-avoid">
          <p className="mb-3 text-[0.68em] tracking-[0.22em] uppercase text-[#888]">Experiência</p>
          {payload.experience.map((e) => (
            <div key={e.id} className="mb-4">
              <div className="flex justify-between gap-4">
                <p className="font-medium">
                  {e.title}, {e.company}
                </p>
                <p className="shrink-0 text-[0.85em] text-[#777]">{formatPeriod(e.startDate, e.endDate, e.current)}</p>
              </div>
              {e.description && <p className="mt-1 text-[#444]">{e.description}</p>}
            </div>
          ))}
        </section>
      )}
      {payload.education.length > 0 && (
        <section className="break-inside-avoid">
          <p className="mb-3 text-[0.68em] tracking-[0.22em] uppercase text-[#888]">Formação</p>
          {payload.education.map((e) => (
            <div key={e.id} className="mb-3">
              <p className="font-medium">{e.course}</p>
              <p className="text-[#555]">
                {e.institution} {formatPeriod(e.startDate, e.endDate)}
              </p>
            </div>
          ))}
        </section>
      )}
      {payload.skills.length > 0 && (
        <section>
          <p className="mb-2 text-[0.68em] tracking-[0.22em] uppercase text-[#888]">Competências</p>
          <p>{payload.skills.map((s) => s.name).join("  ·  ")}</p>
        </section>
      )}
      {payload.languages.length > 0 && (
        <section>
          <p className="mb-2 text-[0.68em] tracking-[0.22em] uppercase text-[#888]">Idiomas</p>
          <p>{payload.languages.map((l) => `${l.name} (${LEVEL_LABEL[l.level]})`).join("  ·  ")}</p>
        </section>
      )}
      {payload.courses.length > 0 && (
        <section>
          <p className="mb-2 text-[0.68em] tracking-[0.22em] uppercase text-[#888]">Cursos</p>
          {payload.courses.map((c) => (
            <p key={c.id}>
              {c.name} — {c.institution} {c.year}
            </p>
          ))}
        </section>
      )}
      {payload.projects.length > 0 && (
        <section>
          <p className="mb-2 text-[0.68em] tracking-[0.22em] uppercase text-[#888]">Projectos</p>
          {payload.projects.map((c) => (
            <p key={c.id}>
              {c.name}. {c.description}
            </p>
          ))}
        </section>
      )}
    </>
  );
}

function Jobs({ payload, label = "Experiência" }: { payload: ResumePayload; label?: string }) {
  if (!payload.experience.length) return null;
  return (
    <section className="mt-5 break-inside-avoid">
      <SectionTitle>{label}</SectionTitle>
      {payload.experience.map((e) => (
        <div key={e.id} className="mb-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-semibold">
              {e.title}
              {e.company ? ` · ${e.company}` : ""}
            </p>
            <p className="shrink-0 text-[0.82em] text-[#666]">{formatPeriod(e.startDate, e.endDate, e.current)}</p>
          </div>
          {e.location && <p className="text-[0.85em] text-[#666]">{e.location}</p>}
          {e.description && <p className="mt-1 leading-relaxed">{e.description}</p>}
        </div>
      ))}
    </section>
  );
}

function Edu({ payload }: { payload: ResumePayload }) {
  if (!payload.education.length) return null;
  return (
    <section className="mt-5 break-inside-avoid">
      <SectionTitle>Formação</SectionTitle>
      {payload.education.map((e) => (
        <div key={e.id} className="mb-2">
          <div className="flex justify-between gap-3">
            <p className="font-semibold">{e.course}</p>
            <p className="text-[0.82em] text-[#666]">{formatPeriod(e.startDate, e.endDate)}</p>
          </div>
          <p className="text-[0.9em]">
            {e.institution}
            {e.location ? ` · ${e.location}` : ""}
          </p>
          {e.description && <p className="mt-1">{e.description}</p>}
        </div>
      ))}
    </section>
  );
}

function SkillsBlock({ payload, chips }: { payload: ResumePayload; chips?: boolean }) {
  if (!payload.skills.length) return null;
  return (
    <section className="mt-5 break-inside-avoid">
      <SectionTitle>Competências</SectionTitle>
      {chips ? (
        <div className="flex flex-wrap gap-1.5">
          {payload.skills.map((s) => (
            <span key={s.id} className="rounded-sm px-2 py-0.5 text-[0.85em]" style={{ background: "color-mix(in srgb, var(--cv-accent) 12%, white)", color: "var(--cv-accent)" }}>
              {s.name}
            </span>
          ))}
        </div>
      ) : (
        <ul className="space-y-0.5">
          {payload.skills.map((s) => (
            <li key={s.id}>{s.name}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Langs({ payload }: { payload: ResumePayload }) {
  if (!payload.languages.length) return null;
  return (
    <section className="mt-5 break-inside-avoid">
      <SectionTitle>Idiomas</SectionTitle>
      {payload.languages.map((l) => (
        <p key={l.id}>
          {l.name} — {LEVEL_LABEL[l.level]}
        </p>
      ))}
    </section>
  );
}

function Certs({ payload }: { payload: ResumePayload }) {
  if (!payload.certifications.length) return null;
  return (
    <section className="mt-5 break-inside-avoid">
      <SectionTitle>Certificações</SectionTitle>
      {payload.certifications.map((c) => (
        <p key={c.id}>
          {c.name}
          {c.institution ? ` · ${c.institution}` : ""} {c.year}
        </p>
      ))}
    </section>
  );
}

function Courses({ payload }: { payload: ResumePayload }) {
  if (!payload.courses.length) return null;
  return (
    <section className="mt-5 break-inside-avoid">
      <SectionTitle>Cursos</SectionTitle>
      {payload.courses.map((c) => (
        <p key={c.id}>
          {c.name}
          {c.institution ? ` · ${c.institution}` : ""} {c.year}
        </p>
      ))}
    </section>
  );
}

function Projects({ payload }: { payload: ResumePayload }) {
  if (!payload.projects.length) return null;
  return (
    <section className="mt-5 break-inside-avoid">
      <SectionTitle>Projectos</SectionTitle>
      {payload.projects.map((c) => (
        <div key={c.id} className="mb-2">
          <p className="font-semibold">{c.name}</p>
          {c.description && <p>{c.description}</p>}
          {c.url && <p className="text-[0.85em]">{c.url}</p>}
        </div>
      ))}
    </section>
  );
}

function Refs({ payload, onRequest }: { payload: ResumePayload; onRequest?: boolean }) {
  if (onRequest && !payload.references.length) {
    return (
      <section className="mt-5">
        <SectionTitle>Referências</SectionTitle>
        <p>Disponíveis mediante solicitação.</p>
      </section>
    );
  }
  if (!payload.references.length) return null;
  return (
    <section className="mt-5 break-inside-avoid">
      <SectionTitle>Referências</SectionTitle>
      {payload.references.map((r) => (
        <p key={r.id} className="mb-1">
          {r.name}
          {r.title ? `, ${r.title}` : ""}
          {r.company ? ` — ${r.company}` : ""} {r.phone} {r.email}
        </p>
      ))}
    </section>
  );
}

export function EmptyHint({ payload }: { payload: ResumePayload }) {
  const p = payload.personal;
  return !hasContent(p.fullName) && !payload.experience.length && !payload.education.length ? (
    <p className="sr-only">CV vazio</p>
  ) : null;
}
