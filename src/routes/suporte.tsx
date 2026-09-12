import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { SUPPORT_WHATSAPP_URL } from "@/lib/config";

export const Route = createFileRoute("/suporte")({ component: Suporte });

function Suporte() {
  return (
    <AppShell>
      <h1 className="font-display text-2xl sm:text-3xl">Precisas de ajuda?</h1>
      <p className="mt-3 max-w-lg text-muted">Fala connosco no WhatsApp. Respondemos em português, com calma.</p>
      <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer">
        <Button className="mt-6" size="lg">
          Abrir WhatsApp
        </Button>
      </a>
      <dl className="mt-10 max-w-2xl divide-y divide-line">
        {[
          ["Como crio um CV?", "Cria conta, escolhe um modelo e preenche só o que tiveres. O PDF gera-se no fim."],
          ["Posso ter vários CVs?", "Sim. Um para cada tipo de vaga — por exemplo administrativo e outro técnico."],
          ["Perdi a palavra-passe?", "No ecrã de entrada usa «Esqueceste a palavra-passe?» ou contacta o suporte."],
          ["O modelo ATS é melhor?", "Se a empresa usa um portal automático, sim. Caso contrário, escolhe o que melhor contar a tua história."],
        ].map(([q, a]) => (
          <div key={q} className="py-4">
            <dt className="font-medium">{q}</dt>
            <dd className="mt-1 text-sm text-muted">{a}</dd>
          </div>
        ))}
      </dl>
    </AppShell>
  );
}
