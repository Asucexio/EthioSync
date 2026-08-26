"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  fixedFromGregorian, gregorianFromFixed, fixedFromEthiopic, ethiopicFromFixed,
  ethiopicMonthLength, dayOfWeek, ETH_MONTHS, GREG_MONTHS,
} from "@/lib/calendar";
import { arabicToGeez } from "@/lib/geez-numerals";
import { EthiopianMonthGrid } from "./ethiopian-month-grid";
import { DateCalculator } from "./date-calculator";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

type Direction = "gregToEth" | "ethToGreg";
type View = "converter" | "monthGrid" | "calculator";

export function CalendarConverter() {
  const [view, setView] = useState<View>("converter");
  const [direction, setDirection] = useState<Direction>("gregToEth");
  const [gregDate, setGregDate] = useState("");
  const [ethMonth, setEthMonth] = useState("1");
  const [ethDay, setEthDay] = useState("1");
  const [ethYear, setEthYear] = useState("2018");

  useEffect(() => {
    const today = new Date();
    setGregDate(`${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`);
    const fixed = fixedFromGregorian(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const [ey, em, ed] = ethiopicFromFixed(fixed);
    setEthMonth(String(em));
    setEthDay(String(ed));
    setEthYear(String(ey));
  }, []);

  const maxDay = useMemo(() => {
    const y = parseInt(ethYear, 10);
    const m = parseInt(ethMonth, 10);
    if (!y || !m) return 30;
    return ethiopicMonthLength(y, m);
  }, [ethYear, ethMonth]);

  const result = useMemo(() => {
    if (view !== "converter") return null;
    if (direction === "gregToEth") {
      if (!gregDate) return null;
      const [y, m, d] = gregDate.split("-").map(Number);
      if (!y || !m || !d) return null;
      const fixed = fixedFromGregorian(y, m, d);
      const [ey, em, ed] = ethiopicFromFixed(fixed);
      const mo = ETH_MONTHS[em - 1];
      return {
        main: `${mo.en} ${ed}, ${ey}`,
        geez: `${mo.ge} ${arabicToGeez(ed)} ${arabicToGeez(ey)}`,
        meta: dayOfWeek(fixed),
      };
    }
    const m = parseInt(ethMonth, 10);
    const y = parseInt(ethYear, 10);
    let d = parseInt(ethDay, 10);
    if (!m || !y || !d) return null;
    const limit = ethiopicMonthLength(y, m);
    if (d > limit) d = limit;
    const fixed = fixedFromEthiopic(y, m, d);
    const [gy, gm, gd] = gregorianFromFixed(fixed);
    return {
      main: `${GREG_MONTHS[gm - 1]} ${gd}, ${gy}`,
      geez: "",
      meta: `${dayOfWeek(fixed)} · Gregorian`,
    };
  }, [view, direction, gregDate, ethMonth, ethDay, ethYear]);

  const ViewSwitcher = (
    <div className="flex gap-2">
      <Button
        variant={view === "converter" ? "default" : "ghost"}
        size="sm"
        onClick={() => setView("converter")}
      >
        Converter
      </Button>
      <Button
        variant={view === "monthGrid" ? "default" : "ghost"}
        size="sm"
        onClick={() => setView("monthGrid")}
      >
        Month Grid
      </Button>
      <Button
        variant={view === "calculator" ? "default" : "ghost"}
        size="sm"
        onClick={() => setView("calculator")}
      >
        Calculator
      </Button>
    </div>
  );

  if (view === "monthGrid") {
    return (
      <div className="space-y-4">
        {ViewSwitcher}
        <EthiopianMonthGrid />
      </div>
    );
  }

  if (view === "calculator") {
    return (
      <div className="space-y-4">
        {ViewSwitcher}
        <DateCalculator />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ViewSwitcher}

      <Card>
        <CardHeader>
          <CardTitle>{direction === "gregToEth" ? "Gregorian → Ethiopian" : "Ethiopian → Gregorian"}</CardTitle>
          <CardDescription>Ethiopia&apos;s calendar runs 7–8 years behind and starts its year in September.</CardDescription>
        </CardHeader>

        {direction === "gregToEth" ? (
          <div className="mb-4">
            <Label htmlFor="greg-date">Gregorian date</Label>
            <Input id="greg-date" type="date" value={gregDate} onChange={(e) => setGregDate(e.target.value)} />
          </div>
        ) : (
          <div className="mb-4">
            <Label>Ethiopian date</Label>
            <div className="grid grid-cols-[1.3fr_1fr_0.9fr] gap-2.5">
              <Select value={ethMonth} onValueChange={setEthMonth}>
                <SelectTrigger aria-label="Ethiopian month"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ETH_MONTHS.map((mo, i) => (
                    <SelectItem key={mo.en} value={String(i + 1)}>{mo.en} ({mo.ge})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number" min={1} max={maxDay} placeholder="Day" aria-label="Ethiopian day"
                value={ethDay} onChange={(e) => setEthDay(e.target.value)}
              />
              <Input
                type="number" min={1} placeholder="Year" aria-label="Ethiopian year"
                value={ethYear} onChange={(e) => setEthYear(e.target.value)}
              />
            </div>
          </div>
        )}

        <Button
          variant="dashed" size="full" className="mb-4.5"
          onClick={() => setDirection(direction === "gregToEth" ? "ethToGreg" : "gregToEth")}
        >
          ⇄ &nbsp;Convert the other direction
        </Button>

        <div className="border-t border-ink/10 pt-4.5">
          <p className="mb-1.5 text-xs uppercase tracking-wide text-ink-muted">
            {direction === "gregToEth" ? "Ethiopian date" : "Gregorian date"}
          </p>
          <p id="cal-result-main" className="m-0 mb-1 break-words font-display text-[clamp(26px,6vw,32px)] font-semibold">
            {result ? result.main : "—"}
          </p>
          {result?.geez && <p className="font-geez text-[13px] text-gold">{result.geez}</p>}
          {result?.meta && <p className="font-mono text-[13px] text-ink-muted">{result.meta}</p>}
        </div>
      </Card>
    </div>
  );
}