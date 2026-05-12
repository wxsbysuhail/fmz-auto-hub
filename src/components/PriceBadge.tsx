import { cn } from "@/lib/utils";

interface PriceBadgeProps {
  amount: number;
  label?: string;
  className?: string;
}

export function PriceBadge({ amount, label, className }: PriceBadgeProps) {
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary border border-primary/20", className)}>
      <div className="flex flex-col leading-tight">
        {label && <span className="text-[9px] uppercase tracking-wider font-bold opacity-70">{label}</span>}
        <span className="text-sm font-semibold tracking-tight">
          Rs {amount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

