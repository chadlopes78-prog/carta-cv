import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Download, Pencil, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CvDocument } from "@/components/cv/document";
import { ScaledPreview } from "@/components/cv/scaled-preview";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getResume, recordDownload } from "@/lib/resume/server";
import { downloadCvPdf, printCv } from "@/lib/resume/pdf";
import type { ResumeRecord } from "@/lib/resume/types";
import { normalizePersonal } from "@/lib/resume/photo";

export const Route = createFileRoute("/cv/$id/")({ component: PreviewCv });

function PreviewCv() {
  const { id } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const [cv, setCv] = useState<ResumeRecord | null>(null);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    getResume({ data: { id } })
      .then((row) => {
        if (!row) {
          setCv(null);
          return;
        }
        setCv({ ...row, payload: { ...row.payload, personal: normalizePersonal(row.payload.personal) } });
      })
      .catch(() => setCv(null));
  }, [id, user]);

  if (isPending) return null;
  if (!user) return <RedirectToSignIn />;
  if (!cv) return <main className="grid min-h-dvh place-items-center">A carregar…</main>;

  async function handlePdf() {
    if (!cv) return;
    const node = host.current?.querySelector(".cv-page") as HTMLElement | null;
    if (!node) return;
    await downloadCvPdf(node, cv.name);
    void recordDownload({ data: { id } });
  }

  return (
    <main className="min-h-dvh overflow-x-clip bg-paper">
      <header className="no-print sticky top-0 z-10 flex items-center gap-2 border-b border-line bg-cream px-2 py-2 sm:px-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <Link to="/dashboard" className="flex size-11 shrink-0 items-center justify-center text-muted" aria-label="Dashboard">
          <ChevronLeft className="size-5" />
        </Link>
        <p className="min-w-0 flex-1 truncate font-medium">{cv.name}</p>
        <div className="flex shrink-0 gap-1 sm:gap-2">
          <Link to="/cv/$id/editar" params={{ id }}>
            <Button size="sm" variant="outline" className="px-2 sm:px-3">
              <Pencil className="size-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </Link>
          <Button size="sm" className="px-2 sm:px-3" onClick={() => void handlePdf()}>
            <Download className="size-4" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button size="sm" variant="ghost" className="hidden sm:inline-flex" onClick={() => printCv()}>
            <Printer className="size-4" /> Imprimir
          </Button>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-3 py-4 pb-10 sm:px-6">
        <ScaledPreview>
          <CvDocument payload={cv.payload} settings={cv.settings} templateId={cv.templateId} />
        </ScaledPreview>
      </div>
      <div className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden>
        <div ref={host}>
          <CvDocument payload={cv.payload} settings={cv.settings} templateId={cv.templateId} />
        </div>
      </div>
    </main>
  );
}
