import { Link } from "@tanstack/react-router";
import logo from "@/assets/alianza-logo.jpg.asset.json";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
  showTagline?: boolean;
  to?: string;
}

export function Logo({ className, variant = "dark", showTagline = true, to = "/" }: LogoProps) {
  return (
    <Link to={to} className={cn("group flex items-center gap-3", className)} aria-label="Alianza Contigo">
      <img
        src={logo.url}
        alt="Alianza Contigo — Educación Continua"
        width={44}
        height={44}
        className="h-11 w-11 shrink-0 rounded-lg object-cover object-[50%_38%] ring-1 ring-border transition-transform duration-300 group-hover:scale-105"
      />
      <span className="min-w-0 leading-tight">
        <span
          className={cn(
            "block font-display text-[15px] font-semibold tracking-tight",
            variant === "light" ? "text-white" : "text-navy",
          )}
        >
          ALIANZA<span className="text-gold">CONTIGO</span>
        </span>
        {showTagline && (
          <span
            className={cn(
              "block text-[10px] tracking-[0.22em]",
              variant === "light" ? "text-white/60" : "text-muted-foreground",
            )}
          >
            EDUCACIÓN CONTINUA
          </span>
        )}
      </span>
    </Link>
  );
}
