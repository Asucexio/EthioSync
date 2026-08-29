import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-ink/15 bg-black/25 px-3.5 py-3 text-[15px] font-mono text-ink shadow-inner shadow-black/10 placeholder:text-ink-dim",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-0",
        className
      )}
      {...props}
    />
  );
}

export { Input };
