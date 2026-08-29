import { HeroClock } from "@/components/hero-clock";
import { WorldTimeConverter } from "@/components/world-time-converter";
import { CalendarConverter } from "@/components/calendar-converter";
import { NumeralConverter } from "@/components/numeral-converter";
import { HolidayCalendar } from "@/components/holiday-calendar";
import { AgeCalculator } from "@/components/age-calculator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const TAB_ITEMS = [
  { value: "time", label: "World Time" },
  { value: "calendar", label: "Calendar" },
  { value: "numerals", label: "Numerals" },
  { value: "holidays", label: "Holidays" },
  { value: "age", label: "Age" },
];

export default function Home() {
  return (
    <main className="relative mx-auto min-h-screen max-w-[920px] overflow-hidden px-4 pb-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -left-32 top-52 h-72 w-72 rounded-full bg-green/10 blur-3xl" />
        <div className="absolute -right-32 top-96 h-72 w-72 rounded-full bg-red/10 blur-3xl" />
      </div>

      <HeroClock />

      <section className="relative rounded-[2rem] border border-ink/10 bg-surface/45 p-2 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-3">
        <Tabs defaultValue="time">
          <TabsList aria-label="EthioSync tools">
            {TAB_ITEMS.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
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
          <TabsContent value="holidays">
            <HolidayCalendar />
          </TabsContent>
          <TabsContent value="age">
            <AgeCalculator />
          </TabsContent>
        </Tabs>
      </section>

      <footer className="mx-auto max-w-[680px] pt-8 text-center font-mono text-xs leading-6 text-ink-dim">
        Calculations follow the fixed-date method in Reingold &amp; Dershowitz,{' '}
        <em>Calendrical Calculations</em>, calibrated against the Ethiopian calendar&apos;s documented leap-year cycle.
      </footer>
    </main>
  );
}
