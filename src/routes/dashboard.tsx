import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Copy, Download, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { getTemplate } from "@/lib/resume/templates";
import { deleteResume, duplicateResume, getMe, listResumes } from "@/lib/resume/server";
import type { ResumeRecord } from "@/lib/resume/types";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [cvs, setCvs] = useState<ResumeRecord[] | null>(null);
  const [error, setError] = useState("");
  const first = user?.displayName?.split(" ")[0] || user?.primaryEmail?.split("@")[0];

  async function refresh() {
    try {
      const rows = await listResumes();
      setCvs(rows);
    } catch {
      setError("Não foi possível carregar os teus CVs. Tenta novamente.");
    }
  }

  useEffect(() => {
    void refresh();
    void getMe().catch(() => undefined);
  }, []);

  return (
    <AppShell>
      <p className="text-sm text-forest">{first ? `Olá, ${first}` : "Olá"}</p>
      <h1 className="mt-1 font-display text-2xl sm:text-3xl">Cria ou edita os teus CVs profissionais.</h1>

      <Link to="/cv/novo" className="mt-6 flex h-28 items-center justify-center rounded-lg border border-dashed border-forest/40 bg-forest-soft text-forest">
        <span className="flex items-center gap-2 text-base font-medium">
          <Plus className="size-5" /> Criar novo CV
        </span>
      </Link>

      <h2 className="mt-10 text-sm font-medium uppercase tracking-widest text-muted">Os meus CVs</h2>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      {cvs === null && <p className="mt-4 text-sm text-muted">A carregar…</p>}
      {cvs && cvs.length === 0 && (
        <p className="mt-4 text-sm text-muted">Ainda não tens CVs. Cria o primeiro — mesmo sem experiência profissional.</p>
      )}
      <ul className="mt-4 space-y-3">
        {cvs?.map((cv) => {
          const tpl = getTemplate(cv.templateId);
          return (
            <li key={cv.id} className="rounded-lg border border-line bg-cream p-4 shadow-card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{cv.name}</p>
                  <p className="text-sm text-muted">
                    Modelo {tpl.name} · criado {new Date(cv.createdAt).toLocaleDateString("pt-PT")} · editado{" "}
                    {new Date(cv.updatedAt).toLocaleDateString("pt-PT")}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <Button size="sm" className="w-full sm:w-auto" onClick={() => navigate({ to: "/cv/$id/editar", params: { id: cv.id } })}>
                    <Pencil className="size-4" /> Editar
                  </Button>
                  <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => navigate({ to: "/cv/$id", params: { id: cv.id } })}>
                    <Eye className="size-4" /> Ver
                  </Button>
                  <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => navigate({ to: "/cv/$id", params: { id: cv.id } })}>
                    <Download className="size-4" /> PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={async () => {
                      const { id } = await duplicateResume({ data: { id: cv.id } });
                      navigate({ to: "/cv/$id/editar", params: { id } });
                    }}
                  >
                    <Copy className="size-4" /> Duplicar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full sm:w-auto"
                    onClick={async () => {
                      if (!confirm("Eliminar este CV?")) return;
                      await deleteResume({ data: { id: cv.id } });
                      void refresh();
                    }}
                  >
                    <Trash2 className="size-4" /> Eliminar
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
