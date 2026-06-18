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
        "sticky top-0 z-20 flex gap-1.5 rounded-full border border-ink/10 bg-bg/90 p-1.5 backdrop-blur-md",
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
        "flex-1 rounded-full px-2 py-2.5 text-[13.5px] font-semibold font-body text-ink-muted transition-colors",
        "hover:text-ink data-[state=active]:bg-gold data-[state=active]:text-[#1c150d]",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("mt-7", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
