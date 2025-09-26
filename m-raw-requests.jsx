import React, { useMemo, useState } from "react";

/**
 * Mock: Supply Manager – список артикулів від постачальників
 * По прототипу: колонки Артикул/Постачальник • Статус категорії • Розміри • Ціни
 * Тільки список (без картки деталі) + мінімальні фільтри/пошук. Tailwind.
 */

type Row = {
  id: string;
  articleNo: number;
  supplier: string;
  status: "Підтверджено" | "Категорії не підтверджено";
  sizes: "Вказано" | "Не вказано";
  prices: "Вказано" | "Не вказано";
};

const DATA: Row[] = [
  {
    id: "r1",
    articleNo: 295789,
    supplier: "ТОВ Постачальник",
    status: "Категорії не підтверджено",
    sizes: "Не вказано",
    prices: "Не вказано",
  },
  {
    id: "r2",
    articleNo: 295780,
    supplier: "TOB Supplier",
    status: "Підтверджено",
    sizes: "Не вказано",
    prices: "Вказано",
  },
  {
    id: "r3",
    articleNo: 295709,
    supplier: "Supplier LTD",
    status: "Категорії не підтверджено",
    sizes: "Вказано",
    prices: "Вказано",
  },
  {
    id: "r4",
    articleNo: 295089,
    supplier: "Supplier LTD",
    status: "Категорії не підтверджено",
    sizes: "Вказано",
    prices: "Вказано",
  },
];

const Pill: React.FC<{ tone?: "ok" | "warn"; children: React.ReactNode }> = ({ tone, children }) => (
  <span
    className={
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
      (tone === "ok"
        ? "bg-emerald-100 text-emerald-800"
        : tone === "warn"
        ? "bg-amber-100 text-amber-800"
        : "bg-slate-100 text-slate-700")
    }
  >
    {children}
  </span>
);

export default function App() {
  const [activeNav, setActiveNav] = useState("В обробці");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Усі" | Row["status"]>("Усі");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMalls, setShowMalls] = useState(false);
  const [showCompetitors, setShowCompetitors] = useState(false);

  // локальна редагована копія (мок)
  const [form, setForm] = useState<any | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DATA.filter((r) =>
      (statusFilter === "Усі" || r.status === statusFilter) &&
      (!q || r.articleNo.toString().includes(q) || r.supplier.toLowerCase().includes(q))
    );
  }, [query, statusFilter]);

  const selectedRow = useMemo(() => DATA.find((r) => r.id === selectedId) || null, [selectedId]);

  function openDetail(row: Row) {
    setSelectedId(row.id);
    // заповнюємо форму тестовими/дефолтними значеннями
    setForm({
      articleNo: row.articleNo,
      supplier: row.supplier,
      artNameMMC: "Категорія",
      eanMC: "Категорія",
      colorMSC: "Підкатегорія",
      flavorVAR: "Категорія",
      brand: "Brand X",
      sellPrice: "69.99",
      supplyDate: "2025-10-05",
      supplyVolume: "1200/міс",
      salesForecast: "900/міс",
      productPhysical: "Опис товару (фіз. характеристики)",
      pkgPhysical: "Опис упаковки",
      pkgRts: "Опис rts упаковки",
      shelfLife: "12 міс.",
      licenses: ["Ліц. №123.pdf", "Сертифікат якості.pdf"],
      malls: ["ТРЦ SkyMall", "ТРЦ DreamTown"],
    });
  }

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900">
      {/* Top bar */}
      <div className="h-12 border-b border-slate-200 flex items-center px-4 gap-3 bg-white">
        <div className="font-semibold">Manager</div>
        <input
          placeholder="Пошук: артикул або постачальник"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ml-auto rounded-xl border border-slate-200 px-3 py-1.5 w-96"
        />
      </div>

      <div className="grid grid-cols-[220px,1fr] h-[calc(100vh-48px)]">
        {/* Left nav */}
        <div className="border-r border-slate-200 bg-white p-3 space-y-2">
          {(["В обробці", "Артикулі", "Suppliers"] as const).map((n) => (
            <button
              key={n}
              onClick={() => setActiveNav(n)}
              className={
                "w-full text-left rounded-xl px-3 py-2 " +
                (activeNav === n ? "bg-slate-900 text-white" : "hover:bg-slate-100")
              }
            >
              {n}
            </button>
          ))}
        </div>

        {/* Main area */}
        <div className="p-5 overflow-auto space-y-6">
          {/* LIST */}
          <div className="rounded-2xl border border-slate-200 bg-white">
            {/* Header */}
            <div className="px-5 py-3 border-b flex items-center gap-3">
              <div className="text-sm text-slate-500">Список заявок</div>
              <div className="ml-auto flex items-center gap-2">
                <label className="text-sm text-slate-600">Статус категорії:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm bg-white"
                >
                  <option>Усі</option>
                  <option>Підтверджено</option>
                  <option>Категорії не підтверджено</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 px-5 py-2 text-sm text-slate-500">
              <div className="col-span-5">Артикул / Постачальник</div>
              <div className="col-span-3">Статус категорії</div>
              <div className="col-span-2">Розміри</div>
              <div className="col-span-2">Ціни</div>
            </div>
            <div className="divide-y">
              {rows.map((r) => (
                <div key={r.id} className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer" onClick={() => openDetail(r)}>
                  <div className="col-span-5">
                    <div className="font-semibold">Артикул {r.articleNo}</div>
                    <div className="text-slate-500">{r.supplier}</div>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <Pill tone={r.status === "Підтверджено" ? "ok" : "warn"}>{r.status}</Pill>
                  </div>
                  <div className="col-span-2 flex items-center">{r.sizes}</div>
                  <div className="col-span-2 flex items-center">{r.prices}</div>
                </div>
              ))}
              {rows.length === 0 && (
                <div className="px-5 py-8 text-slate-500">Нічого не знайдено</div>
              )}
            </div>
          </div>

          {/* DETAIL (editable) */}
          {form && selectedRow && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xl font-semibold">Артикул {form.articleNo}</div>
                  <div className="text-slate-500">{form.supplier}</div>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-xl px-3 py-2 text-sm hover:bg-slate-100" onClick={() => setShowMalls(true)}>Постачатиметься в ТЦ</button>
                  <button className="rounded-xl px-3 py-2 text-sm hover:bg-slate-100" onClick={() => setShowCompetitors(true)}>Постачальники аналогічних товарів</button>
                </div>
              </div>

              {/* top selectors */}
              <div className="grid grid-cols-4 gap-4">
                <Field label="ArtName (Категорія)">
                  <select className="w-full bg-white" value={form.artNameMMC} onChange={(e)=>setForm({...form, artNameMMC:e.target.value})}>
                    <option>Категорія</option>
                    <option>Кондитерські вироби</option>
                    <option>Напої</option>
                  </select>
                </Field>
                <Field label="EAN (Категорія)">
                  <select className="w-full bg-white" value={form.eanMC} onChange={(e)=>setForm({...form, eanMC:e.target.value})}>
                    <option>Категорія</option>
                    <option>Штрих-код 13</option>
                    <option>Штрих-код 8</option>
                  </select>
                </Field>
                <Field label="Колір/Смак (Підкатегорія)">
                  <select className="w-full bg-white" value={form.colorMSC} onChange={(e)=>setForm({...form, colorMSC:e.target.value})}>
                    <option>Підкатегорія</option>
                    <option>Молочний шоколад</option>
                    <option>Темний шоколад</option>
                  </select>
                </Field>
                <Field label="Категорія (дод.)">
                  <select className="w-full bg-white" value={form.flavorVAR} onChange={(e)=>setForm({...form, flavorVAR:e.target.value})}>
                    <option>Категорія</option>
                    <option>PUAR</option>
                    <option>Classic</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Brand">
                  <input className="w-full bg-transparent outline-none" value={form.brand} onChange={(e)=>setForm({...form, brand:e.target.value})} />
                </Field>
                <Field label="Ціна продажу що пропонується постачальником">
                  <input className="w-full bg-transparent outline-none" value={form.sellPrice} onChange={(e)=>setForm({...form, sellPrice:e.target.value})} />
                </Field>
                <div />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Дата поставки">
                  <input type="date" className="w-full bg-transparent outline-none" value={form.supplyDate} onChange={(e)=>setForm({...form, supplyDate:e.target.value})} />
                </Field>
                <Field label="Об'єм поставки">
                  <input className="w-full bg-transparent outline-none" value={form.supplyVolume} onChange={(e)=>setForm({...form, supplyVolume:e.target.value})} />
                </Field>
                <Field label="Прогноз продажів">
                  <input className="w-full bg-transparent outline-none" value={form.salesForecast} onChange={(e)=>setForm({...form, salesForecast:e.target.value})} />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Фізичні характеристики товара">
                  <textarea className="w-full bg-transparent outline-none" rows={3} value={form.productPhysical} onChange={(e)=>setForm({...form, productPhysical:e.target.value})} />
                </Field>
                <Field label="Фізичні характеристики упаковки">
                  <textarea className="w-full bg-transparent outline-none" rows={3} value={form.pkgPhysical} onChange={(e)=>setForm({...form, pkgPhysical:e.target.value})} />
                </Field>
                <Field label="Фізичні характеристики rts упаковки">
                  <textarea className="w-full bg-transparent outline-none" rows={3} value={form.pkgRts} onChange={(e)=>setForm({...form, pkgRts:e.target.value})} />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Термін придатності">
                  <input className="w-full bg-transparent outline-none" value={form.shelfLife} onChange={(e)=>setForm({...form, shelfLife:e.target.value})} />
                </Field>
                <div className="col-span-2">
                  <div className="text-sm text-slate-500 mb-1">Ліцензії та сертифікати</div>
                  <div className="flex flex-wrap gap-2">
                    {form.licenses.map((n:string, i:number)=> (
                      <span key={i} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M8 16a4 4 0 0 1 4-4h6a2 2 0 1 1 0 4H13"/><path d="M6 8v8a6 6 0 0 0 12 0V8" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                        <span className="text-sm">{n}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button className="rounded-2xl px-4 py-2 text-sm bg-rose-600 text-white">Reject</button>
                <button className="rounded-2xl px-4 py-2 text-sm bg-emerald-600 text-white">Save and accept</button>
                <button className="rounded-2xl px-4 py-2 text-sm hover:bg-slate-100">Зберегти як чернетку</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модал вибору ТЦ */}
      {showMalls && form && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50" onClick={()=>setShowMalls(false)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="font-semibold">Виберіть ТЦ для поставок</div>
              <button onClick={()=>setShowMalls(false)} className="rounded-xl px-3 py-1.5 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3 text-sm">
              {[
                "ТРЦ SkyMall","ТРЦ DreamTown","Ocean Plaza","Gulliver","Forum Lviv","Retroville"
              ].map((mall)=>{
                const checked = form.malls.includes(mall);
                return (
                  <label key={mall} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 border border-slate-200">
                    <input type="checkbox" checked={checked} onChange={() => {
                      setForm({
                        ...form,
                        malls: checked ? form.malls.filter((m:string)=>m!==mall) : [...form.malls, mall]
                      });
                    }} />
                    {mall}
                  </label>
                );
              })}
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button className="rounded-2xl px-4 py-2 text-sm hover:bg-slate-100" onClick={()=>setShowMalls(false)}>Готово</button>
            </div>
          </div>
        </div>
      )}

      {/* Модал конкурентів (порожній мок) */}
      {showCompetitors && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50" onClick={()=>setShowCompetitors(false)}>
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="font-semibold">Додаткова секція з переліком постачальників і порівнянням</div>
              <button onClick={()=>setShowCompetitors(false)} className="rounded-xl px-3 py-1.5 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-6">
              <div className="rounded-xl border border-slate-200 overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="text-left px-4 py-2">Постачальник</th>
                      <th className="text-left px-4 py-2">Артикул</th>
                      <th className="text-left px-4 py-2">Різниця цін</th>
                      <th className="text-left px-4 py-2">Прогноз продажів</th>
                      <th className="text-left px-4 py-2">Прогноз поставок</th>
                      <th className="text-left px-4 py-2">rts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1,2,3].map((i)=> (
                      <tr key={i} className={i%2?"bg-white":"bg-slate-50/30"}>
                        <td className="px-4 py-2">Supplier {i}</td>
                        <td className="px-4 py-2">2957{i}0</td>
                        <td className="px-4 py-2">{i===2?"-2%":"+4%"}</td>
                        <td className="px-4 py-2">≈</td>
                        <td className="px-4 py-2">стаб.</td>
                        <td className="px-4 py-2">A{i===2?"-":""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button className="rounded-2xl px-4 py-2 text-sm hover:bg-slate-100" onClick={()=>setShowCompetitors(false)}>Закрити</button>
              <button className="rounded-2xl px-4 py-2 text-sm bg-slate-900 text-white">Додати до порівняння</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
