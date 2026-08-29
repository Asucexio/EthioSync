"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

function Tabs(props: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root {...props} />;
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "sticky top-3 z-20 flex gap-1.5 overflow-x-auto rounded-[1.35rem] border border-ink/10 bg-bg/85 p-1.5 shadow-xl shadow-black/15 backdrop-blur-md",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "min-w-fit flex-1 rounded-2xl px-3 py-2.5 text-[13.5px] font-semibold font-body text-ink-muted transition-all",
        "hover:bg-ink/5 hover:text-ink data-[state=active]:bg-gold data-[state=active]:text-[#1c150d] data-[state=active]:shadow-lg data-[state=active]:shadow-gold/20",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("mt-3 focus-visible:outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
