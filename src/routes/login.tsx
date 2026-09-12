import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth/auth-form";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
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
      <div className="hidden flex-col justify-between bg-ink p-10 text-cream lg:flex">
        <Link to="/" className="font-display text-2xl">
          Carta
        </Link>
        <blockquote className="max-w-sm font-display text-3xl leading-snug">
          Um CV claro abre portas. O resto é o teu trabalho.
        </blockquote>
        <p className="text-sm text-cream/60">Entra com o teu email ou o teu número de telefone.</p>
      </div>
      <div className="flex items-center px-4 py-10 sm:px-10">
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
