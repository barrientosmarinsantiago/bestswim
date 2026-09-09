import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-md border border-white/[0.14] bg-white/[0.07] px-3 text-sm text-swim-white outline-none transition placeholder:text-swim-steel/70 focus:border-swim-cyan/60 focus:ring-2 focus:ring-swim-cyan/20",
      className
    )}
    {...props}
  />
));

Input.displayName = "Input";

export { Input };
