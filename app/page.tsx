import { HeroClock } from "@/components/hero-clock";
import { WorldTimeConverter } from "@/components/world-time-converter";
import { CalendarConverter } from "@/components/calendar-converter";
import { NumeralConverter } from "@/components/numeral-converter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Home() {
  return (
    <main className="mx-auto max-w-[760px] px-5 pb-16">
      <HeroClock />

      <Tabs defaultValue="time">
        <TabsList>
          <TabsTrigger value="time">World Time</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="numerals">Numerals</TabsTrigger>
        </TabsList>

        <TabsContent value="time">
          <WorldTimeConverter />
        </TabsContent>
        <TabsContent value="calendar">
          <CalendarConverter />
        </TabsContent>
        <TabsContent value="numerals">
          <NumeralConverter />
        </TabsContent>
      </Tabs>

      <footer className="pt-5 text-center font-mono text-xs text-ink-dim">
        Calculations follow the fixed-date method in Reingold &amp; Dershowitz,{" "}
        <em>Calendrical Calculations</em>, calibrated against the Ethiopian calendar&apos;s documented leap-year cycle.
      </footer>
    </main>
  );
}
