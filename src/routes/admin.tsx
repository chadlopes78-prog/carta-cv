import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { getAdminStats, getMe } from "@/lib/resume/server";
import { getTemplate } from "@/lib/resume/templates";

export const Route = createFileRoute("/admin")({ component: Admin });

function Admin() {
  const [denied, setDenied] = useState(false);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getAdminStats>> | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    getMe()
      .then((m) => {
        if (m.role !== "admin") setDenied(true);
        else return getAdminStats().then(setStats);
      })
      .catch(() => setDenied(true));
  }, []);

  const people = useMemo(
    () =>
      (stats?.people ?? []).filter((p) => {
        const hay = `${p.display_name ?? ""} ${p.email ?? ""}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      }),
    [stats, q],
  );

  if (denied) {
    return (
      <AppShell>
        <p>Esta área é só para administradores.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="font-display text-3xl">Administração</h1>
      {!stats && <p className="mt-4 text-sm text-muted">A carregar…</p>}
      {stats && (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Utilizadores", stats.totalUsers],
              ["Novos hoje", stats.newUsers],
              ["CVs criados", stats.totalCvs],
              ["CVs hoje", stats.cvsToday],
              ["Downloads PDF", stats.downloads],
              ["Activos", stats.people.filter((p) => Date.now() - new Date(p.last_seen_at).getTime() < 86400000 * 7).length],
            ].map(([l, n]) => (
              <div key={String(l)} className="rounded-lg border border-line bg-cream p-4">
                <p className="text-xs uppercase tracking-widest text-muted">{l}</p>
                <p className="mt-1 font-display text-3xl">{n}</p>
              </div>
            ))}
          </div>
          <h2 className="mt-10 font-medium">Modelos mais utilizados</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {stats.templates.map((t) => (
              <li key={t.template_id}>
                {getTemplate(t.template_id).name}: {t.n}
              </li>
            ))}
          </ul>
          <h2 className="mt-10 font-medium">Utilizadores</h2>
          <Input className="mt-3 max-w-sm" placeholder="Pesquisar" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-widest text-muted">
                <tr>
                  <th className="py-2">Nome</th>
                  <th>Email</th>
                  <th>Criado</th>
                  <th>CVs</th>
                  <th>Último acesso</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.user_id} className="border-t border-line">
                    <td className="py-2">{p.display_name || "—"}</td>
                    <td>{p.email || "—"}</td>
                    <td>{new Date(p.created_at).toLocaleDateString("pt-PT")}</td>
                    <td>{p.cv_count}</td>
                    <td>{new Date(p.last_seen_at).toLocaleDateString("pt-PT")}</td>
                    <td>{p.plan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppShell>
  );
}
