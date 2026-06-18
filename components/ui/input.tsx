import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-[10px] border border-ink/20 bg-black/20 px-3 py-2.5 text-[15px] font-mono text-ink placeholder:text-ink-dim",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-0",
        className
      )}
      {...props}
    />
  );
}

export { Input };
