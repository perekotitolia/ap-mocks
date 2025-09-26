import React, { useMemo, useState } from "react";

/**
 * Cross‑Dept Approval – reviewer from another department
 * Context: Manager has processed supplier request and sent it for approval.
 * Reviewer can: see summary, manager's decisions, verify completeness,
 * approve, or request changes with a comment. Includes test data.
 */

type FileStub = { id: string; name: string };

type Article = {
  id: string;
  ean: string;
  title: string;
  brand: string;
  categories: { artName: string; eanCat: string; colorTaste: string };
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
  // Flags compiled by manager/checks
  checks: {
    completeness: "ok" | "warn" | "fail";
    riskNotes?: string[];
  };
};

type RequestPacket = {
  id: string;
  supplier: string;
  createdAt: string;
  manager: string;
  status: "На погодженні" | "Погоджено" | "Повернено на доробку";
  articles: Article[];
  managerComment: string;
};

const REQUESTS: RequestPacket[] = [
  {
    id: "REQ-2025-1097",
    supplier: "Supplier LTD",
    createdAt: "2025-09-18",
    manager: "О. Коваль",
    status: "На погодженні",
    managerComment:
      "Категорії підтверджені. Просимо погодити запуск: тарифи ок, документи повні.",
    articles: [
      {
        id: "a1",
        ean: "4820000765432",
        title: "Шоколад молочний 85 г",
        brand: "Lemur",
        categories: { artName: "Кондитерські/шоколад", eanCat: "EAN-13", colorTaste: "Молочний" },
        shelfLife: "12 міс.",
        productSizeMaterial: "Плитка 85 г, 150×70×8 мм; какао-масло/какао-порошок",
        packageSizeMaterial: "Фольга + картон, 155×75×10 мм; короб 20 шт.",
        productSpecs: "Енерг. цінність 530 ккал/100 г",
        packageSpecs: "Фольга + картон",
        rtsPackageSpecs: "Гофра Т‑23, короб 20 шт.",
        supplyDate: "2025-10-10",
        supplyVolume: "800/тиж",
        certificates: [{ id: "c1", name: "Сертифікат якості.pdf" }],
        photos: [{ id: "p1", name: "front.jpg" }, { id: "p2", name: "back.jpg" }],
        checks: { completeness: "ok", riskNotes: ["Алергени: молоко"] },
      },
      {
        id: "a2",
        ean: "4820000123456",
        title: "Печиво вівсяне 90 г",
        brand: "Nordic",
        categories: { artName: "Випічка/печиво", eanCat: "EAN-13", colorTaste: "Медове" },
        shelfLife: "9 міс.",
        productSizeMaterial: "Діаметр 60 мм; борошно/вівсяні пластівці/мед",
        packageSizeMaterial: "Флоу‑пак 90×150 мм; короб 24 шт.",
        productSpecs: "Вологість ≤14%",
        packageSpecs: "Плівка PP",
        rtsPackageSpecs: "Гофра Т‑24",
        supplyDate: "2025-10-05",
        supplyVolume: "1200/тиж",
        certificates: [{ id: "c2", name: "Декларація відповідності.pdf" }],
        photos: [],
        checks: { completeness: "warn", riskNotes: ["Немає фото з різних ракурсів"] },
      },
    ],
  },
  {
    id: "REQ-2025-1104",
    supplier: "Best Foods UA",
    createdAt: "2025-09-22",
    manager: "І. Романюк",
    status: "На погодженні",
    managerComment: "Додатково запросили MSDS для батончика.",
    articles: [
      {
        id: "b1",
        ean: "5901234567890",
        title: "Батончик протеїновий 50 г",
        brand: "Best",
        categories: { artName: "Кондитерські/батончики", eanCat: "EAN-13", colorTaste: "Ваніль" },
        shelfLife: "6 міс.",
        productSizeMaterial: "50 г; білковий концентрат/підсолоджувач",
        packageSizeMaterial: "Флоу‑пак 45×140 мм",
        productSpecs: "Протеїн 25 г/шт",
        packageSpecs: "PP/Alu",
        supplyDate: "2025-10-03",
        supplyVolume: "600/тиж",
        certificates: [],
        photos: [{ id: "p3", name: "pack.jpg" }],
        checks: { completeness: "fail", riskNotes: ["Відсутній MSDS", "Немає сертифіката екологічності"] },
      },
    ],
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

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-xs px-2 py-0.5">{children}</span>;
}

function FileChip({ f }: { f: FileStub }){
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-sm">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
      {f.name}
    </span>
  );
}

export default function App(){
  const [requests, setRequests] = useState<RequestPacket[]>(REQUESTS);
  const [selectedId, setSelectedId] = useState<string>(REQUESTS[0].id);
  const [approvalNotes, setApprovalNotes] = useState<string>("");

  const req = useMemo(()=> requests.find(r => r.id === selectedId)!, [requests, selectedId]);

  function approve(){
    setRequests(prev => prev.map(r => r.id===selectedId ? { ...r, status: "Погоджено" } : r));
    setApprovalNotes("");
  }
  function requestChanges(){
    setRequests(prev => prev.map(r => r.id===selectedId ? { ...r, status: "Повернено на доробку" } : r));
  }

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900">
      <div className="h-12 border-b border-slate-200 bg-white px-4 flex items-center">
        <div className="font-semibold">Approver</div>
        <div className="ml-auto text-sm text-slate-500">Перегляд та погодження заявки</div>
      </div>

      <div className="grid grid-cols-[360px,1fr] h-[calc(100vh-48px)]">
        {/* Left: list */}
        <div className="border-r border-slate-200 bg-white p-4 space-y-3 overflow-auto">
          <div className="text-sm text-slate-500 mb-1">Заявки на погодження</div>
          <div className="rounded-xl border border-slate-200 divide-y">
            {requests.map(r => (
              <button key={r.id} onClick={()=>setSelectedId(r.id)} className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${selectedId===r.id?"bg-slate-50":""}`}>
                <div className="flex items-center justify-between">
                  <div className="font-medium">{r.id}</div>
                  <Pill tone={r.status==="Погоджено"?"ok": r.status==="Повернено на доробку"?"warn":"neutral"}>{r.status}</Pill>
                </div>
                <div className="text-xs text-slate-500">{r.supplier} · {r.manager} · {r.createdAt}</div>
                <div className="mt-1 flex gap-2 text-xs">
                  <Badge>{r.articles.length} артикул(и)</Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: detail */}
        <div className="p-6 overflow-auto">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl font-semibold">{req.id}</div>
                <div className="text-slate-500">Постачальник: {req.supplier} · Менеджер: {req.manager} · {req.createdAt}</div>
              </div>
              <Pill tone={req.status==="Погоджено"?"ok": req.status==="Повернено на доробку"?"warn":"neutral"}>{req.status}</Pill>
            </div>

            {/* Manager comment */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <span className="font-medium">Коментар менеджера:</span> {req.managerComment || "—"}
            </div>

            {/* Articles accordion */}
            <div className="space-y-3">
              {req.articles.map((a, idx) => (
                <details key={a.id} open className="rounded-xl border border-slate-200">
                  <summary className="cursor-pointer list-none px-4 py-3 flex items-center gap-3">
                    <div className="font-medium grow">Артикул #{idx+1}: {a.title} <span className="text-slate-500">· EAN {a.ean}</span></div>
                    <Pill tone={a.checks.completeness}>{a.checks.completeness === "ok" ? "повно" : a.checks.completeness === "warn" ? "частково" : "неповно"}</Pill>
                  </summary>

                  <div className="px-4 pb-4 space-y-4">
                    {/* Categories */}
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <ReadField label="Категорія (ArtName)">{a.categories.artName}</ReadField>
                      <ReadField label="EAN (кат.)">{a.categories.eanCat}</ReadField>
                      <ReadField label="Колір/Смак">{a.categories.colorTaste}</ReadField>
                      <ReadField label="Бренд">{a.brand || "—"}</ReadField>
                    </div>

                    {/* Sizes/materials */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <ReadField label="Розміри та матеріал товару">{a.productSizeMaterial || "—"}</ReadField>
                      <ReadField label="Розміри та матеріал упаковки">{a.packageSizeMaterial || "—"}</ReadField>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <ReadField label="Характеристики товару">{a.productSpecs || "—"}</ReadField>
                      <ReadField label="Характеристики упаковки">{a.packageSpecs || "—"}</ReadField>
                      <ReadField label="RTS упаковка">{a.rtsPackageSpecs || "—"}</ReadField>
                    </div>

                    {/* Logistics */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <ReadField label="Дата поставки">{a.supplyDate || "—"}</ReadField>
                      <ReadField label="Обʼєм поставки">{a.supplyVolume || "—"}</ReadField>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Документи/фото</div>
                        <div className="flex flex-wrap gap-2">
                          {a.certificates.map(f => <FileChip key={f.id} f={f} />)}
                          {a.photos.map(f => <FileChip key={f.id} f={f} />)}
                          {(!a.certificates.length && !a.photos.length) && <span className="text-xs text-slate-400">— немає —</span>}
                        </div>
                      </div>
                    </div>

                    {/* Risks */}
                    {a.checks.riskNotes?.length ? (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
                        <div className="font-medium mb-1">Нотатки щодо ризиків</div>
                        <ul className="list-disc pl-5 space-y-1">
                          {a.checks.riskNotes.map((t, i)=> <li key={i}>{t}</li>)}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </details>
              ))}
            </div>

            {/* Approval box */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="text-sm text-slate-500">Коментар від вашого відділу (необов'язково, обов'язково при поверненні):</div>
              <textarea value={approvalNotes} onChange={(e)=>setApprovalNotes(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 min-h-[100px]" placeholder="Напишіть зауваження, умови погодження або причини повернення..." />
              <div className="flex gap-2">
                <button className="rounded-2xl px-4 py-2 text-sm bg-emerald-600 text-white" onClick={approve}>Погодити</button>
                <button className="rounded-2xl px-4 py-2 text-sm bg-rose-600 text-white" onClick={requestChanges} disabled={!approvalNotes.trim()}>Повернути на доробку</button>
                <button className="rounded-2xl px-4 py-2 text-sm hover:bg-slate-100">Зберегти як чернетку</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadField({ label, children }: { label: string; children: React.ReactNode }){
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 min-h-[42px]">{children}</div>
    </div>
  );
}
