/**
 * Ge'ez (Ethiopic) numerals are written base-100. Each two-digit chunk is
 * written directly; chunks beyond the first carry a multiplier mark: ፻ (x100)
 * and ፼ (x10,000), which compound when adjacent. There is no symbol for zero.
 */

const ONES = ["", "፩", "፪", "፫", "፬", "፭", "፮", "፯", "፰", "፱"];
const TENS = ["", "፲", "፳", "፴", "፵", "፶", "፷", "፸", "፹", "፺"];
const HUNDRED = "፻";
const MYRIAD = "፼";

export const GEEZ_PALETTE = [...ONES.slice(1), ...TENS.slice(1), HUNDRED, MYRIAD];

function digitPair(v: number): string {
  return TENS[Math.floor(v / 10)] + ONES[v % 10];
}

export function arabicToGeez(num: number): string | null {
  if (!Number.isInteger(num) || num <= 0) return null;
  const chunks: number[] = [];
  let n = num;
  while (n > 0) {
    chunks.push(n % 100);
    n = Math.floor(n / 100);
  }
  let out = "";
  for (let k = chunks.length - 1; k >= 0; k--) {
    const v = chunks[k];
    if (v === 0) continue;
    const marker = k > 0 ? (k % 2 === 1 ? HUNDRED : "") + MYRIAD.repeat(Math.floor(k / 2)) : "";
    out += k > 0 && v === 1 ? marker : digitPair(v) + marker;
  }
  return out;
}

const ONE_VAL: Record<string, number> = {};
ONES.forEach((c, i) => { if (c) ONE_VAL[c] = i; });
const TEN_VAL: Record<string, number> = {};
TENS.forEach((c, i) => { if (c) TEN_VAL[c] = i * 10; });

export function geezToArabic(str: string): number | null {
  let total = 0;
  let pendingValue = 0;
  let pendingMult = 1;
  let sawAny = false;

  for (const ch of str) {
    if (ch in ONE_VAL || ch in TEN_VAL) {
      sawAny = true;
      if (pendingMult !== 1) {
        total += (pendingValue === 0 ? 1 : pendingValue) * pendingMult;
        pendingValue = 0;
        pendingMult = 1;
      }
      pendingValue += ch in ONE_VAL ? ONE_VAL[ch] : TEN_VAL[ch];
    } else if (ch === HUNDRED) {
      sawAny = true;
      pendingMult *= 100;
    } else if (ch === MYRIAD) {
      sawAny = true;
      pendingMult *= 10000;
    }
  }
  if (!sawAny) return null;
  total += (pendingValue === 0 ? (pendingMult !== 1 ? 1 : 0) : pendingValue) * pendingMult;
  return total;
}
