"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  fixedFromGregorian, gregorianFromFixed, fixedFromEthiopic, ethiopicFromFixed,
  ethiopicMonthLength, dayOfWeek, ETH_MONTHS, GREG_MONTHS,
} from "@/lib/calendar";
import { arabicToGeez } from "@/lib/geez-numerals";

type AgeResult =
  | { ok: false; error: string }
  | {
      ok: true;
      years: number;
      months: number;
      days: number;
      birthdayLabel: string;
      birthdayGeez: string | null;
      weekday: string;
      daysUntilBirthday: number;
      turningYear: number;
      nextBirthdayGregorian: string;
      totalDaysLived: number;
    };

export function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("");
  const [todayFixed, setTodayFixed] = useState<number | null>(null);

  useEffect(() => {
    // Client-only: avoids an SSR/client "today" mismatch.
    const today = new Date();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTodayFixed(fixedFromGregorian(today.getFullYear(), today.getMonth() + 1, today.getDate()));
  }, []);

  const result = useMemo<AgeResult | null>(() => {
    if (!birthDate || todayFixed === null) return null;
    const [by, bm, bd] = birthDate.split("-").map(Number);
    if (!by || !bm || !bd) return null;

    const birthFixed = fixedFromGregorian(by, bm, bd);
    if (birthFixed > todayFixed) {
      return { ok: false, error: "That birth date is in the future." };
    }

    const [beY, beM, beD] = ethiopicFromFixed(birthFixed);

    // Age in Ethiopian calendar terms: years, months, days since the
    // Ethiopian birth date, using the same borrow-from-previous-unit
    // approach as ordinary Gregorian age math, applied to the 13-month
    // Ethiopian calendar.
    const [curY, curM, curD] = ethiopicFromFixed(todayFixed);
    let years = curY - beY;
    let months = curM - beM;
    let days = curD - beD;

    if (days < 0) {
      const prevMonth = curM === 1 ? 13 : curM - 1;
      const prevMonthYear = curM === 1 ? curY - 1 : curY;
      days += ethiopicMonthLength(prevMonthYear, prevMonth);
      months -= 1;
    }
    if (months < 0) {
      months += 13;
      years -= 1;
    }

    // Next Ethiopian birthday (handles Pagume 6 on non-leap years by
    // clamping to the month's actual length).
    let nextBirthdayYear = curY;
    let bMonthLen = ethiopicMonthLength(nextBirthdayYear, beM);
    let nextBirthdayFixed = fixedFromEthiopic(nextBirthdayYear, beM, Math.min(beD, bMonthLen));
    if (nextBirthdayFixed <= todayFixed) {
      nextBirthdayYear += 1;
      bMonthLen = ethiopicMonthLength(nextBirthdayYear, beM);
      nextBirthdayFixed = fixedFromEthiopic(nextBirthdayYear, beM, Math.min(beD, bMonthLen));
    }
    const daysUntilBirthday = nextBirthdayFixed - todayFixed;
    const [nby, nbm, nbd] = gregorianFromFixed(nextBirthdayFixed);

    const birthMonth = ETH_MONTHS[beM - 1];
    const totalDaysLived = todayFixed - birthFixed;

    return {
      ok: true,
      years, months, days,
      birthdayLabel: `${birthMonth.en} ${beD}, ${beY}`,
      birthdayGeez: `${birthMonth.ge} ${arabicToGeez(beD)} ${arabicToGeez(beY)}`,
      weekday: dayOfWeek(birthFixed),
      daysUntilBirthday,
      turningYear: nextBirthdayYear,
      nextBirthdayGregorian: `${GREG_MONTHS[nbm - 1]} ${nbd}, ${nby}`,
      totalDaysLived,
    };
  }, [birthDate, todayFixed]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ethiopian Age Calculator</CardTitle>
        <CardDescription>
          Enter a birth date to see age and next birthday reckoned by the Ethiopian calendar.
        </CardDescription>
      </CardHeader>

      <div className="mb-4">
        <Label htmlFor="birth-date">Birth date (Gregorian)</Label>
        <Input
          id="birth-date"
          type="date"
          value={birthDate}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </div>

      <div className="border-t border-ink/10 pt-4.5">
        {!result && (
          <p className="m-0 text-[15px] text-ink-muted">Pick a date above to calculate age.</p>
        )}
        {result && !result.ok && (
          <p className="m-0 text-[15px] text-red">{result.error}</p>
        )}
        {result && result.ok && (
          <>
            <p className="mb-1.5 text-xs uppercase tracking-wide text-ink-muted">Age</p>
            <p className="m-0 mb-1 break-words font-display text-[clamp(26px,6vw,32px)] font-semibold">
              {result.years} <span className="text-[16px] font-normal text-ink-muted">yrs</span>{" "}
              {result.months} <span className="text-[16px] font-normal text-ink-muted">mo</span>{" "}
              {result.days} <span className="text-[16px] font-normal text-ink-muted">days</span>
            </p>
            <p className="font-mono text-[13px] text-ink-muted">
              {result.totalDaysLived.toLocaleString()} days lived
            </p>

            <div className="mt-4.5 border-t border-ink/10 pt-4.5">
              <p className="mb-1.5 text-xs uppercase tracking-wide text-ink-muted">Ethiopian birth date</p>
              <p className="m-0 mb-1 font-display text-[19px] font-semibold">{result.birthdayLabel}</p>
              <p className="font-geez text-[13px] text-gold">{result.birthdayGeez}</p>
              <p className="font-mono text-[13px] text-ink-muted">{result.weekday}</p>
            </div>

            <div className="mt-4.5 border-t border-ink/10 pt-4.5">
              <p className="mb-1.5 text-xs uppercase tracking-wide text-ink-muted">
                Next Ethiopian birthday
                {result.daysUntilBirthday === 0 && <Badge>today</Badge>}
              </p>
              <p className="m-0 mb-1 font-display text-[19px] font-semibold">
                Turning {result.turningYear}
              </p>
              <p className="font-mono text-[13px] text-ink-muted">
                {result.daysUntilBirthday === 0
                  ? "🎉 Happy birthday!"
                  : `${result.daysUntilBirthday.toLocaleString()} day${result.daysUntilBirthday === 1 ? "" : "s"} away · ${result.nextBirthdayGregorian}`}
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
