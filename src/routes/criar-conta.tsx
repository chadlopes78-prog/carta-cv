import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth/auth-form";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/criar-conta")({ component: SignUp });

function SignUp() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-paper">
        <div className="h-10 w-10 animate-pulse rounded-full bg-line" />
      </main>
    );
  }
  if (user) return <Navigate to="/dashboard" />;

  return (
    <main className="grid min-h-dvh bg-paper lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-forest p-10 text-cream lg:flex">
        <Link to="/" className="font-display text-2xl">
          Carta
        </Link>
        <div>
          <p className="font-display text-3xl leading-snug">Três minutos. Um CV pronto a enviar.</p>
          <p className="mt-4 max-w-sm text-cream/80">Cria a conta com email ou com o teu número de telefone.</p>
        </div>
        <p className="text-sm text-cream/60">Conta gratuita. Sem cartão. Os teus CVs ficam só na tua conta.</p>
      </div>
      <div className="flex items-center px-4 py-10 sm:px-10">
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}
