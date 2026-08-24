import { cn } from "@/lib/utils";

export function UserAvatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-xs font-semibold text-white ring-2 ring-gold/40",
        className,
      )}
    >
      {initials}
    </span>
  );
}
