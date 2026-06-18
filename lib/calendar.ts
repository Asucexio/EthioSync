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
