"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  getHolidaysForYear, getTodayStatus,
  type Holiday, type HolidayType,
} from "@/lib/holidays";
import { fixedFromGregorian, ethiopicFromFixed, GREG_MONTHS, ETH_MONTHS } from "@/lib/calendar";
import { ChevronLeft, ChevronRight, Calendar, Flame, Star } from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayFixed(): number {
  const d = new Date();
  return fixedFromGregorian(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function gregStr(y: number, m: number, d: number) {
  return `${GREG_MONTHS[m - 1]} ${d}, ${y}`;
}
function gregShort(m: number, d: number) {
  return `${GREG_MONTHS[m - 1].slice(0, 3)} ${d}`;
}
function ethStr(em: number, ed: number, ey: number) {
  return `${ETH_MONTHS[em - 1].en} ${ed}, ${ey}`;
}

// ---------------------------------------------------------------------------
// Colour scheme per type
// ---------------------------------------------------------------------------
const TYPE_STYLES: Record<HolidayType, {
  bar: string; bg: string; badge: string; badgeText: string; icon: React.ReactNode;
}> = {
  feast: {
    bar: "bg-gold",
    bg: "hover:bg-gold/8",
    badge: "bg-gold/15 text-gold border-gold/30",
    badgeText: "Feast",
    icon: <Star className="h-3.5 w-3.5" />,
  },
  fast: {
    bar: "bg-red",
    bg: "hover:bg-red/8",
    badge: "bg-red/15 text-red border-red/30",
    badgeText: "Fast",
    icon: <Flame className="h-3.5 w-3.5" />,
  },
  national: {
    bar: "bg-green",
    bg: "hover:bg-green/8",
    badge: "bg-green/15 text-green border-green/30",
    badgeText: "Public Holiday",
    icon: <Calendar className="h-3.5 w-3.5" />,
  },
};

// ---------------------------------------------------------------------------
// Single holiday row
// ---------------------------------------------------------------------------
function HolidayRow({ h, today }: { h: Holiday; today: number }) {
  const [expanded, setExpanded] = useState(false);
  const s = TYPE_STYLES[h.type];
  const isActive = h.isRange
    ? today >= h.gFixed && today <= (h.gFixedEnd ?? h.gFixed)
    : today === h.gFixed;
  const isPast = (h.gFixedEnd ?? h.gFixed) < today;

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className={cn(
        "w-full text-left flex gap-3 rounded-xl px-3 py-3 transition-colors border border-transparent",
        s.bg,
        isActive && "border-ink/15 bg-gold/5",
        isPast && "opacity-50",
      )}
    >
      {/* colour bar */}
      <div className={cn("mt-1 w-1 flex-none rounded-full self-stretch min-h-[2rem]", s.bar)} />

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
            s.badge
          )}>
            {s.icon}{s.badgeText}
          </span>
          {isActive && (
            <span className="inline-block rounded-full bg-gold px-2 py-0.5 font-mono text-[10px] font-bold text-[#1c150d]">
              TODAY
            </span>
          )}
          {h.isRange && h.days && !isActive && (
            <span className="font-mono text-[11px] text-ink-dim">{h.days} days</span>
          )}
        </div>

        <p className="font-display text-[16px] font-semibold leading-snug">
          {h.name}
          {" "}
          <span className="font-geez text-[15px] font-normal text-ink-muted">{h.nameAm}</span>
        </p>

        <p className="mt-0.5 font-mono text-[12px] text-ink-muted">
          {h.isRange
            ? `${gregShort(h.gMonth, h.gDay)}–${gregShort(h.gMonthEnd!, h.gDayEnd!)} ${h.gYear}`
            : `${h.weekday}, ${gregStr(h.gYear, h.gMonth, h.gDay)}`
          }
          <span className="mx-1.5 text-ink-dim">·</span>
          <span className="text-gold/80">
            {h.isRange
              ? `${ETH_MONTHS[h.eMonth - 1].en} ${h.eDay}–${ETH_MONTHS[h.eMonthEnd! - 1].en} ${h.eDayEnd}, ${h.eYear}`
              : ethStr(h.eMonth, h.eDay, h.eYear)
            }
          </span>
        </p>

        {expanded && (
          <p className="mt-2 text-[13px] text-ink-muted leading-relaxed">{h.desc}</p>
        )}
      </div>

      <span className={cn(
        "mt-2 flex-none font-mono text-[11px] text-ink-dim transition-transform",
        expanded && "rotate-180"
      )}>▾</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Today's status banner
// ---------------------------------------------------------------------------
function TodayBanner({ active }: { active: Holiday[] }) {
  if (active.length === 0) return null;
  return (
    <div className="mb-5 rounded-xl border border-gold/25 bg-gold/8 px-4 py-3">
      <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-gold">
        Today
      </p>
      {active.map((h) => (
        <p key={h.name} className="font-display text-[15px] font-semibold leading-snug">
          {h.name} <span className="font-geez text-[14px] font-normal text-ink-muted">{h.nameAm}</span>
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function HolidayCalendar() {
  const now = useMemo(() => new Date(), []);
  const currentGregYear = now.getFullYear();
  const [gregYear, setGregYear] = useState(currentGregYear);

  const fixed = useMemo(() => todayFixed(), []);
  const holidays = useMemo(() => getHolidaysForYear(gregYear), [gregYear]);
  const todayActive = useMemo(() =>
    gregYear === currentGregYear ? getTodayStatus(fixed, holidays) : [],
    [fixed, holidays, gregYear, currentGregYear]
  );

  // Ethiopian year label: the year that contains January of the selected Gregorian year
  const [ethY] = ethiopicFromFixed(fixedFromGregorian(gregYear, 1, 1));

  // Group holidays by rough season / Ethiopian month block
  const groups = useMemo(() => {
    const grouped: { label: string; items: Holiday[] }[] = [];
    let cur: Holiday[] = [];
    let curMonth = -1;
    for (const h of holidays) {
      if (h.gMonth !== curMonth) {
        if (cur.length) grouped.push({ label: `${GREG_MONTHS[curMonth - 1]} ${h.gYear}`, items: cur });
        cur = [h];
        curMonth = h.gMonth;
      } else {
        cur.push(h);
      }
    }
    if (cur.length) grouped.push({ label: `${GREG_MONTHS[curMonth - 1]} ${cur[0].gYear}`, items: cur });
    return grouped;
  }, [holidays]);

  return (
    <div>
      {/* Year picker */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          onClick={() => setGregYear((y) => y - 1)}
          className="rounded-full border border-ink/15 p-2 text-ink-muted transition-colors hover:border-gold hover:text-gold"
          aria-label="Previous year"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-center">
          <p className="font-display text-xl font-semibold">{gregYear}</p>
          <p className="font-mono text-[11.5px] text-ink-muted">
            Ethiopian year {ethY}–{ethY + 1}
          </p>
        </div>

        <button
          onClick={() => setGregYear((y) => y + 1)}
          className="rounded-full border border-ink/15 p-2 text-ink-muted transition-colors hover:border-gold hover:text-gold"
          aria-label="Next year"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <TodayBanner active={todayActive} />

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-3">
        {(["feast","fast","national"] as HolidayType[]).map((type) => (
          <span key={type} className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px]",
            TYPE_STYLES[type].badge
          )}>
            {TYPE_STYLES[type].icon}
            {TYPE_STYLES[type].badgeText}
          </span>
        ))}
        <span className="ml-auto font-mono text-[11px] text-ink-dim">tap to expand</span>
      </div>

      {/* Timeline */}
      <Card className="divide-y divide-ink/8 p-0 overflow-hidden">
        {groups.map(({ label, items }) => (
          <div key={label}>
            <p className="px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-ink-dim bg-black/10">
              {label}
            </p>
            <CardContent className="px-2 py-1 space-y-0.5">
              {items.map((h) => (
                <HolidayRow key={`${h.name}-${h.gFixed}`} h={h} today={fixed} />
              ))}
            </CardContent>
          </div>
        ))}
      </Card>

      <p className="mt-4 text-center font-mono text-[11.5px] text-ink-dim">
        Movable feasts computed from Orthodox Easter (Julian computus → Gregorian).
        <br />Wed &amp; Fri fasts observed year-round except the 50 days after Fasika.
      </p>
    </div>
  );
}
