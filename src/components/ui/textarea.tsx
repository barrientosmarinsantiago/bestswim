import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-28 w-full rounded-md border border-white/[0.14] bg-white/[0.07] px-3 py-3 text-sm text-swim-white outline-none transition placeholder:text-swim-steel/70 focus:border-swim-cyan/60 focus:ring-2 focus:ring-swim-cyan/20",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";

export { Textarea };
