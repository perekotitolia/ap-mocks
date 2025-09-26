import React, { useMemo, useState } from "react";

/**
 * Supply Manager – Article Detail Editor
 * Editable mock per your spec:
 * - Categories / Subcategories (ArtName, EAN, Колір/Смак)
 * - Назва, Бренд
 * - Срок (Термін) придатності
 * - Характеристики товару та упаковки (звичайна та RTS)
 * - Дата та обʼєм поставки
 * - Список ТЦ (мультивибір), де буде постачатись
 * - Прогноз продажів, пропонована ціна
 * - Ліцензії та сертифікати (макети файлів)
 * Buttons: Reject / Save and accept / Постачатиметься в ТЦ / Порівняння
 */

type Category = { id: string; name: string; children?: Category[] };
const ARTNAME: Category[] = [
  { id: "a1", name: "Категорія A", children: [
    { id: "a1-1", name: "Підкатегорія A1" },
    { id: "a1-2", name: "Підкатегорія A2" },
  ]},
  { id: "a2", name: "Категорія B", children: [
    { id: "a2-1", name: "Підкатегорія B1" },
    { id: "a2-2", name: "Підкатегорія B2" },
  ]},
];
const EAN: Category[] = [
  { id: "e1", name: "Категорія 01" },
  { id: "e2", name: "Категорія 02" },
];
const COLOR_TASTE: Category[] = [
  { id: "c1", name: "Підкатегорія CT1" },
  { id: "c2", name: "Підкатегорія CT2" },
];
const COLOR_CAT: Category[] = [
  { id: "cc1", name: "Категорія CT" },
  { id: "cc2", name: "Категорія Alt" },
];

const TC_LIST = [
  { id: "tc_kh", name: "ТРЦ Kharkiv Mall" },
  { id: "tc_kv", name: "ТРЦ Kyiv Plaza" },
  { id: "tc_dn", name: "ТРЦ Dnipro City" },
  { id: "tc_od", name: "ТРЦ Odesa Port" },
];

type Attachment = { id: string; name: string };

function Select({ label, value, onChange, options }: { label: string; value?: string; onChange: (v: string) => void; options: { id: string; name: string }[] }) {
  return (
    <label className="block">
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <select value={value} onChange={(e)=>onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
        <option value="">—</option>
        {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </label>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value?: string | number; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <input value={value as any} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2" />
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder }: { label: string; value?: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <textarea value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 min-h-[120px]" />
    </label>
  );
}

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "ghost" }){
  const { variant = "solid", className = "", ...rest } = props;
  return (
    <button {...rest} className={
      "rounded-2xl px-4 py-2 text-sm font-medium shadow-sm transition " +
      (variant === "solid" ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-transparent hover:bg-slate-100 text-slate-700") +
      (" "+className)
    }/>
  );
}

export default function App(){
  const [artCat, setArtCat] = useState("a1");
  const [artSub, setArtSub] = useState("a1-1");
  const [eanCat, setEanCat] = useState("e1");
  const [ctSub, setCtSub] = useState("c1");
  const [ctCat, setCtCat] = useState("cc1");

  const [title, setTitle] = useState("Печиво вівсяне 90 г");
  const [brand, setBrand] = useState("Nordic");
  const [shelfLife, setShelfLife] = useState("12 міс.");

  const [prodPhysical, setProdPhysical] = useState("Вологість ≤ 14%, маса нетто 90 г");
  const [pkgPhysical, setPkgPhysical] = useState("Флоу-пак, поліпропілен, 90×150 мм");
  const [pkgRts, setPkgRts] = useState("Гофра Т-24, короб 24 шт.");

  const [supplyDate, setSupplyDate] = useState("2025-10-05");
  const [supplyVolume, setSupplyVolume] = useState("1200 од./тиждень");
  const [salesForecast, setSalesForecast] = useState("900/тиждень");
  const [proposedPrice, setProposedPrice] = useState("69.99");

  const [tcs, setTcs] = useState<string[]>(["tc_kv","tc_kh"]);
  const [attachments, setAttachments] = useState<Attachment[]>([
    { id: "a1", name: "Ліц. №123.pdf" },
    { id: "a2", name: "Сертифікат якості.pdf" },
    { id: "a3", name: "Фото упаковки.png" },
  ]);

  const toggleTc = (id: string) => setTcs(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);

  const summary = useMemo(()=>({
    artCat, artSub, eanCat, ctSub, ctCat, title, brand, shelfLife, prodPhysical, pkgPhysical, pkgRts, supplyDate, supplyVolume, salesForecast, proposedPrice, tcs
  }), [artCat, artSub, eanCat, ctSub, ctCat, title, brand, shelfLife, prodPhysical, pkgPhysical, pkgRts, supplyDate, supplyVolume, salesForecast, proposedPrice, tcs]);

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900">
      <div className="h-12 border-b border-slate-200 flex items-center px-4 gap-3 bg-white">
        <div className="font-semibold">Manager</div>
        <div className="ml-auto text-sm text-slate-500">Редагування артикулу</div>
      </div>

      <div className="grid grid-cols-[220px,1fr] h-[calc(100vh-48px)]">
        <div className="border-r border-slate-200 bg-white p-3 space-y-2">
          {["В обробці","Артикулі","Suppliers"].map(n=>
            <button key={n} className="w-full text-left rounded-xl px-3 py-2 hover:bg-slate-100">{n}</button>
          )}
        </div>

        <div className="p-5 overflow-auto">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-6">
            {/* Top categories row */}
            <div className="grid grid-cols-4 gap-4">
              <Select label="ArtName (Категорія)" value={artCat} onChange={setArtCat} options={ARTNAME} />
              <Select label="ArtName (Підкатегорія)" value={artSub} onChange={setArtSub} options={(ARTNAME.find(a=>a.id===artCat)?.children)||[]} />
              <Select label="EAN (Категорія)" value={eanCat} onChange={setEanCat} options={EAN} />
              <Input label="Назва артикулу" value={title} onChange={setTitle} />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Select label="Колір/Смак (Підкатегорія)" value={ctSub} onChange={setCtSub} options={COLOR_TASTE} />
              <Select label="Колір/Смак (Категорія)" value={ctCat} onChange={setCtCat} options={COLOR_CAT} />
              <Input label="Brand" value={brand} onChange={setBrand} />
              <Input label="Ціна продажу, що пропонується постачальником" value={proposedPrice} onChange={setProposedPrice} />
            </div>

            {/* Dates / volumes / forecast */}
            <div className="grid grid-cols-3 gap-4">
              <Input label="Дата поставки" value={supplyDate} onChange={setSupplyDate} />
              <Input label="Обʼєм поставки" value={supplyVolume} onChange={setSupplyVolume} />
              <Input label="Прогноз продажів" value={salesForecast} onChange={setSalesForecast} />
            </div>

            {/* Characteristics */}
            <div className="grid grid-cols-3 gap-4">
              <Textarea label="Фізичні характеристики товара" value={prodPhysical} onChange={setProdPhysical} />
              <Textarea label="Фізичні характеристики упаковки" value={pkgPhysical} onChange={setPkgPhysical} />
              <Textarea label="Фізичні характеристики RTS упаковки" value={pkgRts} onChange={setPkgRts} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input label="Термін придатності" value={shelfLife} onChange={setShelfLife} />
              <div className="col-span-2">
                <div className="text-sm text-slate-500 mb-1">Постачатиметься в ТЦ</div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {TC_LIST.map(tc => (
                      <label key={tc.id} className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-slate-50">
                        <input type="checkbox" checked={tcs.includes(tc.id)} onChange={()=>toggleTc(tc.id)} />
                        <span className="text-sm">{tc.name}</span>
                      </label>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500">Обрано: {tcs.length ? tcs.map(id=>TC_LIST.find(t=>t.id===id)?.name).join(", ") : "—"}</div>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <div className="text-sm text-slate-500 mb-2">Ліцензії та сертифікати</div>
              <div className="flex flex-wrap gap-2">
                {attachments.map(f => (
                  <a key={f.id} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 hover:bg-slate-50" href="#">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                    <span className="text-sm">{f.name}</span>
                  </a>
                ))}
                <button className="rounded-xl border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">+ Додати файл</button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button className="bg-rose-600 hover:bg-rose-500">Reject</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-500">Save and accept</Button>
              <Button variant="ghost">Постачатиметься в ТЦ</Button>
              <Button variant="ghost">Постачальники аналогічних товарів</Button>
            </div>
          </div>

          {/* Optional: live summary box */}
          <div className="mt-5 text-xs text-slate-500">Чернетка (поля): {JSON.stringify(summary)}</div>
        </div>
      </div>
    </div>
  );
}
