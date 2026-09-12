import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EditorPage } from "@/components/cv/editor-page";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getResume } from "@/lib/resume/server";
import type { ResumeRecord } from "@/lib/resume/types";

export const Route = createFileRoute("/cv/$id/editar")({ component: EditCv });

function EditCv() {
  const { id } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const [cv, setCv] = useState<ResumeRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    getResume({ data: { id } })
      .then(setCv)
      .catch(() => setError("Não foi possível abrir este CV."));
  }, [id, user]);

  if (isPending) return <div className="grid min-h-dvh place-items-center bg-paper">A carregar…</div>;
  if (!user) return <RedirectToSignIn />;
  if (error) return <main className="grid min-h-dvh place-items-center bg-paper text-danger">{error}</main>;
  if (!cv) return <div className="grid min-h-dvh place-items-center bg-paper">A carregar…</div>;
  return <EditorPage initial={cv} />;
}
