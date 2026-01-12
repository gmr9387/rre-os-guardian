import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-border",
        assist: "bg-primary/20 text-primary border-primary/30 uppercase tracking-wider",
        auto: "bg-success/20 text-success border-success/30 uppercase tracking-wider",
        safe: "bg-warning/20 text-warning border-warning/30 uppercase tracking-wider",
        conservative: "bg-blue-500/20 text-blue-400 border-blue-500/30 uppercase tracking-wider",
        normal: "bg-primary/20 text-primary border-primary/30 uppercase tracking-wider",
        aggressive: "bg-danger/20 text-danger border-danger/30 uppercase tracking-wider",
        healthy: "bg-success/20 text-success border-success/30",
        elevated: "bg-warning/20 text-warning border-warning/30",
        locked: "bg-danger/20 text-danger border-danger/30",
        buy: "bg-success/20 text-success border-success/30 font-mono",
        sell: "bg-danger/20 text-danger border-danger/30 font-mono",
        live: "bg-success/20 text-success border-success/30 animate-pulse",
        test: "bg-warning/20 text-warning border-warning/30",
        train: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        reclaim: "bg-primary/20 text-primary border-primary/30",
        retest: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        ladder: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        warning: "bg-warning/20 text-warning border-warning/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export type BadgeVariant = NonNullable<React.ComponentProps<typeof Badge>["variant"]>;

export { Badge, badgeVariants };
