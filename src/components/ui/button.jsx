import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mechanic-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-mechanic-500 hover:bg-mechanic-400 text-white shadow-glow-mechanic hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-navy-900 hover:bg-navy-800 text-white active:scale-[0.98]",
        outline:
          "border border-navy-900/20 hover:border-navy-900/40 text-navy-900 bg-transparent active:scale-[0.98]",
        ghost: "text-navy-900 hover:bg-navy-900/5",
        danger: "bg-red-600 hover:bg-red-700 text-white",
        light:
          "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export function Button({ className, variant, size, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
