import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "ml-2 inline-block rounded-full border px-2 py-0.5 font-mono text-[11px] align-middle",
  {
    variants: {
      variant: {
        default: "border-green/40 bg-green/10 text-green",
        warn: "border-red/40 bg-red/10 text-red",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
