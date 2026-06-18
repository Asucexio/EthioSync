"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { arabicToGeez, geezToArabic, GEEZ_PALETTE } from "@/lib/geez-numerals";

function NumberToGeez() {
  const [value, setValue] = useState("");

  const output = useMemo(() => {
    const raw = value.trim();
    if (raw === "") return "—";
    if (!/^\d+$/.test(raw)) return "Whole numbers only";
    const n = Number(raw);
    if (n === 0) return "No symbol for zero in Ge'ez";
    if (!Number.isSafeInteger(n)) return "Too large to render precisely";
    return arabicToGeez(n) ?? "—";
  }, [value]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Number → Ge&apos;ez numeral</CardTitle>
        <CardDescription>
          Ge&apos;ez numerals are written base-100, with marks for ×100 (፻) and ×10,000 (፼). There&apos;s no symbol for zero.
        </CardDescription>
      </CardHeader>
      <div className="mb-4">
        <Label htmlFor="num-arabic">Number</Label>
        <Input
          id="num-arabic" type="text" inputMode="numeric" placeholder="e.g. 2018"
          value={value} onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <div className="border-t border-ink/10 pt-4.5">
        <p className="mb-1.5 text-xs uppercase tracking-wide text-ink-muted">In Ge&apos;ez</p>
        <p id="num-geez-output" className="min-h-[1.3em] break-all font-geez text-[clamp(34px,9vw,46px)] leading-snug text-gold">
          {output}
        </p>
      </div>
    </Card>
  );
}

function GeezToNumber() {
  const [value, setValue] = useState("፳፻፲፰");

  const output = useMemo(() => {
    const raw = value.trim();
    if (raw === "") return "—";
    const val = geezToArabic(raw);
    return val === null ? "Unrecognized symbols" : val.toLocaleString("en-US");
  }, [value]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ge&apos;ez numeral → Number</CardTitle>
        <CardDescription>Type, paste, or tap the symbols below.</CardDescription>
      </CardHeader>
      <div className="mb-4">
        <Label htmlFor="num-geez">Ge&apos;ez numeral</Label>
        <Input
          id="num-geez" type="text" placeholder="፳፻፲፰"
          className="font-geez text-lg text-gold"
          value={value} onChange={(e) => setValue(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-10 gap-1.5">
        {GEEZ_PALETTE.map((sym, i) => (
          <button
            key={i} type="button"
            onClick={() => setValue((v) => v + sym)}
            className="rounded-md border border-ink/10 bg-black/20 py-1.5 font-geez text-[15px] text-ink transition-colors hover:border-gold hover:text-gold"
          >
            {sym}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setValue("")}
          className="col-span-2 rounded-md border border-ink/10 bg-black/20 py-1.5 font-mono text-[11px] text-ink-muted transition-colors hover:border-gold hover:text-gold"
        >
          Clear
        </button>
      </div>

      <div className="border-t border-ink/10 pt-4.5 mt-4.5">
        <p className="mb-1.5 text-xs uppercase tracking-wide text-ink-muted">As a number</p>
        <p id="num-arabic-output" className="m-0 break-words font-display text-[clamp(26px,6vw,32px)] font-semibold">{output}</p>
      </div>
    </Card>
  );
}

export function NumeralConverter() {
  return (
    <div className="flex flex-col gap-4.5">
      <NumberToGeez />
      <GeezToNumber />
    </div>
  );
}
