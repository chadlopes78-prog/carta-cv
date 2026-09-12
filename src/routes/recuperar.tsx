import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { requestPasswordReset, resetPasswordWithToken } from "@/lib/account/server";
import { COUNTRY_CODES, passwordError } from "@/lib/phone";
import { SUPPORT_WHATSAPP_URL } from "@/lib/config";
import { cn } from "@/lib/cn";

type Search = { token?: string };

export const Route = createFileRoute("/recuperar")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    token: typeof s.token === "string" ? s.token : undefined,
  }),
  component: Recuperar,
});

function Recuperar() {
  const { token } = Route.useSearch();
  if (token) return <ResetForm token={token} />;
  return <RequestForm />;
}

function RequestForm() {
  const [channel, setChannel] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+258");
  const [national, setNational] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await requestPasswordReset({
        data: channel === "email" ? { channel, email } : { channel, countryCode, national },
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível pedir a recuperação.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-4 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-display text-2xl">
          Carta
        </Link>
        <h1 className="mt-8 font-display text-3xl">Recuperar palavra-passe</h1>
        <p className="mt-2 text-sm text-muted">Escolhe como criaste a conta.</p>
        <div className="mt-5 grid grid-cols-2 rounded-md bg-cream p-1 ring-1 ring-line">
          <button
            type="button"
            className={cn("h-11 rounded-sm text-sm", channel === "email" ? "bg-ink text-cream" : "text-muted")}
            onClick={() => setChannel("email")}
          >
            E-mail
          </button>
          <button
            type="button"
            className={cn("h-11 rounded-sm text-sm", channel === "phone" ? "bg-ink text-cream" : "text-muted")}
            onClick={() => setChannel("phone")}
          >
            Telefone
          </button>
        </div>
        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          {channel === "email" ? (
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          ) : (
            <div>
              <Label>Número de telefone</Label>
              <div className="flex gap-2">
                <select
                  className="h-11 w-[7.5rem] rounded-md border border-line bg-cream px-2 text-sm"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.iso} value={c.code}>
                      {c.iso} {c.code}
                    </option>
                  ))}
                </select>
                <Input inputMode="tel" value={national} onChange={(e) => setNational(e.target.value)} required />
              </div>
            </div>
          )}
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "A enviar…" : "Enviar instruções"}
          </Button>
        </form>
        {sent && channel === "email" && (
          <p className="mt-4 text-sm text-forest">
            Se a conta existir, enviámos instruções para o email. Não recebeste? Fala connosco no{" "}
            <a className="underline" href={SUPPORT_WHATSAPP_URL}>
              WhatsApp
            </a>
            .
          </p>
        )}
        {sent && channel === "phone" && (
          <p className="mt-4 text-sm text-forest">
            O código SMS está preparado para este número. O envio automático por SMS entra em breve — até lá, recupera a
            conta pelo email ou pelo{" "}
            <a className="underline" href={SUPPORT_WHATSAPP_URL}>
              WhatsApp
            </a>
            .
          </p>
        )}
        <Link to="/login" className="mt-6 block text-sm text-muted">
          Voltar ao início de sessão
        </Link>
      </div>
    </main>
  );
}

function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const pwd = passwordError(password, confirm);
    if (pwd) {
      setError(pwd);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await resetPasswordWithToken({ data: { token, password } });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível alterar a palavra-passe.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="grid min-h-dvh place-items-center bg-paper px-4">
        <div className="max-w-sm text-center">
          <h1 className="font-display text-3xl">Palavra-passe actualizada</h1>
          <p className="mt-2 text-sm text-muted">Já podes entrar com a nova palavra-passe.</p>
          <Link to="/login" className="mt-6 inline-block">
            <Button>Entrar</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-4 py-12">
      <form className="w-full max-w-sm space-y-3" onSubmit={onSubmit}>
        <h1 className="font-display text-3xl">Nova palavra-passe</h1>
        <div>
          <Label>Palavra-passe</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        </div>
        <div>
          <Label>Confirmar palavra-passe</Label>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} required />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "A guardar…" : "Guardar"}
        </Button>
      </form>
    </main>
  );
}
