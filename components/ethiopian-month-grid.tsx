"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  buildEthiopianMonthGrid,
  ethiopicMonthLength,
  ethiopicFromFixed,
  fixedFromGregorian,
  ETH_MONTHS,
  WEEKDAYS_SHORT,
  type GridDay,
} from "@/lib/calendar";
import { arabicToGeez } from "@/lib/geez-numerals";
import { getHolidaysForYear, type Holiday } from "@/lib/holidays";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

function useTodayFixed() {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => {
    const d = new Date();
    setToday(fixedFromGregorian(d.getFullYear(), d.getMonth() + 1, d.getDate()));
  }, []);
  return today;
}

function holidayMapForYear(gregYear: number): Map<number, Holiday[]> {
  const map = new Map<number, Holiday[]>();
  const holidays = getHolidaysForYear(gregYear);
  for (const h of holidays) {
    if (h.isRange && h.gFixedEnd) {
      for (let f = h.gFixed; f <= h.gFixedEnd; f++) {
        const list = map.get(f) ?? [];
        list.push(h);
        map.set(f, list);
      }
    } else {
      const list = map.get(h.gFixed) ?? [];
      list.push(h);
      map.set(h.gFixed, list);
    }
  }
  return map;
}

function DayCell({ day, holidays }: { day: GridDay; holidays: Holiday[] }) {
  const hasFast = holidays.some((h) => h.type === "fast");
  const hasFeast = holidays.some((h) => h.type === "feast");
  const hasNational = holidays.some((h) => h.type === "national");

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-lg border p-1.5 transition-colors",
        day.isOtherMonth && "opacity-40",
        day.isToday
          ? "border-gold bg-gold/10"
          : "border-ink/8 hover:border-ink/20",
        hasFast && !day.isToday && "bg-red/5",
        hasFeast && !day.isToday && "bg-gold/5",
      )}
    >
      <span
        className={cn(
          "font-display text-[15px] font-semibold",
          day.isToday ? "text-gold" : "text-ink",
          day.isPadume && "text-ink-muted"
        )}
      >
        {arabicToGeez(day.ethDay)}
      </span>
      <span className="font-mono text-[10px] text-ink-dim">
        {day.gregMonth}/{day.gregDay}
      </span>

      {(hasFast || hasFeast || hasNational) && (
        <div className="mt-1 flex gap-0.5">
          {hasFast && <span className="h-1.5 w-1.5 rounded-full bg-red" title="Fast" />}
          {hasFeast && <span className="h-1.5 w-1.5 rounded-full bg-gold" title="Feast" />}
          {hasNational && <span className="h-1.5 w-1.5 rounded-full bg-green" title="Holiday" />}
        </div>
      )}
    </div>
  );
}

export function EthiopianMonthGrid() {
  const todayFixed = useTodayFixed();
  const [ethYear, setEthYear] = useState(2018);
  const [ethMonth, setEthMonth] = useState(1);

  // Seed with today's Ethiopian date once known
  useEffect(() => {
    if (todayFixed === null) return;
    const [y, m] = ethiopicFromFixed(todayFixed);
    setEthYear(y);
    setEthMonth(m);
  }, [todayFixed]);

  const grid = useMemo(() => {
    if (todayFixed === null) return [];
    return buildEthiopianMonthGrid(ethYear, ethMonth, todayFixed);
  }, [ethYear, ethMonth, todayFixed]);

  // Holidays indexed by fixed date for the Gregorian year that contains this month
  const holidayMap = useMemo(() => {
    if (grid.length === 0) return new Map<number, Holiday[]>();
    // Use the Gregorian year of the middle of the grid as the lookup year
    const mid = grid[Math.floor(grid.length / 2)];
    return holidayMapForYear(mid.gregYear);
  }, [grid]);

  const monthInfo = ETH_MONTHS[ethMonth - 1];
  const monthLen = ethiopicMonthLength(ethYear, ethMonth);

  function prevMonth() {
    setEthMonth((m) => {
      if (m > 1) return m - 1;
      setEthYear((y) => y - 1);
      return 13;
    });
  }

  function nextMonth() {
    setEthMonth((m) => {
      if (m < 13) return m + 1;
      setEthYear((y) => y + 1);
      return 1;
    });
  }

  function goToToday() {
    if (todayFixed === null) return;
    const [y, m] = ethiopicFromFixed(todayFixed);
    setEthYear(y);
    setEthMonth(m);
  }

  if (todayFixed === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ethiopian Month View</CardTitle>
          <CardDescription>Loading…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-gold" />
          Ethiopian Month View
        </CardTitle>
        <CardDescription>
          Browse Ethiopian months. Each cell shows the Ge&apos;ez date and its Gregorian equivalent.
          Dots mark fasting days (red), feasts (gold), and public holidays (green).
        </CardDescription>
      </CardHeader>

      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="Previous month">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <p className="font-display text-lg font-semibold">
            {monthInfo.en} <span className="font-geez text-gold">{monthInfo.ge}</span>
          </p>
          <p className="font-mono text-[11px] text-ink-muted">
            {ethYear} · {monthLen} days · Year of {ethYear % 4 === 3 ? "Grace" : "Mercy"}
          </p>
        </div>

        <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="Next month">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-3 flex items-center justify-center gap-2">
        <Button variant="dashed" size="sm" onClick={goToToday}>
          Today
        </Button>
        {todayFixed !== null && (
          <Badge variant="outline" className="font-mono text-[11px]">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </Badge>
        )}
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS_SHORT.map((wd) => (
          <div key={wd} className="py-1 text-center font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-dim">
            {wd}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {grid.map((day) => (
          <DayCell key={day.fixed} day={day} holidays={holidayMap.get(day.fixed) ?? []} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 border-t border-ink/8 pt-3">
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-ink-muted">
          <span className="h-2 w-2 rounded-full bg-red" /> Fast
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-ink-muted">
          <span className="h-2 w-2 rounded-full bg-gold" /> Feast
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-ink-muted">
          <span className="h-2 w-2 rounded-full bg-green" /> Holiday
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-ink-muted">
          <span className="inline-block h-2 w-2 rounded-full border border-gold bg-gold/10" /> Today
        </span>
      </div>
    </Card>
  );
}