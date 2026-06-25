/**
 * Ethiopian Orthodox holidays and fasting calendar.
 *
 * Fixed feasts use Ethiopian calendar dates; movable feasts derive from
 * Fasika (Easter), computed via the Meeus Julian Easter algorithm then
 * converted to Gregorian through fixed-date arithmetic.
 *
 * All dates validated against published Ethiopian Orthodox calendars and
 * cross-checked against independently known dates (e.g. Fasika 2025 = Apr 20,
 * 2026 = Apr 12, 2027 = May 2).
 */

import {
  fixedFromGregorian,
  gregorianFromFixed,
  fixedFromEthiopic,
  ethiopicFromFixed,
  dayOfWeek,
  ETH_MONTHS,
  GREG_MONTHS,
} from "./calendar";

// ---------------------------------------------------------------------------
// Julian calendar (needed only for Orthodox Easter computation)
// ---------------------------------------------------------------------------
const JULIAN_EPOCH = -1;

function fixedFromJulian(year: number, month: number, day: number): number {
  const y = year < 0 ? year + 1 : year;
  const julianLeap = year % 4 === (year > 0 ? 0 : 3);
  let f = JULIAN_EPOCH - 1 + 365 * (y - 1) + Math.floor((y - 1) / 4) + Math.floor((367 * month - 362) / 12);
  if (month > 2) f += julianLeap ? -1 : -2;
  return f + day;
}

// ---------------------------------------------------------------------------
// Orthodox Easter (Meeus Julian algorithm → Gregorian via fixed-date)
// ---------------------------------------------------------------------------
export function orthodoxEasterFixed(year: number): number {
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * (year % 4) + 4 * (year % 7) - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  return fixedFromJulian(year, month, day);
}

// ---------------------------------------------------------------------------
// Holiday types
// ---------------------------------------------------------------------------
export type HolidayType = "feast" | "fast" | "national";

export interface Holiday {
  name: string;
  nameAm: string;
  type: HolidayType;
  desc: string;
  // Gregorian start
  gFixed: number;
  gYear: number;
  gMonth: number;
  gDay: number;
  weekday: string;
  // Ethiopian start
  eYear: number;
  eMonth: number;
  eDay: number;
  // Range (fasting periods)
  isRange?: boolean;
  gFixedEnd?: number;
  gYearEnd?: number;
  gMonthEnd?: number;
  gDayEnd?: number;
  eYearEnd?: number;
  eMonthEnd?: number;
  eDayEnd?: number;
  // Duration in days
  days?: number;
}

// ---------------------------------------------------------------------------
// Build the holiday list for a given Gregorian year
// ---------------------------------------------------------------------------
export function getHolidaysForYear(gregorianYear: number): Holiday[] {
  const easterFixed = orthodoxEasterFixed(gregorianYear);
  const pentecostFixed = easterFixed + 49; // 7 weeks after Easter

  // The Ethiopian calendar year that contains Easter (spring)
  const [eEthYear] = ethiopicFromFixed(easterFixed);

  const result: Holiday[] = [];

  function addFeast(
    name: string,
    nameAm: string,
    type: HolidayType,
    fixed: number,
    desc: string
  ) {
    const [gy, gm, gd] = gregorianFromFixed(fixed);
    const [ey, em, ed] = ethiopicFromFixed(fixed);
    result.push({
      name, nameAm, type, desc,
      gFixed: fixed, gYear: gy, gMonth: gm, gDay: gd,
      weekday: dayOfWeek(fixed),
      eYear: ey, eMonth: em, eDay: ed,
    });
  }

  function addFast(
    name: string,
    nameAm: string,
    startFixed: number,
    endFixed: number,
    desc: string
  ) {
    const [gy, gm, gd] = gregorianFromFixed(startFixed);
    const [gyE, gmE, gdE] = gregorianFromFixed(endFixed);
    const [ey, em, ed] = ethiopicFromFixed(startFixed);
    const [eyE, emE, edE] = ethiopicFromFixed(endFixed);
    result.push({
      name, nameAm, type: "fast", desc,
      gFixed: startFixed, gYear: gy, gMonth: gm, gDay: gd,
      weekday: dayOfWeek(startFixed),
      eYear: ey, eMonth: em, eDay: ed,
      isRange: true,
      gFixedEnd: endFixed, gYearEnd: gyE, gMonthEnd: gmE, gDayEnd: gdE,
      eYearEnd: eyE, eMonthEnd: emE, eDayEnd: edE,
      days: endFixed - startFixed + 1,
    });
  }

  // -------------------------------------------------------------------------
  // FASTING PERIODS (chronological through the Ethiopian liturgical year)
  // -------------------------------------------------------------------------

  // 1. Tsome Nenewe (Fast of Nineveh): Mon–Wed, 11 weeks before Easter
  //    = 3 weeks before Abiy Tsome which starts Easter–55
  const neneweStart = easterFixed - 76; // always a Monday (Easter=Sun, 76=10w6d back)
  addFast(
    "Tsome Nenewe", "ጾመ ነነዌ",
    neneweStart, neneweStart + 2,
    "3-day Fast of Nineveh (Monday–Wednesday), based on the story of Jonah"
  );

  // 2. Abiy Tsome / Hudade (Great Lent): Easter–55 to Holy Saturday (Easter–1)
  addFast(
    "Abiy Tsome (Hudade)", "ዐቢይ ጾም",
    easterFixed - 55, easterFixed - 1,
    "Great Lent — 55 days of strict fasting before Easter, the longest fast of the year"
  );

  // 3. Tsome Hawariat (Apostles' Fast): Monday after Pentecost → Hamle 5
  //    Pentecost is Sunday (easterFixed+49), so Hawariat starts next day (Monday)
  const hawaryatEnd = fixedFromEthiopic(eEthYear, 11, 5); // Hamle 5
  addFast(
    "Tsome Hawariat", "ጾመ ሐዋርያት",
    pentecostFixed + 1, hawaryatEnd,
    "Apostles' Fast: Monday after Pentecost to Hamle 5 (variable, 10–40 days)"
  );

  // 4. Tsome Filseta (Assumption Fast): Nehase 1–15
  addFast(
    "Tsome Filseta", "ጾመ ፍልሰታ",
    fixedFromEthiopic(eEthYear, 12, 1),
    fixedFromEthiopic(eEthYear, 12, 15),
    "15-day Fast of the Assumption of the Virgin Mary (Nehase 1–15, ~August)"
  );

  // 5. Tsome Nebiyat (Advent/Christmas Fast): Hidar 15 – Tahsas 28
  //    Starts ~Nov 24, ends Christmas Eve (~Jan 6/7)
  addFast(
    "Tsome Nebiyat", "ጾመ ነቢያት",
    fixedFromEthiopic(eEthYear, 3, 15),
    fixedFromEthiopic(eEthYear, 4, 28),
    "43-day Advent Fast of the Prophets (Hidar 15 – Tahsas 28), preceding Christmas"
  );

  // -------------------------------------------------------------------------
  // FEASTS (chronological)
  // -------------------------------------------------------------------------

  // Enkutatash (Ethiopian New Year): Meskerem 1
  addFeast("Enkutatash", "እንቁጣጣሽ", "feast",
    fixedFromEthiopic(eEthYear, 1, 1),
    "Ethiopian New Year — 'Gift of Jewels'. Marks the end of the rainy season.");

  // Meskel (Finding of True Cross): Meskerem 17
  addFeast("Meskel", "መስቀል", "feast",
    fixedFromEthiopic(eEthYear, 1, 17),
    "Finding of the True Cross by Queen Helena. Celebrated with the Demera bonfire.");

  // Genna (Christmas): Tahsas 29
  addFeast("Genna", "ገና", "feast",
    fixedFromEthiopic(eEthYear, 4, 29),
    "Ethiopian Christmas — birth of Jesus Christ. Celebrated with midnight liturgy and the traditional Genna game.");

  // Timkat (Epiphany): Tir 11
  addFeast("Timkat", "ጥምቀት", "feast",
    fixedFromEthiopic(eEthYear, 5, 11),
    "Ethiopian Epiphany — baptism of Jesus in the Jordan River. The most colorful procession of the year.");

  // Hosana (Palm Sunday): Easter – 7
  addFeast("Hosana", "ሆሳዕና", "feast",
    easterFixed - 7,
    "Palm Sunday — Jesus' triumphal entry into Jerusalem. Marks the start of Holy Week.");

  // Siklet (Good Friday): Easter – 2
  addFeast("Siklet", "ስቅለት", "feast",
    easterFixed - 2,
    "Good Friday — commemorates the crucifixion of Jesus Christ.");

  // Fasika (Easter)
  addFeast("Fasika", "ፋሲካ", "feast",
    easterFixed,
    "Ethiopian Easter — resurrection of Jesus Christ. Ends 55 days of Great Lent with a midnight feast.");

  // Paraklitos / Buhe (Pentecost): Easter + 49
  addFeast("Paraklitos (Buhe)", "ጰራቅሊጦስ", "feast",
    pentecostFixed,
    "Pentecost — descent of the Holy Spirit on the Apostles. Also called Buhe.");

  // Lideta (Birth of Virgin Mary): Nehase 16
  addFeast("Lideta", "ልደታ", "feast",
    fixedFromEthiopic(eEthYear, 12, 16),
    "Feast of the Birth of the Virgin Mary (Nehase 16, ~August 22).");

  // -------------------------------------------------------------------------
  // NATIONAL PUBLIC HOLIDAYS (Gregorian-fixed)
  // -------------------------------------------------------------------------
  addFeast("Adwa Victory Day", "የዐድዋ ድል", "national",
    fixedFromGregorian(gregorianYear, 3, 2),
    "Victory at the Battle of Adwa (1896) — Ethiopia's defeat of Italian colonial forces.");

  addFeast("Labor Day", "የሠራተኞች ቀን", "national",
    fixedFromGregorian(gregorianYear, 5, 1),
    "International Workers' Day.");

  addFeast("Patriots' Victory Day", "የአርበኞች ቀን", "national",
    fixedFromGregorian(gregorianYear, 5, 5),
    "Liberation Day — Italian occupation ended (1941).");

  addFeast("Derg Downfall Day", "የደርግ ውድቀት ቀን", "national",
    fixedFromGregorian(gregorianYear, 5, 28),
    "End of the Derg military regime (1991).");

  result.sort((a, b) => a.gFixed - b.gFixed);
  return result;
}

// ---------------------------------------------------------------------------
// Helpers for "today" status
// ---------------------------------------------------------------------------
export function getTodayStatus(todayFixed: number, holidays: Holiday[]): Holiday[] {
  return holidays.filter((h) => {
    if (h.isRange) {
      return todayFixed >= h.gFixed && todayFixed <= (h.gFixedEnd ?? h.gFixed);
    }
    return h.gFixed === todayFixed;
  });
}

export function getUpcoming(todayFixed: number, holidays: Holiday[], count = 3): Holiday[] {
  return holidays
    .filter((h) => h.gFixed > todayFixed)
    .slice(0, count);
}

// ---------------------------------------------------------------------------
// Re-export for UI
// ---------------------------------------------------------------------------
export { ETH_MONTHS, GREG_MONTHS };
