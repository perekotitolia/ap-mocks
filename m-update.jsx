import React, { useMemo, useState } from "react";

/**
 * Integration Queue – Manager adds approved articles to external systems
 * Context: all approvals received. Manager picks destination systems, reviews
 * preflight checks and field mapping, then enqueues items for sync.
 *
 * Destinations: PIM, ERP, E‑commerce, POS (mock). Test data included.
 */

type FileStub = { id: string; name: string };

type Article = {
  id: string;
  ean: string;
  title: string;
  brand: string;
  shelfLife: string;
  productSizeMaterial: string;
  packageSizeMaterial: string;
  productSpecs: string;
  packageSpecs: string;
  rtsPackageSpecs?: string;
  supplyDate: string;
  supplyVolume: string;
  certificates: FileStub[];
  photos: FileStub[];
  approved: boolean; // all confirmations received
};

type Destination = "PIM" | "ERP" | "E‑commerce" | "POS";

type QueueItem = {
  qid: string;
  articleId: string;
  destinations: Destination[];
  status: "Queued" | "In progress" | "Completed" | "Failed";
  createdAt: string;
  message?: string;
};

const SEED: Article[] = [
  {
    id: "a1",
    ean: "4820000765432",
    title: "Шоколад молочний 85 г",
    brand: "Lemur",
    shelfLife: "12 міс.",
    productSizeMaterial: "Плитка 85 г, 150×70×8 мм",
    packageSizeMaterial: "Фольга + картон, 155×75×10 мм",
    productSpecs: "Енерг. цінність 530 ккал/100 г",
    packageSpecs: "Фольга + картон",
    rtsPackageSpecs: "Гофра Т‑23, короб 20 шт.",
    supplyDate: "2025-10-10",
    supplyVolume: "800/тиж",
    certificates: [{ id: "c1", name: "Сертифікат якості.pdf" }],
    photos: [{ id: "p1", name: "front.jpg" }, { id: "p2", name: "back.jpg" }],
    approved: true,
  },
  {
    id: "a2",
    ean: "4820000123456",
    title: "Печиво вівсяне 90 г",
    brand: "Nordic",
    shelfLife: "9 міс.",
    productSizeMaterial: "Діаметр 60 мм",
    packageSizeMaterial: "Флоу‑пак 90×150 мм; короб 24 шт.",
    productSpecs: "Вологість ≤14%",
    packageSpecs: "Плівка PP",
    rtsPackageSpecs: "Гофра Т‑24",
    supplyDate: "2025-10-05",
    supplyVolume: "1200/тиж",
    certificates: [{ id: "c2", name: "Декларація відповідності.pdf" }],
    photos: [{ id: "p3", name: "front.jpg" }],
    approved: true,
  },
  {
    id: "b1",
    ean: "5901234567890",
    title: "Батончик протеїновий 50 г",
    brand: "Best",
    shelfLife: "6 міс.",
    productSizeMaterial: "50 г",
    packageSizeMaterial: "Флоу‑пак 45×140 мм",
    productSpecs: "Протеїн 25 г/шт",
    packageSpecs: "PP/Alu",
    rtsPackageSpecs: "—",
    supplyDate: "2025-10-03",
    supplyVolume: "600/тиж",
    certificates: [{ id: "c3", name: "MSDS.pdf" }],
    photos: [{ id: "p4", name: "pack.jpg" }],
    approved: true,
  },
];

function Pill({ children, tone = "neutral" as "neutral" | "ok" | "warn" | "fail" }){
  const styles = {
    ok: "bg-emerald-100 text-emerald-800",
    warn: "bg-amber-100 text-amber-800",
    fail: "bg-rose-100 text-rose-800",
    neutral: "bg-slate-100 text-slate-700",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[tone]}`}>{children}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }){
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <div className="text-sm font-medium text-slate-700">{title}</div>
      {children}
    </div>
  );
}

export default function App(){
  const [articles, setArticles] = useState<Article[]>(SEED);
  const [selectedIds, setSelectedIds] = useState<string[]>([SEED[0].id]);
  const [destinations, setDestinations] = useState<Record<Destination, boolean>>({ PIM: true, ERP: true, "E‑commerce": true, POS: false });
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [payloadTab, setPayloadTab] = useState<"preview" | "mapping">("preview");

  const selected = useMemo(()=> articles.filter(a => selectedIds.includes(a.id)), [articles, selectedIds]);
  const allApproved = selected.every(a => a.approved);

  const preflight = useMemo(()=>{
    // simple checks for required fields per destination
    const required: Record<Destination, (keyof Article)[]> = {
      PIM: ["ean", "title", "brand", "productSpecs", "photos"],
      ERP: ["ean", "title", "brand", "shelfLife", "supplyDate", "supplyVolume"],
      "E‑commerce": ["ean", "title", "brand", "productSpecs", "packageSizeMaterial", "photos"],
      POS: ["ean", "title", "brand"],
    };

    const active = (Object.keys(destinations) as Destination[]).filter(d => destinations[d]);
    return selected.map(a => {
      const missing: string[] = [];
      for (const d of active){
        for (const k of required[d]){
          const v: any = (a as any)[k];
          const ok = Array.isArray(v) ? v.length>0 : Boolean(v && String(v).trim());
          if (!ok) missing.push(`${d}: ${k}`);
        }
      }
      return { id: a.id, title: a.title, missing };
    });
  }, [selected, destinations]);

  function toggleSelect(id: string){
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  function enqueue(){
    const active = (Object.keys(destinations) as Destination[]).filter(d => destinations[d]);
    const now = new Date().toISOString();
    const newItems: QueueItem[] = selected.map(a => ({
      qid: Math.random().toString(36).slice(2),
      articleId: a.id,
      destinations: active,
      status: "Queued",
      createdAt: now,
    }));
    setQueue(prev => [...newItems, ...prev]);
  }

  function advance(qid: string){
    setQueue(prev => prev.map(q => q.qid===qid ? ({
      ...q,
      status: q.status === "Queued" ? "In progress" : q.status === "In progress" ? "Completed" : q.status,
      message: q.status === "Queued" ? "Відправлено у шину інтеграцій" : q.status === "In progress" ? "Підтверджено зовнішньою системою" : q.message,
    }) : q));
  }

  function payloadFor(a: Article){
    const active = (Object.keys(destinations) as Destination[]).filter(d => destinations[d]);
    const base = {
      ean: a.ean,
      title: a.title,
      brand: a.brand,
      shelfLife: a.shelfLife,
      product: {
        sizeMaterial: a.productSizeMaterial,
        specs: a.productSpecs,
      },
      package: {
        sizeMaterial: a.packageSizeMaterial,
        specs: a.packageSpecs,
        rts: a.rtsPackageSpecs,
      },
      logistics: {
        firstSupplyDate: a.supplyDate,
        weeklyVolume: a.supplyVolume,
      },
      attachments: {
        certificates: a.certificates.map(f=>f.name),
        photos: a.photos.map(f=>f.name),
      }
    };
    const perDest = Object.fromEntries(active.map(d => [d, base]));
    return { articleId: a.id, destinations: active, data: perDest };
  }

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900">
      <div className="h-12 border-b border-slate-200 bg-white px-4 flex items-center">
        <div className="font-semibold">Manager</div>
        <div className="ml-auto text-sm text-slate-500">Додавання в чергу інтеграцій</div>
      </div>

      <div className="grid grid-cols-[360px,1fr] h-[calc(100vh-48px)]">
        {/* Left: approved articles */}
        <div className="border-r border-slate-200 bg-white p-4 space-y-3 overflow-auto">
          <div className="text-sm text-slate-500 mb-1">Затверджені артикули</div>
          <div className="rounded-xl border border-slate-200 divide-y">
            {articles.map(a => (
              <label key={a.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50">
                <input type="checkbox" checked={selectedIds.includes(a.id)} onChange={()=>toggleSelect(a.id)} />
                <div className="grow">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-slate-500">EAN: {a.ean} · Бренд: {a.brand}</div>
                </div>
                <Pill tone={a.approved?"ok":"warn"}>{a.approved?"всі підтвердження":"є зауваження"}</Pill>
              </label>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
            Обрано: {selected.length}. {allApproved ? "Готові до відправки." : "Є позиції без повного погодження."}
          </div>
        </div>

        {/* Right: destinations, preflight, payload, queue */}
        <div className="p-6 overflow-auto space-y-5">
          <Section title="Куди відправляємо?">
            <div className="grid grid-cols-4 gap-3 text-sm">
              {(Object.keys(destinations) as Destination[]).map(d => (
                <label key={d} className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 hover:bg-slate-50">
                  <input type="checkbox" checked={destinations[d]} onChange={()=>setDestinations(prev => ({...prev, [d]: !prev[d]}))} />
                  {d}
                </label>
              ))}
            </div>
          </Section>

          <Section title="Preflight перевірки (залежно від системи)">
            {selected.map(row => (
              <div key={row.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                <div className="font-medium mb-1">{row.title}</div>
                {preflight.find(p=>p.id===row.id)?.missing.length ? (
                  <ul className="list-disc pl-5 text-amber-700">
                    {preflight.find(p=>p.id===row.id)!.missing.map((m,i)=>(<li key={i}>Відсутнє: {m}</li>))}
                  </ul>
                ) : (
                  <div className="text-emerald-700">Усі необхідні поля присутні</div>
                )}
              </div>
            ))}
          </Section>

          <Section title="Payload / Mapping">
            <div className="flex items-center gap-2 text-sm">
              <button className={`rounded-xl px-3 py-1.5 ${payloadTab==='preview'? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`} onClick={()=>setPayloadTab('preview')}>JSON Preview</button>
              <button className={`rounded-xl px-3 py-1.5 ${payloadTab==='mapping'? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`} onClick={()=>setPayloadTab('mapping')}>Field Mapping</button>
            </div>
            {payloadTab==='preview' ? (
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-64">{JSON.stringify(selected.map(payloadFor), null, 2)}</pre>
            ) : (
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="font-semibold">Internal Field → PIM</div>
                <div className="font-semibold">ERP</div>
                <div className="font-semibold">E‑commerce</div>
                <div>ean → sku</div><div>ean → item_code</div><div>ean → gtin</div>
                <div>title → title</div><div>title → description_short</div><div>title → name</div>
                <div>brand → brand</div><div>brand → vendor</div><div>brand → brand</div>
                <div>product.sizeMaterial → attributes.sizeMaterial</div><div>—</div><div>attributes.dimensions</div>
                <div>package.sizeMaterial → packaging.sizeMaterial</div><div>—</div><div>packaging.dimensions</div>
                <div>shelfLife → shelf_life</div><div>—</div><div>—</div>
              </div>
            )}
          </Section>

          <div className="flex gap-2">
            <button className="rounded-2xl px-4 py-2 text-sm bg-emerald-600 text-white" onClick={enqueue} disabled={!allApproved || selected.length===0}>Додати в чергу</button>
            {!allApproved && <span className="text-sm text-amber-700">Деякі позиції ще не повністю погоджені</span>}
          </div>

          <Section title="Черга відправлень">
            {queue.length===0 ? (
              <div className="text-sm text-slate-500">Поки що порожньо</div>
            ) : (
              <div className="rounded-xl border border-slate-200 divide-y">
                {queue.map(q => (
                  <div key={q.qid} className="px-4 py-3 flex items-center gap-3 text-sm">
                    <div className="font-medium">{articles.find(a=>a.id===q.articleId)?.title}</div>
                    <div className="text-slate-500">→ {q.destinations.join(', ')}</div>
                    <div className="ml-auto flex items-center gap-2">
                      <Pill tone={q.status==='Completed'?'ok':q.status==='In progress'?'warn':'neutral'}>{q.status}</Pill>
                      {q.status!=='Completed' && <button className="rounded-xl px-3 py-1.5 hover:bg-slate-100" onClick={()=>advance(q.qid)}>{q.status==='Queued'? 'Старт' : 'Завершити'}</button>}
                    </div>
                    {q.message && <div className="text-xs text-slate-500">{q.message}</div>}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
