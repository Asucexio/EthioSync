"use client";

import { useEffect, useState } from "react";
import { partsInZone, ADDIS_ZONE } from "@/lib/timezones";
import { fixedFromGregorian, ethiopicFromFixed, dayOfWeek, ETH_MONTHS, GREG_MONTHS } from "@/lib/calendar";
import { arabicToGeez } from "@/lib/geez-numerals";

const CLOCK_NUMERALS = ["፩", "፪", "፫", "፬", "፭", "፮", "፯", "፰", "፱", "፲", "፲፩", "፲፪"];
const CX = 100;
const CY = 100;
const R = 92;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function TickMarks() {
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
    const isHour = i % 5 === 0;
    const rOuter = R - 2;
    const rInner = isHour ? R - 9 : R - 5;
    const x1 = CX + rOuter * Math.cos(angle);
    const y1 = CY + rOuter * Math.sin(angle);
    const x2 = CX + rInner * Math.cos(angle);
    const y2 = CY + rInner * Math.sin(angle);
    ticks.push(
      <line
        key={i}
        x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)}
        stroke="var(--color-ink)" strokeOpacity={0.22} strokeWidth={isHour ? 1.8 : 1}
      />
    );
  }
  return <>{ticks}</>;
}

function NumeralRing() {
  return (
    <>
      {CLOCK_NUMERALS.map((sym, idx) => {
        const h = idx + 1;
        const angle = (h / 12) * 2 * Math.PI - Math.PI / 2;
        const rNum = R - 22;
        const x = CX + rNum * Math.cos(angle);
        const y = CY + rNum * Math.sin(angle);
        return (
          <text
            key={h}
            x={x.toFixed(1)} y={y.toFixed(1)}
            fontFamily="var(--font-geez)" fontSize={17}
            fill="var(--color-ink-muted)" textAnchor="middle" dominantBaseline="central"
          >
            {sym}
          </text>
        );
      })}
    </>
  );
}

function Hand({ lenRatio, angleDeg, className }: { lenRatio: number; angleDeg: number; className: string }) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const len = R * lenRatio;
  const x2 = CX + len * Math.cos(rad);
  const y2 = CY + len * Math.sin(rad);
  return <line x1={CX} y1={CY} x2={x2.toFixed(1)} y2={y2.toFixed(1)} className={className} strokeLinecap="round" />;
}

export function HeroClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Client-only: rendering starts as null (matching SSR) so the clock's
    // first paint never mismatches the server, then ticks once mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return (
      <header className="relative px-0 pb-7 pt-12 text-center">
        <div className="mx-auto h-52 w-52" />
      </header>
    );
  }

  const p = partsInZone(ADDIS_ZONE, now);
  const fixed = fixedFromGregorian(p.year, p.month, p.day);
  const [ey, em, ed] = ethiopicFromFixed(fixed);
  const monthInfo = ETH_MONTHS[em - 1];

  let habeshaH = (((p.hour - 6) % 12) + 12) % 12;
  if (habeshaH === 0) habeshaH = 12;

  const hourAngle = (((p.hour % 12) + p.minute / 60) / 12) * 360;
  const minAngle = ((p.minute + p.second / 60) / 60) * 360;
  const secAngle = (p.second / 60) * 360;

  return (
    <header className="relative px-0 pb-7 pt-12 text-center">
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-[340px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(205,162,72,0.10),transparent_70%)]" />

      <p className="relative mb-5.5 font-mono text-[11.5px] uppercase tracking-[0.18em] text-ink-muted">
        Addis Ababa &nbsp;·&nbsp; <b className="font-semibold text-gold">East Africa Time</b> &nbsp;·&nbsp; UTC+3, no DST
      </p>

      <div className="relative mx-auto mb-5.5 h-52 w-52">
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--color-ink)" strokeOpacity={0.12} strokeWidth={1.5} />
          <TickMarks />
          <NumeralRing />
          <Hand lenRatio={0.5} angleDeg={hourAngle} className="stroke-ink" />
          <Hand lenRatio={0.74} angleDeg={minAngle} className="stroke-ink" />
          <Hand lenRatio={0.8} angleDeg={secAngle} className="stroke-red" />
          <circle cx={CX} cy={CY} r={3.4} fill="var(--color-gold)" />
        </svg>
      </div>

      <p className="m-0 font-display text-[clamp(40px,9vw,56px)] font-semibold tabular-nums">
        {pad2(p.hour)}:{pad2(p.minute)}
        <span className="ml-1.5 font-mono text-[0.55em] font-normal text-ink-dim">:{pad2(p.second)}</span>
      </p>

      <p className="mt-3.5 text-[14.5px] text-ink-muted">
        <span className="font-geez text-gold">
          {monthInfo.ge} {arabicToGeez(ed)} {arabicToGeez(ey)}
        </span>
        &nbsp;·&nbsp;
        <strong className="font-semibold text-ink">{monthInfo.en} {ed}, {ey}</strong>
      </p>
      <p className="mt-0.5 text-[14.5px] text-ink-muted">
        {dayOfWeek(fixed)}, {GREG_MONTHS[p.month - 1]} {p.day}, {p.year} (Gregorian)
      </p>
      <p className="mt-2 font-mono text-xs text-ink-dim">
        Traditional reckoning: {habeshaH}:{pad2(p.minute)} — day begins at dawn
      </p>
    </header>
  );
}
