import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function CourseBadge({
  label,
  tone = "gold",
  className,
}: {
  label: string;
  tone?: "gold" | "navy" | "muted";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide",
        tone === "gold" && "border-gold/30 bg-accent text-accent-foreground",
        tone === "navy" && "border-navy/15 bg-navy/5 text-navy",
        tone === "muted" && "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

export const CertificationBadge = CourseBadge;
