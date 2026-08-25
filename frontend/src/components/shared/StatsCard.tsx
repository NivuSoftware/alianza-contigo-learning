import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: string;
  className?: string;
}) {
  return (
    <div className={cn("surface-card hover-lift p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-navy">{value}</p>
          {trend && <p className="mt-1 text-xs text-muted-foreground">{trend}</p>}
        </div>
        {Icon && (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-gold">
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </div>
  );
}
