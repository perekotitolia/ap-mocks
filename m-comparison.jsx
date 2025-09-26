import React, { useMemo, useState } from "react";

/**
 * Competitor Comparison – Supply Manager
 * Shows base info about CURRENT supplier & article, and a comparison table
 * of competitor suppliers for the same/analog article. Includes test data.
 * Columns: Постачальник • Артикул • Різниця цін • Прогноз продажів • Прогноз поставок • rts
 */

type CurrentOffer = {
  articleNo: number;
  artTitle: string;
  supplier: string;
  brand: string;
  categoryPath: string; //(or categories chain)
  price: number; // proposed sell price
  salesForecast: string; // e.g., 900/тиждень
  supplyForecast: string; // e.g., стабільно/нестаб.
  rts: string;
};

type CompetitorRow = {
  supplier: string;
  articleNo: number;
  brand?: string;
  price?: number; // competitor's proposed price
  priceDiff?: string; // computed vs current
  salesForecast: string;
  supplyForecast: string;
  rts: string;
};

const CURRENT: CurrentOffer = {
  articleNo: 295709,
  artTitle: "Шоколад пористий 90 г",
  supplier: "Supplier LTD",
  brand: "Lemur",
  price: 74.50,
  salesForecast: "900/тиждень",
  supplyForecast: "стабільно",
  rts: "B+",
};

const COMPETITORS_SEED: CompetitorRow[] = [
  { supplier: "TOB Supplier", articleNo: 295703, brand: "Nordic", price: 72.30, salesForecast: "-2%", supplyForecast: "стаб.", rts: "B+" },
  { supplier: "ТОВ Постачальник", articleNo: 295702, brand: "Ferro", price: 75.00, salesForecast: "+5%", supplyForecast: "стаб.", rts: "A" },
  { supplier: "Best Foods UA", articleNo: 295704, brand: "Best", price: 74.50, salesForecast: "+1%", supplyForecast: "нестаб.", rts: "A-" },
];

function pctDiff(num: number, base: number) {
  if (num == null || base == null) return "—";
  const d = ((num - base) / base) * 100;
  const sign = d > 0 ? "+" : "";
  return sign + d.toFixed(1) + "%";
}

function Pill({ children, tone = "neutral" as "neutral" | "good" | "warn" }) {
  return (
    <span className={
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
      (tone === "good" ? "bg-green-100 text-green-800" : tone === "warn" ? "bg-yellow-100 text-yellow-800" : "bg-slate-100 text-slate-700")
    }>
      {children}
    </span>
  );
}

export default function App(){
  const [sortKey, setSortKey] = useState<keyof CompetitorRow | "priceDiff">("priceDiff");
  const [dir, setDir] = useState<1 | -1>(1);

  const rows = useMemo(()=>{
    const withDiff = COMPETITORS_SEED.map(r => ({
      ...r,
      priceDiff: r.price != null ? pctDiff(r.price, CURRENT.price) : "—",
    }));

    const sorted = [...withDiff].sort((a,b)=>{
      const va = sortKey === "priceDiff" ? (parseFloat((a.priceDiff||"0").toString()) || 0) : (a[sortKey] as any);
      const vb = sortKey === "priceDiff" ? (parseFloat((b.priceDiff||"0").toString()) || 0) : (b[sortKey] as any);
      if (va == null && vb != null) return 1;
      if (vb == null && va != null) return -1;
      if (va == null && vb == null) return 0;
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return sorted;
  }, [sortKey, dir]);

  function sortBy(key: keyof CompetitorRow | "priceDiff") {
    if (sortKey === key) setDir(d => (d === 1 ? -1 : 1)); else { setSortKey(key); setDir(1); }
  }

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900">
      <div className="h-12 border-b border-slate-200 bg-white px-4 flex items-center">
        <div className="font-semibold">Manager</div>
        <div className="ml-auto text-sm text-slate-500">Порівняння постачальників</div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-5">
        {/* Base card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-start gap-6">
            <div className="grow min-w-[260px]">
              <div className="text-lg font-semibold">Артикул {CURRENT.articleNo} — {CURRENT.artTitle}</div>
              <div className="text-slate-500">Постачальник: {CURRENT.supplier} · Бренд: {CURRENT.brand}</div>
              <div className="text-slate-500">Категорія: {CURRENT.categoryPath}</div>
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                <div className="text-slate-500">Ціна</div>
                <div className="font-semibold">{CURRENT.price.toFixed(2)} UAH</div>
              </div>
              <div>
                <div className="text-slate-500">Прогноз продажів</div>
                <div className="font-semibold">{CURRENT.salesForecast}</div>
              </div>
              <div>
                <div className="text-slate-500">Поставки</div>
                <div className="font-semibold">{CURRENT.supplyForecast}</div>
              </div>
              <div>
                <div className="text-slate-500">rts</div>
                <div className="font-semibold">{CURRENT.rts}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3 text-sm text-slate-500 border-b">Додаткова секція з переліком постачальників і порівнянням поточного артикулу з конкуруючими</div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <Th onClick={()=>sortBy("supplier")}>Постачальник</Th>
                  <Th onClick={()=>sortBy("articleNo")}>Артикул</Th>
                  <Th onClick={()=>sortBy("priceDiff")}>Різниця цін</Th>
                  <Th onClick={()=>sortBy("salesForecast")}>Прогноз продажів</Th>
                  <Th onClick={()=>sortBy("supplyForecast")}>Прогноз поставок</Th>
                  <Th onClick={()=>sortBy("rts")}>rts</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} className={idx % 2 ? "bg-white" : "bg-slate-50/30"}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium">{r.supplier}</div>
                      {r.brand && <div className="text-xs text-slate-500">Бренд: {r.brand}</div>}
                    </td>
                    <td className="px-4 py-3">{r.articleNo}</td>
                    <td className="px-4 py-3">
                      <span className={
                        (r.priceDiff||"").startsWith("-") ? "text-emerald-600" : (r.priceDiff||"").startsWith("+") ? "text-rose-600" : "text-slate-700"
                      }>{r.priceDiff ?? "—"}</span>
                      {r.price != null && <div className="text-xs text-slate-500">{r.price.toFixed(2)} UAH</div>}
                    </td>
                    <td className="px-4 py-3">{r.salesForecast}</td>
                    <td className="px-4 py-3">{r.supplyForecast}</td>
                    <td className="px-4 py-3">{r.rts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hints / actions */}
        <div className="flex flex-wrap gap-2 text-sm">
          <button className="rounded-2xl px-3 py-2 hover:bg-slate-100">Додати до порівняння</button>
          <button className="rounded-2xl px-3 py-2 hover:bg-slate-100">Експорт у CSV</button>
          <div className="ml-auto flex items-center gap-2">
            <Pill tone="good">Ціна нижча — варто розглянути</Pill>
            <Pill tone="warn">Ціна вища — торг/відхилити</Pill>
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({children, onClick}:{children: React.ReactNode; onClick?: ()=>void}){
  return (
    <th className="text-left px-4 py-2 cursor-pointer select-none hover:underline" onClick={onClick}>{children}</th>
  );
}
