import type { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  icon: Icon,
  isLoading,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  isLoading?: boolean;
}) {
  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/75 p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      {isLoading ? (
        <div className="h-8 w-24 animate-pulse rounded-lg bg-secondary" />
      ) : (
        <span className="font-mono-data text-2xl font-bold tracking-[-0.04em]">
          {value}
        </span>
      )}
    </div>
  );
}
