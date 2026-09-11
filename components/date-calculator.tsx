"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  fixedFromGregorian, gregorianFromFixed, fixedFromEthiopic, ethiopicFromFixed,
  ethiopicMonthLength, dayOfWeek, addDaysToFixed, daysBetweenFixed,
  formatGregorian, formatEthiopic, formatEthiopicGeez,
  ETH_MONTHS, GREG_MONTHS,
} from "@/lib/calendar";
import { arabicToGeez } from "@/lib/geez-numerals";
import { cn } from "@/lib/utils";
import { Calculator, ArrowRight, Minus, Plus } from "lucide-react";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

type Mode = "add" | "diff";

export function DateCalculator() {
  const [mode, setMode] = useState<Mode>("add");
  const [gregDate, setGregDate] = useState("");
  const [ethMonth, setEthMonth] = useState("1");
  const [ethDay, setEthDay] = useState("1");
  const [ethYear, setEthYear] = useState("2018");
  const [useGregorian, setUseGregorian] = useState(true);
  const [deltaDays, setDeltaDays] = useState("30");
  const [gregDate2, setGregDate2] = useState("");
  const [ethMonth2, setEthMonth2] = useState("1");
  const [ethDay2, setEthDay2] = useState("1");
  const [ethYear2, setEthYear2] = useState("2018");
  const [useGregorian2, setUseGregorian2] = useState(true);

  useEffect(() => {
    const today = new Date();
    const g = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
    setGregDate(g);
    setGregDate2(g);
    const fixed = fixedFromGregorian(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const [ey, em, ed] = ethiopicFromFixed(fixed);
    setEthMonth(String(em));
    setEthDay(String(ed));
    setEthYear(String(ey));
    setEthMonth2(String(em));
    setEthDay2(String(ed));
    setEthYear2(String(ey));
  }, []);

  const maxDay = useMemo(() => {
    const y = parseInt(ethYear, 10);
    const m = parseInt(ethMonth, 10);
    if (!y || !m) return 30;
    return ethiopicMonthLength(y, m);
  }, [ethYear, ethMonth]);

  const maxDay2 = useMemo(() => {
    const y = parseInt(ethYear2, 10);
    const m = parseInt(ethMonth2, 10);
    if (!y || !m) return 30;
    return ethiopicMonthLength(y, m);
  }, [ethYear2, ethMonth2]);

  const result = useMemo(() => {
    // Parse first date
    let fixed1: number;
    if (useGregorian) {
      const [y, m, d] = gregDate.split("-").map(Number);
      if (!y || !m || !d) return null;
      fixed1 = fixedFromGregorian(y, m, d);
    } else {
      const m = parseInt(ethMonth, 10);
      const y = parseInt(ethYear, 10);
      let d = parseInt(ethDay, 10);
      if (!m || !y || !d) return null;
      d = Math.min(d, ethiopicMonthLength(y, m));
      fixed1 = fixedFromEthiopic(y, m, d);
    }

    if (mode === "add") {
      const delta = parseInt(deltaDays, 10);
      if (Number.isNaN(delta)) return null;
      const res = addDaysToFixed(fixed1, delta);
      return {
        mode: "add" as const,
        startFixed: fixed1,
        delta,
        resultFixed: res.fixed,
        resultGreg: res.greg,
        resultEth: res.eth,
        startGreg: gregorianFromFixed(fixed1),
        startEth: ethiopicFromFixed(fixed1),
      };
    }

    // Diff mode
    let fixed2: number;
    if (useGregorian2) {
      const [y, m, d] = gregDate2.split("-").map(Number);
      if (!y || !m || !d) return null;
      fixed2 = fixedFromGregorian(y, m, d);
    } else {
      const m = parseInt(ethMonth2, 10);
      const y = parseInt(ethYear2, 10);
      let d = parseInt(ethDay2, 10);
      if (!m || !y || !d) return null;
      d = Math.min(d, ethiopicMonthLength(y, m));
      fixed2 = fixedFromEthiopic(y, m, d);
    }

    const diff = daysBetweenFixed(fixed1, fixed2);
    return {
      mode: "diff" as const,
      fixed1,
      fixed2,
      diff,
      greg1: gregorianFromFixed(fixed1),
      eth1: ethiopicFromFixed(fixed1),
      greg2: gregorianFromFixed(fixed2),
      eth2: ethiopicFromFixed(fixed2),
    };
  }, [mode, useGregorian, gregDate, ethMonth, ethDay, ethYear, deltaDays, useGregorian2, gregDate2, ethMonth2, ethDay2, ethYear2]);

  function setToday(which: 1 | 2) {
    const today = new Date();
    const g = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
    const fixed = fixedFromGregorian(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const [ey, em, ed] = ethiopicFromFixed(fixed);
    if (which === 1) {
      setGregDate(g);
      setEthMonth(String(em));
      setEthDay(String(ed));
      setEthYear(String(ey));
    } else {
      setGregDate2(g);
      setEthMonth2(String(em));
      setEthDay2(String(ed));
      setEthYear2(String(ey));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-gold" />
          Date Calculator
        </CardTitle>
        <CardDescription>
          Add or subtract days from any date, or find the number of days between two dates.
        </CardDescription>
      </CardHeader>

      {/* Mode switcher */}
      <div className="mb-4 flex gap-2">
        <Button
          variant={mode === "add" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMode("add")}
          className="flex-1"
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add / Subtract Days
        </Button>
        <Button
          variant={mode === "diff" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMode("diff")}
          className="flex-1"
        >
          <Minus className="mr-1 h-3.5 w-3.5" /> Days Between
        </Button>
      </div>

      {/* Date 1 */}
      <div className="mb-4 rounded-xl border border-ink/8 bg-black/15 p-3">
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wide text-ink-muted">
            {mode === "add" ? "Start date" : "First date"}
          </Label>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => setUseGregorian(!useGregorian)}>
              {useGregorian ? "Switch to Ethiopian" : "Switch to Gregorian"}
            </Button>
            <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => setToday(1)}>
              Today
            </Button>
          </div>
        </div>

        {useGregorian ? (
          <Input type="date" value={gregDate} onChange={(e) => setGregDate(e.target.value)} />
        ) : (
          <div className="grid grid-cols-[1.3fr_1fr_0.9fr] gap-2">
            <Select value={ethMonth} onValueChange={setEthMonth}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ETH_MONTHS.map((mo, i) => (
                  <SelectItem key={mo.en} value={String(i + 1)}>{mo.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" min={1} max={maxDay} value={ethDay} onChange={(e) => setEthDay(e.target.value)} />
            <Input type="number" min={1} value={ethYear} onChange={(e) => setEthYear(e.target.value)} />
          </div>
        )}
      </div>

      {/* Mode-specific inputs */}
      {mode === "add" ? (
        <div className="mb-4">
          <Label className="text-xs uppercase tracking-wide text-ink-muted">Days to add (negative to subtract)</Label>
          <div className="mt-1 flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeltaDays(String((parseInt(deltaDays, 10) || 0) - 1))}>−</Button>
            <Input
              type="number"
              value={deltaDays}
              onChange={(e) => setDeltaDays(e.target.value)}
              className="text-center font-mono"
            />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeltaDays(String((parseInt(deltaDays, 10) || 0) + 1))}>+</Button>
          </div>
          <div className="mt-1.5 flex gap-1.5">
            {[7, 30, 55, 90, 180, 365].map((n) => (
              <button
                key={n}
                onClick={() => setDeltaDays(String(n))}
                className="rounded-md border border-ink/10 px-2 py-0.5 font-mono text-[10px] text-ink-muted transition-colors hover:border-gold hover:text-gold"
              >
                +{n}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-ink/8 bg-black/15 p-3">
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wide text-ink-muted">Second date</Label>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => setUseGregorian2(!useGregorian2)}>
                {useGregorian2 ? "Switch to Ethiopian" : "Switch to Gregorian"}
              </Button>
              <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => setToday(2)}>
                Today
              </Button>
            </div>
          </div>
          {useGregorian2 ? (
            <Input type="date" value={gregDate2} onChange={(e) => setGregDate2(e.target.value)} />
          ) : (
            <div className="grid grid-cols-[1.3fr_1fr_0.9fr] gap-2">
              <Select value={ethMonth2} onValueChange={setEthMonth2}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ETH_MONTHS.map((mo, i) => (
                    <SelectItem key={mo.en} value={String(i + 1)}>{mo.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="number" min={1} max={maxDay2} value={ethDay2} onChange={(e) => setEthDay2(e.target.value)} />
              <Input type="number" min={1} value={ethYear2} onChange={(e) => setEthYear2(e.target.value)} />
            </div>
          )}
        </div>
      )}

      {/* Result */}
      <div className="border-t border-ink/10 pt-4">
        {!result && <p className="text-ink-muted">Enter valid dates to see the result.</p>}

        {result && result.mode === "add" && (
          <>
            <p className="mb-1.5 text-xs uppercase tracking-wide text-ink-muted">
              {result.delta >= 0 ? "Date after" : "Date before"} {Math.abs(result.delta)} day{Math.abs(result.delta) === 1 ? "" : "s"}
            </p>
            <p className="m-0 mb-1 font-display text-[clamp(22px,5vw,28px)] font-semibold">
              {formatGregorian(result.resultGreg)}
            </p>
            <p className="mb-0.5 font-geez text-[14px] text-gold">
              {formatEthiopicGeez(result.resultEth)}
            </p>
            <p className="font-mono text-[12px] text-ink-muted">
              {dayOfWeek(result.resultFixed)} · {formatEthiopic(result.resultEth)}
            </p>

            <div className="mt-3 flex items-center gap-2 text-ink-dim">
              <span className="font-mono text-[11px]">{formatGregorian(result.startGreg)}</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-mono text-[11px]">{formatGregorian(result.resultGreg)}</span>
            </div>
          </>
        )}

        {result && result.mode === "diff" && (
          <>
            <p className="mb-1.5 text-xs uppercase tracking-wide text-ink-muted">Days between</p>
            <p className="m-0 mb-1 font-display text-[clamp(26px,6vw,32px)] font-semibold">
              {result.diff.toLocaleString("en-US")}
              <span className="ml-1.5 text-[16px] font-normal text-ink-muted">day{result.diff === 1 ? "" : "s"}</span>
            </p>

            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-2 rounded-lg border border-ink/8 bg-black/10 p-2.5">
                <Badge variant="outline" className="mt-0.5 font-mono text-[10px]">A</Badge>
                <div>
                  <p className="font-display text-[14px] font-semibold">{formatGregorian(result.greg1)}</p>
                  <p className="font-geez text-[12px] text-gold">{formatEthiopicGeez(result.eth1)}</p>
                  <p className="font-mono text-[11px] text-ink-dim">{dayOfWeek(result.fixed1)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-ink/8 bg-black/10 p-2.5">
                <Badge variant="outline" className="mt-0.5 font-mono text-[10px]">B</Badge>
                <div>
                  <p className="font-display text-[14px] font-semibold">{formatGregorian(result.greg2)}</p>
                  <p className="font-geez text-[12px] text-gold">{formatEthiopicGeez(result.eth2)}</p>
                  <p className="font-mono text-[11px] text-ink-dim">{dayOfWeek(result.fixed2)}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}