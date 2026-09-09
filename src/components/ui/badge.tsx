import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-swim-cyan/[0.28] bg-swim-cyan/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-swim-aqua",
        className
      )}
      {...props}
    />
  );
}
