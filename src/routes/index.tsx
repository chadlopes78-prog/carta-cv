import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, FileDown, LayoutTemplate, Smartphone, Sparkles, Wand2 } from "lucide-react";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { TEMPLATES } from "@/lib/resume/templates";
import { samplePayload, defaultSettings } from "@/lib/resume/defaults";
import { CvDocument } from "@/components/cv/document";
import { ScaledPreview } from "@/components/cv/scaled-preview";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/config";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { isPending } = useCurrentUserState();
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="font-display text-2xl">
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <a href="#modelos" className="hidden text-sm text-muted hover:text-ink sm:inline">
            Modelos
          </a>
          <SignedOut>
            {!isPending && (
              <>
                <Link to="/login" className="text-sm text-ink">
                  Entrar
                </Link>
                <Link to="/criar-conta">
                  <Button size="sm">Começar agora</Button>
                </Link>
              </>
            )}
          </SignedOut>
          <SignedIn>
            <Link to="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          </SignedIn>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-forest">CV para Moçambique e CPLP</p>
          <h1 className="mt-4 font-display text-[2rem] leading-[1.12] sm:text-5xl">Cria um CV profissional em poucos minutos</h1>
          <p className="mt-4 max-w-md text-base text-muted sm:text-lg">
            Preenche os teus dados, escolhe um modelo e cria um CV pronto para enviar às empresas.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/criar-conta" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">Começar agora</Button>
            </Link>
            <a href="#modelos" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Ver modelos
              </Button>
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {(["moderno", "executivo", "ats", "criativo"] as const).map((id) => (
            <div key={id} className="overflow-hidden rounded-lg bg-cream shadow-card">
              <ScaledPreview>
                <CvDocument payload={samplePayload()} settings={defaultSettings()} templateId={id} />
              </ScaledPreview>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-cream py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl">Como funciona</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { n: "01", t: "Preenche os teus dados", d: "Experiência, formação, competências — só o que tiveres." },
              { n: "02", t: "Escolhe o teu modelo", d: "Oito estruturas diferentes, não só cores diferentes." },
              { n: "03", t: "Descarrega o teu CV", d: "PDF A4 pronto a enviar, no telemóvel ou no computador." },
            ].map((s) => (
              <div key={s.n} className="rounded-lg bg-paper p-6 shadow-card">
                <p className="font-display text-2xl text-forest">{s.n}</p>
                <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="font-display text-3xl">Tudo o que precisas para candidatar-te</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: LayoutTemplate, t: "CV profissional", d: "Estrutura pensada para recutadores e para ATS." },
            { icon: Sparkles, t: "Modelos modernos", d: "Oito layouts com hierarquia própria." },
            { icon: Wand2, t: "Fácil de editar", d: "Vês o CV a actualizar enquanto escreves." },
            { icon: FileDown, t: "PDF pronto a enviar", d: "A4, com fontes e espaçamento preservados." },
            { icon: Smartphone, t: "Compatível com telemóvel", d: "Feito primeiro para Android de entrada." },
            { icon: Check, t: "Estrutura para candidaturas", d: "Mesmo sem experiência profissional." },
          ].map((b) => (
            <li key={b.t} className="flex gap-3 rounded-lg border border-line bg-cream p-4">
              <b.icon className="mt-0.5 size-5 text-forest" />
              <div>
                <p className="font-medium">{b.t}</p>
                <p className="text-sm text-muted">{b.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="modelos" className="border-t border-line bg-cream py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl">Modelos</h2>
          <p className="mt-2 text-muted">Cada um organiza a informação de forma diferente.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.map((t) => (
              <Link key={t.id} to="/cv/novo" search={{ modelo: t.id }} className="group overflow-hidden rounded-lg bg-paper shadow-card">
                <ScaledPreview>
                  <CvDocument payload={samplePayload()} settings={defaultSettings()} templateId={t.id} />
                </ScaledPreview>
                <div className="border-t border-line p-3">
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-muted">{t.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="font-display text-3xl">Perguntas frequentes</h2>
        <dl className="mt-8 divide-y divide-line">
          {[
            ["É grátis?", "Sim. Podes criar CVs com os modelos gratuitos. O Premium destrava todos os modelos e CVs ilimitados."],
            ["Preciso de experiência profissional?", "Não. O editor sugere formação, cursos, projectos e competências para o primeiro emprego."],
            ["O PDF serve para enviar às empresas?", "Sim. É A4, com boa qualidade de impressão, e o modelo ATS é pensado para leitura automática."],
            ["Os meus dados estão seguros?", "Cada conta só vê os seus CVs. As palavras-passe são guardadas de forma segura."],
            ["Funciona no telemóvel?", "Sim. O fluxo foi desenhado para Android e iPhone."],
          ].map(([q, a]) => (
            <div key={q} className="py-5">
              <dt className="font-medium">{q}</dt>
              <dd className="mt-1 text-sm text-muted">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="border-t border-line bg-ink text-cream">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-display text-2xl">{APP_NAME}</p>
            <p className="mt-1 text-sm text-cream/60">CV profissional para quem se candidata a sério.</p>
          </div>
          <div className="flex gap-5 text-sm text-cream/80">
            <Link to="/modelos">Modelos</Link>
            <Link to="/suporte">Suporte</Link>
            <Link to="/criar-conta">Criar conta</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
