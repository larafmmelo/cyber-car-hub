import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: "purple" | "pink";
}) {
  return (
    <div
      className={cn(
        "glass p-5",
        glow === "purple" && "neon-ring",
        glow === "pink" && "neon-ring-pink",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="neon-text text-2xl font-bold uppercase">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Panel className="relative overflow-hidden">
      <span className="absolute inset-x-0 top-0 h-px bg-[image:var(--gradient-neon)]" />
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </Panel>
  );
}

export function NeonButton({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-all",
        variant === "primary"
          ? "bg-[image:var(--gradient-neon)] text-primary-foreground hover:opacity-90 neon-ring"
          : "border border-border bg-secondary/40 text-foreground hover:bg-accent",
        className,
      )}
    />
  );
}

export function Field({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <input
        {...props}
        className={cn(
          "w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-ring focus:shadow-[0_0_0_3px_oklch(0.65_0.28_0.4/20%)]",
          className,
        )}
      />
    </label>
  );
}

export function Badge({ children, tone = "purple" }: { children: ReactNode; tone?: "purple" | "pink" | "cyan" }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        tone === "purple" && "border-primary/50 bg-primary/15 text-foreground",
        tone === "pink" && "border-neon/50 bg-neon/15 text-foreground",
        tone === "cyan" && "border-cyan/50 bg-cyan/10 text-cyan",
      )}
    >
      {children}
    </span>
  );
}

export function Bar({ value, tone = "purple" }: { value: number; tone?: "purple" | "pink" }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={cn("h-full rounded-full", tone === "purple" ? "bg-primary" : "bg-neon")}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
