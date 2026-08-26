/**
 * Fixed-date (Rata Die) calendar math, following Reingold & Dershowitz,
 * "Calendrical Calculations". The Ethiopian epoch and leap rule below were
 * verified against the calendar's documented month-start table and
 * cross-checked by independent weekday arithmetic.
 */

function div(a: number, b: number): number {
  return Math.floor(a / b);
}

const GREGORIAN_EPOCH = 1;

export function gregorianLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function fixedFromGregorian(year: number, month: number, day: number): number {
  let f =
    GREGORIAN_EPOCH -
    1 +
    365 * (year - 1) +
    div(year - 1, 4) -
    div(year - 1, 100) +
    div(year - 1, 400) +
    div(367 * month - 362, 12);
  if (month > 2) f += gregorianLeapYear(year) ? -1 : -2;
  return f + day;
}

function gregorianYearFromFixed(fixed: number): number {
  const d0 = fixed - GREGORIAN_EPOCH;
  const n400 = div(d0, 146097);
  const d1 = d0 % 146097;
  const n100 = div(d1, 36524);
  const d2 = d1 % 36524;
  const n4 = div(d2, 1461);
  const d3 = d2 % 1461;
  const n1 = div(d3, 365);
  const year = 400 * n400 + 100 * n100 + 4 * n4 + n1;
  return n100 === 4 || n1 === 4 ? year : year + 1;
}

export function gregorianFromFixed(fixed: number): [number, number, number] {
  const year = gregorianYearFromFixed(fixed);
  const priorDays = fixed - fixedFromGregorian(year, 1, 1);
  const correction = fixed < fixedFromGregorian(year, 3, 1) ? 0 : gregorianLeapYear(year) ? 1 : 2;
  const month = div(12 * (priorDays + correction) + 373, 367);
  const day = fixed - fixedFromGregorian(year, month, 1) + 1;
  return [year, month, day];
}

// Ethiopian (Ge'ez) calendar.
const ETHIOPIC_EPOCH = 2796;

export function ethiopicLeapYear(year: number): boolean {
  return year % 4 === 3;
}

export function fixedFromEthiopic(year: number, month: number, day: number): number {
  return ETHIOPIC_EPOCH - 1 + 365 * (year - 1) + div(year, 4) + 30 * (month - 1) + day;
}

function ethiopicYearFromFixed(fixed: number): number {
  return div(4 * (fixed - ETHIOPIC_EPOCH) + 1463, 1461);
}

export function ethiopicFromFixed(fixed: number): [number, number, number] {
  const year = ethiopicYearFromFixed(fixed);
  const month = div(fixed - fixedFromEthiopic(year, 1, 1), 30) + 1;
  const day = fixed - fixedFromEthiopic(year, month, 1) + 1;
  return [year, month, day];
}

export function ethiopicMonthLength(year: number, month: number): number {
  if (month <= 12) return 30;
  return ethiopicLeapYear(year) ? 6 : 5;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function dayOfWeek(fixed: number): string {
  return WEEKDAYS[((fixed % 7) + 7) % 7];
}

export const ETH_MONTHS = [
  { en: "Meskerem", ge: "መስከረም" },
  { en: "Tikimt", ge: "ጥቅምት" },
  { en: "Hidar", ge: "ኅዳር" },
  { en: "Tahsas", ge: "ታኅሣሥ" },
  { en: "Tir", ge: "ጥር" },
  { en: "Yekatit", ge: "የካቲት" },
  { en: "Megabit", ge: "መጋቢት" },
  { en: "Miazia", ge: "ሚያዝያ" },
  { en: "Ginbot", ge: "ግንቦት" },
  { en: "Sene", ge: "ሰኔ" },
  { en: "Hamle", ge: "ሐምሌ" },
  { en: "Nehase", ge: "ነሐሴ" },
  { en: "Pagume", ge: "ጳጉሜ" },
] as const;

export const GREG_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ---------------------------------------------------------------------------
// Month-grid helpers for the Ethiopian calendar visualiser
// ---------------------------------------------------------------------------

export interface GridDay {
  ethYear: number;
  ethMonth: number;
  ethDay: number;
  gregYear: number;
  gregMonth: number;
  gregDay: number;
  fixed: number;
  isToday: boolean;
  isPadume: boolean;   // part of the 13th month (Pagume)
  isOtherMonth: boolean; // belongs to prev/next Ethiopian month when padding grid
}

/** Build a 7-column (Sun→Sat) grid for an Ethiopian month.
 *  `todayFixed` is optional; pass it to highlight the current day. */
export function buildEthiopianMonthGrid(
  year: number,
  month: number,
  todayFixed?: number
): GridDay[] {
  const monthStart = fixedFromEthiopic(year, month, 1);
  const monthLen = ethiopicMonthLength(year, month);
  const startWeekday = ((monthStart % 7) + 7) % 7; // 0 = Sunday

  const days: GridDay[] = [];

  // Pad leading days from previous month
  if (startWeekday > 0) {
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth < 1) {
      prevMonth = 13;
      prevYear -= 1;
    }
    const prevLen = ethiopicMonthLength(prevYear, prevMonth);
    const prevStart = monthStart - startWeekday;
    for (let i = 0; i < startWeekday; i++) {
      const [gy, gm, gd] = gregorianFromFixed(prevStart + i);
      days.push({
        ethYear: prevYear, ethMonth: prevMonth, ethDay: prevLen - startWeekday + 1 + i,
        gregYear: gy, gregMonth: gm, gregDay: gd,
        fixed: prevStart + i,
        isToday: todayFixed === prevStart + i,
        isPadume: prevMonth === 13,
        isOtherMonth: true,
      });
    }
  }

  // Current month
  for (let d = 1; d <= monthLen; d++) {
    const fixed = monthStart + d - 1;
    const [gy, gm, gd] = gregorianFromFixed(fixed);
    days.push({
      ethYear: year, ethMonth: month, ethDay: d,
      gregYear: gy, gregMonth: gm, gregDay: gd,
      fixed,
      isToday: todayFixed === fixed,
      isPadume: month === 13,
      isOtherMonth: false,
    });
  }

  // Pad trailing days to complete the last week
  const remaining = (7 - (days.length % 7)) % 7;
  if (remaining > 0) {
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 13) {
      nextMonth = 1;
      nextYear += 1;
    }
    const nextStart = monthStart + monthLen;
    for (let i = 0; i < remaining; i++) {
      const fixed = nextStart + i;
      const [gy, gm, gd] = gregorianFromFixed(fixed);
      days.push({
        ethYear: nextYear, ethMonth: nextMonth, ethDay: i + 1,
        gregYear: gy, gregMonth: gm, gregDay: gd,
        fixed,
        isToday: todayFixed === fixed,
        isPadume: nextMonth === 13,
        isOtherMonth: true,
      });
    }
  }

  return days;
}

export const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];