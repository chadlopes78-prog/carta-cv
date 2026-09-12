import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { activatePremium, getMe, updateAccount } from "@/lib/resume/server";
import { UserButton } from "@/lib/auth/gates";
import { FREE_CV_LIMIT } from "@/lib/config";
import { formatPhone, publicEmail } from "@/lib/phone";

export const Route = createFileRoute("/conta")({ component: Conta });

function Conta() {
  const [me, setMe] = useState<Awaited<ReturnType<typeof getMe>> | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getMe().then((m) => {
      setMe(m);
      setName(m.displayName ?? "");
      setPhone(m.phone ?? "");
    });
  }, []);

  return (
    <AppShell>
      <h1 className="font-display text-2xl sm:text-3xl">Minha conta</h1>
      <div className="mt-6 max-w-lg space-y-4 rounded-lg border border-line bg-cream p-5">
        <div>
          <Label>Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={publicEmail(me?.email) ?? ""} disabled />
        </div>
        <div>
          <Label>Telefone</Label>
          <Input value={phone || formatPhone(me?.phone)} onChange={(e) => setPhone(e.target.value)} placeholder="+258 84 123 4567" />
        </div>
        <Button
          onClick={async () => {
            await updateAccount({ data: { displayName: name, phone } });
            setMsg("Guardado");
          }}
        >
          Guardar
        </Button>
        {msg && <p className="text-sm text-forest">{msg}</p>}
        <UserButton />
      </div>

      <section className="mt-8 max-w-lg rounded-lg border border-line bg-cream p-5">
        <h2 className="font-medium">Plano {me?.plan === "premium" ? "Premium" : "Gratuito"}</h2>
        <p className="mt-2 text-sm text-muted">
          Gratuito: até {FREE_CV_LIMIT} CVs e modelos essenciais. Premium: todos os modelos, CVs ilimitados, personalização avançada e recursos de IA.
        </p>
        {me?.plan !== "premium" && (
          <Button
            className="mt-4"
            onClick={async () => {
              await activatePremium();
              const next = await getMe();
              setMe(next);
            }}
          >
            Activar Premium (demonstração)
          </Button>
        )}
        {me?.role === "admin" && (
          <p className="mt-4 text-sm">
            Tens acesso de administrador.{" "}
            <a href="/admin" className="text-forest underline">
              Abrir admin
            </a>
          </p>
        )}
      </section>
    </AppShell>
  );
}
