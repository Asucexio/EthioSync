"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem,
} from "@/components/ui/select";
import {
  ZONES, ADDIS_ZONE, partsInZone, zoneWallClockToInstant, offsetLabel, dayDiffBetween,
} from "@/lib/timezones";
import { dayOfWeek, fixedFromGregorian, GREG_MONTHS } from "@/lib/calendar";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatForInput(p: { year: number; month: number; day: number; hour: number; minute: number }) {
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}T${pad2(p.hour)}:${pad2(p.minute)}`;
}

function dateLabelFor(y: number, m: number, d: number) {
  return `${dayOfWeek(fixedFromGregorian(y, m, d))}, ${GREG_MONTHS[m - 1]} ${d}, ${y}`;
}

type Direction = "toAddis" | "fromAddis";

export function WorldTimeConverter() {
  const [zone, setZone] = useState(ADDIS_ZONE);
  const [direction, setDirection] = useState<Direction>("toAddis");
  const [dateTime, setDateTime] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Client-only: the browser's timezone isn't knowable during SSR, so we
    // detect it once mounted and seed the form with "now" in that zone.
    const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const allZones = ZONES.flatMap(([, list]) => list.map(([, tz]) => tz));
    const initialZone = allZones.includes(browserZone) ? browserZone : ADDIS_ZONE;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setZone(initialZone);
    setDateTime(formatForInput(partsInZone(initialZone, new Date())));
    setReady(true);
  }, []);

  const fromZone = direction === "toAddis" ? zone : ADDIS_ZONE;
  const toZone = direction === "toAddis" ? ADDIS_ZONE : zone;

  const result = useMemo(() => {
    if (!ready || !dateTime) return null;
    const [datePart, timePart] = dateTime.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    const [h, mi] = (timePart || "00:00").split(":").map(Number);
    if (!y || !m || !d) return null;

    const instant = zoneWallClockToInstant(fromZone, y, m, d, h || 0, mi || 0);
    const resultParts = partsInZone(toZone, instant);
    const dayDiff = dayDiffBetween(resultParts, { year: y, month: m, day: d });

    return {
      main: `${pad2(resultParts.hour)}:${pad2(resultParts.minute)} — ${dateLabelFor(resultParts.year, resultParts.month, resultParts.day)}`,
      fromOffset: offsetLabel(fromZone, instant),
      toOffset: offsetLabel(toZone, instant),
      dayDiff,
    };
  }, [ready, dateTime, fromZone, toZone]);

  function useNow() {
    setDateTime(formatForInput(partsInZone(fromZone, new Date())));
  }

  function swap() {
    const next = direction === "toAddis" ? "fromAddis" : "toAddis";
    setDirection(next);
    const newFromZone = next === "toAddis" ? zone : ADDIS_ZONE;
    setDateTime(formatForInput(partsInZone(newFromZone, new Date())));
  }

  const cityLabel = useMemo(() => {
    for (const [, list] of ZONES) {
      const found = list.find(([, tz]) => tz === zone);
      if (found) return found[0];
    }
    return zone;
  }, [zone]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{direction === "toAddis" ? "Any city → Addis Ababa" : "Addis Ababa → any city"}</CardTitle>
        <CardDescription>Pick a place and a moment there. See what time it is in Ethiopia.</CardDescription>
      </CardHeader>

      <div className="mb-4">
        <Label htmlFor="tz-select">{direction === "toAddis" ? "City or country" : "Convert to this city"}</Label>
        <Select value={zone} onValueChange={setZone}>
          <SelectTrigger id="tz-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ZONES.map(([group, list]) => (
              <SelectGroup key={group}>
                <SelectLabel>{group}</SelectLabel>
                {list.map(([label, tz]) => (
                  <SelectItem key={tz} value={tz}>{label}</SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4 flex items-end gap-3">
        <div className="flex-[2]">
          <Label htmlFor="tz-datetime">{direction === "toAddis" ? "Date & time there" : "Date & time in Addis Ababa"}</Label>
          <Input
            id="tz-datetime"
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="full" className="flex-1" onClick={useNow}>Use now</Button>
      </div>

      <Button variant="dashed" size="full" className="mb-4.5" onClick={swap}>
        ⇄ &nbsp;Convert the other direction
      </Button>

      <div className="border-t border-ink/10 pt-4.5">
        <p className="mb-1.5 text-xs uppercase tracking-wide text-ink-muted">
          {direction === "toAddis" ? "Time in Addis Ababa" : `Time in ${cityLabel}`}
        </p>
        <p id="tz-result-main" className="m-0 mb-1 break-words font-display text-[clamp(26px,6vw,32px)] font-semibold">
          {result ? result.main : "—"}
        </p>
        {result && (
          <p className="font-mono text-[13px] text-ink-muted">
            {result.fromOffset} → {result.toOffset}
            {result.dayDiff === 1 && <Badge>next day there</Badge>}
            {result.dayDiff === -1 && <Badge>previous day there</Badge>}
            {result.dayDiff !== 0 && result.dayDiff !== 1 && result.dayDiff !== -1 && (
              <Badge>{result.dayDiff > 0 ? "+" : ""}{result.dayDiff} days</Badge>
            )}
          </p>
        )}
      </div>
    </Card>
  );
}
