import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "bg-navy-900 text-white",
        secondary: "bg-navy-800/10 text-navy-800",
        mechanic: "bg-mechanic-500 text-white",
        promo: "bg-mechanic-500 text-white shadow-glow-mechanic",
        success: "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30",
        warning: "bg-amber-500/15 text-amber-800 border border-amber-500/30",
        danger: "bg-rose-500/15 text-rose-700 border border-rose-500/30",
        outline: "border border-navy-900/20 text-navy-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
