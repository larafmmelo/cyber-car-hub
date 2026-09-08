import { Link } from "@tanstack/react-router";
import { Gauge, Fuel, SquareParking, Zap, Route as RouteIcon } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/combustivel", label: "Combustível", icon: Fuel },
  { to: "/estacionamento", label: "Estacionamento", icon: SquareParking },
  { to: "/eletrico", label: "Elétrico", icon: Zap },
  { to: "/viagens", label: "Viagens", icon: RouteIcon },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
      <aside className="glass h-fit shrink-0 p-4 lg:sticky lg:top-6 lg:w-60">
        <div className="mb-6 flex items-center gap-3 px-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[image:var(--gradient-neon)] neon-ring">
            <Zap className="size-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display text-lg font-bold leading-none neon-text">CYBERDRIVE</p>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              mobility os
            </p>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{
                className:
                  "bg-[image:var(--gradient-neon)] text-primary-foreground neon-ring hover:text-primary-foreground",
              }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 pb-10">{children}</main>
    </div>
  );
}
