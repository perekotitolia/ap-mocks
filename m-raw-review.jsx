import React, { useMemo, useState } from "react";

/**
 * Manager – Review RAW Supplier Request
 * Scenario: supplier sent only basic fields (EAN, Назва ...). Manager sets FINAL
 * categories and marks EXTRA required fields (overriding/adding to category rules),
 * e.g. multi-angle photos, special eco/quality certificate, etc. Then sends back
 * requirements to the supplier.
 */

type RawArticle = {
  id: string;
  ean: string;
  title: string;
  supplier: string;
};

// Simplified taxonomy
type CategoryNode = { id: string; name: string; children?: CategoryNode[] };
const ARTNAME: CategoryNode[] = [
  { id: "bakery", name: "Випічка", children: [
    { id: "cookies", name: "Печиво" },
    { id: "crackers", name: "Крекери" },
  ]},
  { id: "confection", name: "Кондитерські", children: [
    { id: "chocolate", name: "Шоколад" },
    { id: "bars", name: "Батончики" },
  ]},
];
const EAN_CATS: CategoryNode[] = [
  { id: "ean13", name: "EAN-13" },
  { id: "ean8", name: "EAN-8" },
];
const COLOR_TASTE: CategoryNode[] = [
  { id: "milk", name: "Молочний" },
  { id: "dark", name: "Темний" },
  { id: "honey", name: "Медовий" },
];

// Category rulebook (what's ALWAYS required by category)
const CATEGORY_RULES: Record<string, string[]> = {
  cookies: ["brand", "shelfLife", "productSizeMaterial", "packageSizeMaterial", "certificates"],
  chocolate: ["brand", "shelfLife", "productSizeMaterial", "packageSizeMaterial"],
  crackers: ["brand", "shelfLife"],
  bars: ["brand", "shelfLife", "packageSizeMaterial"],
};

// Extra requirement presets manager may toggle per article
const EXTRA_OPTIONS = [
  { id: "photos_multi", label: "Фото з різних ракурсів (4+)" },
  { id: "cert_eco", label: "Сертифікат екологічності" },
  { id: "cert_quality", label: "Спеціальний сертифікат якості" },
  { id: "country_origin", label: "Країна походження" },
  { id: "msds", label: "MSDS / декларація безпеки" },
];

type Decision = {
  artId: string;
  artNameCat?: string; // e.g., confection
  artNameSub?: string; // e.g., chocolate
  eanCat?: string;     // ean13
  colorTaste?: string; // milk
  comment?: string;
  extras: string[];    // extra required toggles ids
};

const RAW_SEED: RawArticle[] = [
  { id: "a1", ean: "4820000123456", title: "Печиво вівсяне 90 г", supplier: "ТОВ Постачальник" },
  { id: "a2", ean: "4820000765432", title: "Шоколад молочний 85 г", supplier: "Supplier LTD" },
  { id: "a3", ean: "5901234567890", title: "Батончик протеїновий 50 г", supplier: "Best Foods UA" },
];

function Select({ label, value, onChange, options }: { label: string; value?: string; onChange: (v: string)=>void; options: {id:string;name:string}[] }){
  return (
    <label className="block">
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <select value={value||""} onChange={(e)=>onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
        <option value="">—</option>
        {options.map(o=> <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </label>
  );
}

function Pill({ children, tone = "neutral" as "neutral" | "ok" | "warn" }){
  return (
    <span className={
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
      (tone === "ok" ? "bg-emerald-100 text-emerald-800" : tone === "warn" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700")
    }>{children}</span>
  );
}

export default function App(){
  const [list] = useState<RawArticle[]>(RAW_SEED);
  const [selectedId, setSelectedId] = useState<string>(RAW_SEED[0].id);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({
    a1: { artId: "a1", artNameCat: "bakery", artNameSub: "cookies", eanCat: "ean13", colorTaste: "honey", extras: ["cert_quality"] },
    a2: { artId: "a2", artNameCat: "confection", artNameSub: "chocolate", eanCat: "ean13", colorTaste: "milk", extras: ["photos_multi"] },
    a3: { artId: "a3", extras: [] },
  });

  const selected = useMemo(()=> list.find(x=>x.id===selectedId)!, [list, selectedId]);
  const decision = useMemo(()=> decisions[selectedId] || { artId: selectedId, extras: [] }, [decisions, selectedId]);

  function updateDecision(patch: Partial<Decision>){
    setDecisions(prev => ({ ...prev, [selectedId]: { ...(prev[selectedId]||{ artId: selectedId, extras: [] }), ...patch } }));
  }

  const baseRequired = useMemo(()=> CATEGORY_RULES[decision.artNameSub||""] || [], [decision.artNameSub]);
  const combinedRequired = useMemo(()=> ({ base: baseRequired, extra: decision.extras }), [baseRequired, decision.extras]);

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900">
      {/* Top bar */}
      <div className="h-12 border-b border-slate-200 bg-white px-4 flex items-center">
        <div className="font-semibold">Manager</div>
        <div className="ml-auto text-sm text-slate-500">Перевірка сирих заявок та формування вимог</div>
      </div>

      <div className="grid grid-cols-[360px,1fr] h-[calc(100vh-48px)]">
        {/* Left list: raw articles */}
        <div className="border-r border-slate-200 bg-white p-4 space-y-3 overflow-auto">
          <div className="text-sm text-slate-500 mb-1">Сирі артикули від постачальника</div>
          <div className="rounded-xl border border-slate-200 divide-y">
            {list.map(a => (
              <button key={a.id} onClick={()=>setSelectedId(a.id)} className={"w-full text-left px-4 py-3 hover:bg-slate-50 " + (a.id===selectedId?"bg-slate-50":"")}>
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-slate-500">EAN: {a.ean} · {a.supplier}</div>
                <div className="mt-1 flex gap-2 text-xs">
                  {decisions[a.id]?.artNameSub && <Pill tone="ok">Категорія: {ARTNAME.find(c=>c.children?.some(s=>s.id===decisions[a.id].artNameSub))?.name} / {ARTNAME.flatMap(c=>c.children||[]).find(s=>s.id===decisions[a.id].artNameSub)?.name}</Pill>}
                  {decisions[a.id]?.extras?.length ? <Pill tone="warn">+{decisions[a.id].extras.length} дод. вимоги</Pill> : <Pill>без дод. вимог</Pill>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right editor */}
        <div className="p-6 overflow-auto">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-6 max-w-4xl">
            {/* Base info */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl font-semibold">{selected.title}</div>
                <div className="text-slate-500">EAN: {selected.ean} · Постачальник: {selected.supplier}</div>
              </div>
              <div className="text-sm text-slate-500">ID: {selected.id}</div>
            </div>

            {/* Category decisions */}
            <div className="grid grid-cols-4 gap-4">
              <Select label="ArtName (Категорія)" value={decision.artNameCat} onChange={(v)=>updateDecision({ artNameCat: v, artNameSub: "" })} options={ARTNAME} />
              <Select label="ArtName (Підкатегорія)" value={decision.artNameSub} onChange={(v)=>updateDecision({ artNameSub: v })} options={(ARTNAME.find(a=>a.id===decision.artNameCat)?.children)||[]} />
              <Select label="EAN (Категорія)" value={decision.eanCat} onChange={(v)=>updateDecision({ eanCat: v })} options={EAN_CATS} />
              <Select label="Колір/Смак" value={decision.colorTaste} onChange={(v)=>updateDecision({ colorTaste: v })} options={COLOR_TASTE} />
            </div>

            {/* Required fields summary */}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-sm text-slate-500 mb-2">Обов'язкові поля для постачальника</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs uppercase text-slate-400 mb-1">за правилами категорії</div>
                  <div className="flex flex-wrap gap-2">
                    {(combinedRequired.base.length?combinedRequired.base:["— не визначено для підкатегорії —"]).map((f,i)=> (
                      <span key={i} className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-700 text-xs px-3 py-1.5">{f}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-slate-400 mb-1">додатково від менеджера</div>
                  <div className="flex flex-wrap gap-2">
                    {combinedRequired.extra.length ? combinedRequired.extra.map((f,i)=> (
                      <span key={i} className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-800 text-xs px-3 py-1.5">{EXTRA_OPTIONS.find(x=>x.id===f)?.label || f}</span>
                    )) : <span className="text-xs text-slate-400">— немає —</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Extra toggles */}
            <div>
              <div className="text-sm text-slate-500 mb-2">Відмітьте додаткові обов'язкові поля</div>
              <div className="grid grid-cols-2 gap-2">
                {EXTRA_OPTIONS.map(opt => {
                  const checked = decision.extras.includes(opt.id);
                  return (
                    <label key={opt.id} className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 hover:bg-slate-50">
                      <input type="checkbox" checked={checked} onChange={()=>{
                        const next = checked ? decision.extras.filter(x=>x!==opt.id) : [...decision.extras, opt.id];
                        updateDecision({ extras: next });
                      }} />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Manager comment */}
            <div>
              <div className="text-sm text-slate-500 mb-1">Коментар постачальнику</div>
              <textarea value={decision.comment||""} onChange={(e)=>updateDecision({ comment: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 min-h-[100px]" placeholder="Поясніть, що саме додатково потрібно (напр., 4 фото: фронт, тильна, збоку, в упаковці; сертифікат екологічності EU)..." />
            </div>

            <div className="flex gap-2">
              <button className="rounded-2xl px-4 py-2 text-sm bg-slate-900 text-white">Зберегти як чернетку</button>
              <button className="rounded-2xl px-4 py-2 text-sm bg-emerald-600 text-white">Надіслати вимоги постачальнику</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
