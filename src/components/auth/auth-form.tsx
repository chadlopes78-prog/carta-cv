import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/client";
import { accountExists, checkPhoneAvailable, recordLogin, syncMyProfile } from "@/lib/account/server";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { APP_NAME, SUPPORT_WHATSAPP_URL } from "@/lib/config";
import { COUNTRY_CODES, isValidEmail, mapAuthError, passwordError, phoneAuthEmail, toE164 } from "@/lib/phone";
import { cn } from "@/lib/cn";

type Method = "email" | "phone";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+258");
  const [national, setNational] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function afterAuth(profile: {
    displayName?: string;
    email?: string;
    phone?: string;
    countryCode?: string;
    loginMethod: Method;
  }) {
    await authClient.getSession();
    try {
      await syncMyProfile({ data: profile });
      await recordLogin();
    } catch {
      /* profile sync is best-effort after Better Auth session exists */
    }
    navigate({ to: "/dashboard" });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "signup") {
      const pwd = passwordError(password, confirm);
      if (pwd) {
        setError(pwd);
        return;
      }
    }
    setBusy(true);
    try {
      if (method === "email") {
        const trimmed = email.trim().toLowerCase();
        if (!isValidEmail(trimmed)) throw new Error("Indica um email válido.");
        if (mode === "signup") {
          const { error: err } = await authClient.signUp.email({
            name: name.trim() || trimmed.split("@")[0],
            email: trimmed,
            password,
            callbackURL: "/dashboard",
          });
          if (err) throw new Error(err.message || "Não foi possível criar a conta.");
          await afterAuth({ displayName: name.trim(), email: trimmed, loginMethod: "email" });
        } else {
          const { error: err } = await authClient.signIn.email({
            email: trimmed,
            password,
            callbackURL: "/dashboard",
          });
          if (err) {
            try {
              const found = await accountExists({ data: { email: trimmed } });
              if (!found.exists) throw new Error("Não tens conta. Clica em Criar conta.");
            } catch (lookupErr) {
              if (lookupErr instanceof Error && lookupErr.message.includes("Não tens conta")) throw lookupErr;
            }
            throw new Error(err.message || "Email ou palavra-passe incorrectos.");
          }
          await afterAuth({ email: trimmed, loginMethod: "email" });
        }
        return;
      }

      const e164 = toE164(countryCode, national);
      if (!e164) throw new Error("Indica um número de telefone válido.");
      const authEmail = phoneAuthEmail(e164);
      if (mode === "signup") {
        await checkPhoneAvailable({ data: { countryCode, national } });
        const { error: err } = await authClient.signUp.email({
          name: name.trim() || `+${e164}`,
          email: authEmail,
          password,
          callbackURL: "/dashboard",
        });
        if (err) throw new Error(err.message || "Não foi possível criar a conta.");
        await afterAuth({
          displayName: name.trim() || undefined,
          phone: e164,
          countryCode,
          loginMethod: "phone",
        });
      } else {
        const { error: err } = await authClient.signIn.email({
          email: authEmail,
          password,
          callbackURL: "/dashboard",
        });
        if (err) {
          try {
            const found = await accountExists({ data: { email: authEmail } });
            if (!found.exists) throw new Error("Não tens conta. Clica em Criar conta.");
          } catch (lookupErr) {
            if (lookupErr instanceof Error && lookupErr.message.includes("Não tens conta")) throw lookupErr;
          }
          throw new Error("Número ou palavra-passe incorrectos. Se ainda não tens conta, clica em Criar conta.");
        }
        await afterAuth({ phone: e164, countryCode, loginMethod: "phone" });
      }
    } catch (err) {
      setError(mapAuthError(err instanceof Error ? err.message : ""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <Link to="/" className="font-display text-2xl text-ink">
        {APP_NAME}
      </Link>
      <h1 className="mt-8 font-display text-3xl text-ink">
        {mode === "signup" ? "Cria a tua conta" : "Entra na tua conta"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {mode === "signup" ? "Usa o teu email ou o teu número de telefone." : "Continua os teus CVs onde paraste."}
      </p>
      {mode === "login" && (
        <p className="mt-3 rounded-md bg-paper px-3 py-2 text-sm text-ink ring-1 ring-line">
          Ainda não tens conta?{" "}
          <Link to="/criar-conta" className="font-medium text-forest underline-offset-4 hover:underline">
            Clica em criar conta
          </Link>
          .
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 rounded-md bg-paper p-1 ring-1 ring-line">
        <button
          type="button"
          className={cn("h-11 rounded-sm text-sm", method === "email" ? "bg-cream text-ink shadow-card" : "text-muted")}
          onClick={() => setMethod("email")}
        >
          {mode === "signup" ? "Com e-mail" : "E-mail"}
        </button>
        <button
          type="button"
          className={cn("h-11 rounded-sm text-sm", method === "phone" ? "bg-cream text-ink shadow-card" : "text-muted")}
          onClick={() => setMethod("phone")}
        >
          {mode === "signup" ? "Com telefone" : "Telefone"}
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        {mode === "signup" && (
          <div>
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required={method === "email"} />
          </div>
        )}

        {method === "email" ? (
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        ) : (
          <div>
            <Label>Número de telefone</Label>
            <div className="flex gap-2">
              <select
                className="h-11 w-[7.5rem] shrink-0 rounded-md border border-line bg-cream px-2 text-sm"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                aria-label="Código do país"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.iso} value={c.code}>
                    {c.iso} {c.code}
                  </option>
                ))}
              </select>
              <Input
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="84 123 4567"
                value={national}
                onChange={(e) => setNational(e.target.value)}
                required
              />
            </div>
            <p className="mt-1 text-xs text-muted">Moçambique (+258) está seleccionado. Podes mudar o país.</p>
          </div>
        )}

        <div>
          <Label htmlFor="password">Palavra-passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        {mode === "signup" && (
          <div>
            <Label htmlFor="confirm">Confirmar palavra-passe</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={8}
              required
            />
          </div>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "A processar…" : mode === "signup" ? "Criar conta" : "Entrar"}
        </Button>
      </form>

      {mode === "login" && (
        <p className="mt-4 text-sm">
          <Link to="/recuperar" className="text-forest underline-offset-4 hover:underline">
            Esqueceste a palavra-passe?
          </Link>
        </p>
      )}

      <p className="mt-6 text-sm text-muted">
        {mode === "signup" ? (
          <>
            Já tens conta?{" "}
            <Link to="/login" className="text-ink underline-offset-4 hover:underline">
              Entrar
            </Link>
          </>
        ) : (
          <>
            Não tens conta?{" "}
            <Link to="/criar-conta" className="font-medium text-forest underline-offset-4 hover:underline">
              Clica aqui para criar conta
            </Link>
          </>
        )}
      </p>

      <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer" className="mt-8 block text-sm text-muted hover:text-ink">
        Tens alguma dúvida? Contacta o suporte
      </a>
    </div>
  );
}
