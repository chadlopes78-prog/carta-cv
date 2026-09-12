import { Link, useRouterState } from "@tanstack/react-router";
import { FileText, HelpCircle, LayoutGrid, Plus, User } from "lucide-react";
import type { ReactNode } from "react";
import { APP_NAME } from "@/lib/config";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/cn";

const SIDE = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/cv/novo", label: "Criar CV" },
  { to: "/modelos", label: "Modelos" },
  { to: "/conta", label: "Minha conta" },
  { to: "/suporte", label: "Suporte" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper">
        <div className="h-10 w-10 animate-pulse rounded-full bg-line" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <div className="min-h-dvh bg-paper pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <aside className="no-print fixed inset-y-0 left-0 hidden w-56 border-r border-line bg-cream lg:flex lg:flex-col">
        <Link to="/" className="px-5 py-6 font-display text-xl text-ink">
          {APP_NAME}
        </Link>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {SIDE.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex h-11 items-center rounded-md px-3 text-sm",
                pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to))
                  ? "bg-forest-soft text-forest"
                  : "text-muted hover:bg-paper hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line p-4">
          <UserButton />
        </div>
      </aside>

      <header className="no-print sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-cream/90 px-4 py-3 backdrop-blur lg:hidden pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link to="/" className="font-display text-lg">
          {APP_NAME}
        </Link>
        <UserButton compact />
      </header>

      <div className="lg:pl-56">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">{children}</div>
      </div>

      <nav className="no-print fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-cream pb-[env(safe-area-inset-bottom)] lg:hidden">
        {[
          { to: "/dashboard", label: "Início", icon: LayoutGrid },
          { to: "/modelos", label: "Modelos", icon: FileText },
          { to: "/cv/novo", label: "Criar", icon: Plus },
          { to: "/conta", label: "Conta", icon: User },
          { to: "/suporte", label: "Ajuda", icon: HelpCircle },
        ].map((item) => {
          const Icon = item.icon;
          const on = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[11px]", on ? "text-forest" : "text-muted")}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
