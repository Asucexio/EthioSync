import { fixedFromGregorian } from "./calendar";

export const ADDIS_ZONE = "Africa/Addis_Ababa";

export type ZoneGroup = [string, [string, string][]];

export const ZONES: ZoneGroup[] = [
  ["Africa", [
    ["Ethiopia — Addis Ababa", "Africa/Addis_Ababa"], ["Eritrea — Asmara", "Africa/Asmara"],
    ["Djibouti", "Africa/Djibouti"], ["Somalia — Mogadishu", "Africa/Mogadishu"],
    ["Sudan — Khartoum", "Africa/Khartoum"], ["South Sudan — Juba", "Africa/Juba"],
    ["Kenya — Nairobi", "Africa/Nairobi"], ["Uganda — Kampala", "Africa/Kampala"],
    ["Tanzania — Dar es Salaam", "Africa/Dar_es_Salaam"], ["Rwanda — Kigali", "Africa/Kigali"],
    ["Egypt — Cairo", "Africa/Cairo"], ["Morocco — Casablanca", "Africa/Casablanca"],
    ["Algeria — Algiers", "Africa/Algiers"], ["Nigeria — Lagos", "Africa/Lagos"],
    ["Ghana — Accra", "Africa/Accra"], ["South Africa — Johannesburg", "Africa/Johannesburg"],
    ["Zambia — Lusaka", "Africa/Lusaka"], ["Zimbabwe — Harare", "Africa/Harare"],
  ]],
  ["Americas", [
    ["USA — New York (Eastern)", "America/New_York"], ["USA — Chicago (Central)", "America/Chicago"],
    ["USA — Denver (Mountain)", "America/Denver"], ["USA — Los Angeles (Pacific)", "America/Los_Angeles"],
    ["USA — Anchorage (Alaska)", "America/Anchorage"], ["USA — Honolulu (Hawaii)", "Pacific/Honolulu"],
    ["Canada — Toronto", "America/Toronto"], ["Canada — Vancouver", "America/Vancouver"],
    ["Canada — Winnipeg", "America/Winnipeg"], ["Canada — Halifax", "America/Halifax"],
    ["Mexico — Mexico City", "America/Mexico_City"], ["Brazil — São Paulo", "America/Sao_Paulo"],
    ["Argentina — Buenos Aires", "America/Argentina/Buenos_Aires"], ["Chile — Santiago", "America/Santiago"],
    ["Colombia — Bogotá", "America/Bogota"],
  ]],
  ["Asia", [
    ["UAE — Dubai", "Asia/Dubai"], ["Saudi Arabia — Riyadh", "Asia/Riyadh"],
    ["Qatar — Doha", "Asia/Qatar"], ["Kuwait — Kuwait City", "Asia/Kuwait"],
    ["Oman — Muscat", "Asia/Muscat"], ["Yemen — Sanaa", "Asia/Aden"],
    ["Israel — Jerusalem", "Asia/Jerusalem"], ["Jordan — Amman", "Asia/Amman"],
    ["Lebanon — Beirut", "Asia/Beirut"], ["Iraq — Baghdad", "Asia/Baghdad"],
    ["Iran — Tehran", "Asia/Tehran"], ["Turkey — Istanbul", "Europe/Istanbul"],
    ["India — Delhi / Mumbai", "Asia/Kolkata"], ["Pakistan — Karachi", "Asia/Karachi"],
    ["Bangladesh — Dhaka", "Asia/Dhaka"], ["Sri Lanka — Colombo", "Asia/Colombo"],
    ["Afghanistan — Kabul", "Asia/Kabul"], ["China — Beijing / Shanghai", "Asia/Shanghai"],
    ["Hong Kong", "Asia/Hong_Kong"], ["Taiwan — Taipei", "Asia/Taipei"],
    ["Japan — Tokyo", "Asia/Tokyo"], ["South Korea — Seoul", "Asia/Seoul"],
    ["Singapore", "Asia/Singapore"], ["Malaysia — Kuala Lumpur", "Asia/Kuala_Lumpur"],
    ["Indonesia — Jakarta", "Asia/Jakarta"], ["Philippines — Manila", "Asia/Manila"],
    ["Thailand — Bangkok", "Asia/Bangkok"], ["Vietnam — Hanoi", "Asia/Ho_Chi_Minh"],
  ]],
  ["Europe", [
    ["UK — London", "Europe/London"], ["Ireland — Dublin", "Europe/Dublin"],
    ["Portugal — Lisbon", "Europe/Lisbon"], ["Spain — Madrid", "Europe/Madrid"],
    ["France — Paris", "Europe/Paris"], ["Netherlands — Amsterdam", "Europe/Amsterdam"],
    ["Belgium — Brussels", "Europe/Brussels"], ["Germany — Berlin", "Europe/Berlin"],
    ["Switzerland — Zürich", "Europe/Zurich"], ["Italy — Rome", "Europe/Rome"],
    ["Austria — Vienna", "Europe/Vienna"], ["Czechia — Prague", "Europe/Prague"],
    ["Poland — Warsaw", "Europe/Warsaw"], ["Sweden — Stockholm", "Europe/Stockholm"],
    ["Norway — Oslo", "Europe/Oslo"], ["Denmark — Copenhagen", "Europe/Copenhagen"],
    ["Finland — Helsinki", "Europe/Helsinki"], ["Greece — Athens", "Europe/Athens"],
    ["Romania — Bucharest", "Europe/Bucharest"], ["Ukraine — Kyiv", "Europe/Kyiv"],
    ["Russia — Moscow", "Europe/Moscow"], ["Russia — Yekaterinburg", "Asia/Yekaterinburg"],
    ["Russia — Novosibirsk", "Asia/Novosibirsk"], ["Russia — Vladivostok", "Asia/Vladivostok"],
  ]],
  ["Oceania", [
    ["Australia — Sydney", "Australia/Sydney"], ["Australia — Adelaide", "Australia/Adelaide"],
    ["Australia — Perth", "Australia/Perth"], ["New Zealand — Auckland", "Pacific/Auckland"],
  ]],
  ["Other", [["UTC", "UTC"]]],
];

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: string;
}

export function getZoneOffsetMinutes(zone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts: Record<string, number> = {};
  dtf.formatToParts(date).forEach((p) => {
    if (p.type !== "literal") parts[p.type] = parseInt(p.value, 10);
  });
  const asUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return Math.round((asUTC - date.getTime()) / 60000);
}

/** Given a wall-clock Y/M/D h:m in `zone`, return the absolute instant. */
export function zoneWallClockToInstant(
  zone: string, y: number, m: number, d: number, h: number, mi: number
): Date {
  const guess = Date.UTC(y, m - 1, d, h, mi, 0);
  let offset = getZoneOffsetMinutes(zone, new Date(guess));
  let instant = guess - offset * 60000;
  offset = getZoneOffsetMinutes(zone, new Date(instant));
  instant = guess - offset * 60000;
  return new Date(instant);
}

export function partsInZone(zone: string, date: Date): ZonedParts {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: zone, hourCycle: "h23", weekday: "short",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const out: Record<string, string | number> = {};
  dtf.formatToParts(date).forEach((p) => {
    if (p.type === "weekday") out.weekday = p.value;
    else if (p.type !== "literal") out[p.type] = parseInt(p.value, 10);
  });
  return out as unknown as ZonedParts;
}

export function offsetLabel(zone: string, date: Date): string {
  const mins = getZoneOffsetMinutes(zone, date);
  const sign = mins >= 0 ? "+" : "−";
  const abs = Math.abs(mins);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${hh}:${mm}`;
}

export function dateLabel(p: ZonedParts, monthNames: string[]): string {
  return `${p.weekday ?? ""}, ${monthNames[p.month - 1]} ${p.day}, ${p.year}`.trim();
}

export function dayDiffBetween(a: ZonedParts, b: { year: number; month: number; day: number }): number {
  return fixedFromGregorian(a.year, a.month, a.day) - fixedFromGregorian(b.year, b.month, b.day);
}
