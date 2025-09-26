import React, { useMemo, useState } from "react";

/**
 * Manager – Post‑Feedback Fix
 * Context: після коментарів від інших департаментів менеджер:
 * 1) бачить зауваження по кожному артикулу;
 * 2) вирішує, хто дописує відсутні дані: менеджер сам або постачальник;
 * 3) редагує поля (якщо бере на себе) або формує запит постачальнику з чек‑лістом;
 * 4) відправляє на повторне погодження або повертає постачальнику.
 */

type FileStub = { id: string; name: string };

type Issue = {
  id: string;
  label: string; // human‑readable requirement
  field: keyof Article; // what it maps to in the article
  severity: "warn" | "block"; // comment level from departments
  owner: "supplier" | "manager"; // who should provide now
};

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
  issues: Issue[]; // outstanding items after cross‑dept review
};

type Packet = {
  id: string;
  supplier: string;
  status: "Очікує доповнення" | "Готово до повторного погодження" | "Повернено постачальнику";
  articles: Article[];
  feedbackSummary: string; // summary from other departments
};

const SEED: Packet = {
  id: "REQ-2025-1097",
  supplier: "Supplier LTD",
  status: "Очікує доповнення",
  feedbackSummary:
    "QA: потрібні фото з 4 ракурсів для печива. HSE: для батончика MSDS обов'язковий. Purchasing: уточнити гофру для шоколаду.",
  articles: [
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
      rtsPackageSpecs: "",
      supplyDate: "2025-10-10",
      supplyVolume: "800/тиж",
      certificates: [{ id: "c1", name: "Сертифікат якості.pdf" }],
      photos: [{ id: "p1", name: "front.jpg" }, { id: "p2", name: "back.jpg" }],
      issues: [
        { id: "i1", label: "Вказати тип гофри для RTS упаковки", field: "rtsPackageSpecs", severity: "warn", owner: "manager" },
      ],
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
      photos: [],
      issues: [
        { id: "i2", label: "Фото з 4 ракурсів (фронт/тил/бік/у коробі)", field: "photos", severity: "block", owner: "supplier" },
      ],
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
      rtsPackageSpecs: "",
      supplyDate: "2025-10-03",
      supplyVolume: "600/тиж",
      certificates: [],
      photos: [{ id: "p3", name: "pack.jpg" }],
      issues: [
        { id: "i3", label: "Надати MSDS (декларацію безпеки)", field: "certificates", severity: "block", owner: "supplier" },
      ],
    },
  ],
};

function Pill({ children, tone = "neutral" as "neutral" | "ok" | "warn" | "fail" }){
  const styles = {
    ok: "bg-emerald-100 text-emerald-800",
    warn: "bg-amber-100 text-amber-800",
    fail: "bg-rose-100 text-rose-800",
    neutral: "bg-slate-100 text-slate-700",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[tone]}`}>{children}</span>;
}

function Chip({ children }: { children: React.ReactNode }){
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
  const [packet, setPacket] = useState<Packet>(SEED);
  const [selectedArtId, setSelectedArtId] = useState<string>(SEED.articles[0].id);
  const [managerNote, setManagerNote] = useState<string>("");

  const art = useMemo(()=> packet.articles.find(a=>a.id===selectedArtId)!, [packet, selectedArtId]);

  const readyCount = useMemo(()=> packet.articles.filter(a => a.issues.length === 0).length, [packet]);

  function updateArticle(patch: Partial<Article>){
    setPacket(prev => ({
      ...prev,
      articles: prev.articles.map(a => a.id===selectedArtId ? { ...a, ...patch } : a)
    }));
  }

  function resolveIssue(issueId: string){
    setPacket(prev => ({
      ...prev,
      articles: prev.articles.map(a => a.id===selectedArtId ? { ...a, issues: a.issues.filter(i=>i.id!==issueId) } : a)
    }));
  }

  function reassignIssue(issueId: string, owner: Issue["owner"]){
    setPacket(prev => ({
      ...prev,
      articles: prev.articles.map(a => a.id===selectedArtId ? { ...a, issues: a.issues.map(i=> i.id===issueId ? { ...i, owner } : i) } : a)
    }));
  }

  function sendBackToSupplier(){
    setPacket(prev => ({ ...prev, status: "Повернено постачальнику" }));
  }
  function sendForReapproval(){
    setPacket(prev => ({ ...prev, status: "Готово до повторного погодження" }));
  }

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900">
      <div className="h-12 border-b border-slate-200 bg-white px-4 flex items-center">
        <div className="font-semibold">Manager</div>
        <div className="ml-auto text-sm text-slate-500">Допис даних або повернення постачальнику</div>
      </div>

      <div className="grid grid-cols-[360px,1fr] h-[calc(100vh-48px)]">
        {/* Left: articles & status */}
        <div className="border-r border-slate-200 bg-white p-4 space-y-3 overflow-auto">
          <div className="text-sm text-slate-500">Заявка {packet.id} · {packet.supplier}</div>
          <div className="flex items-center gap-2 text-sm">
            <Pill tone={packet.status==="Готово до повторного погодження"?"ok": packet.status==="Повернено постачальнику"?"warn":"neutral"}>{packet.status}</Pill>
            <Chip>{readyCount}/{packet.articles.length} артикули без зауважень</Chip>
          </div>

          <div className="rounded-xl border border-slate-200 divide-y mt-3">
            {packet.articles.map(a => (
              <button key={a.id} onClick={()=>setSelectedArtId(a.id)} className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${selectedArtId===a.id?"bg-slate-50":""}`}>
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-slate-500">EAN: {a.ean}</div>
                <div className="mt-1 flex gap-2 text-xs">
                  {a.issues.length>0 ? <Pill tone={a.issues.some(i=>i.severity==='block')?"fail":"warn"}>{a.issues.length} невирішені</Pill> : <Pill tone="ok">✓ готово</Pill>}
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm mt-3">
            <div className="font-medium mb-1">Підсумок коментарів</div>
            {packet.feedbackSummary}
          </div>
        </div>

        {/* Right: editor */}
        <div className="p-6 overflow-auto">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5 max-w-5xl">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl font-semibold">{art.title}</div>
                <div className="text-slate-500">EAN: {art.ean} · Бренд: {art.brand || "—"}</div>
              </div>
              <div className="text-sm text-slate-500">ID: {art.id}</div>
            </div>

            {/* Outstanding issues */}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-sm text-slate-500 mb-2">Невистачає:</div>
              {art.issues.length ? (
                <div className="space-y-2">
                  {art.issues.map(isu => (
                    <div key={isu.id} className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-slate-200">
                      <Pill tone={isu.severity==='block'?"fail":"warn"}>{isu.severity==='block'?"критично":"потрібно"}</Pill>
                      <span className="text-sm">{isu.label}</span>
                      <span className="ml-auto text-xs text-slate-500">Відповідальний:</span>
                      <select value={isu.owner} onChange={(e)=>reassignIssue(isu.id, e.target.value as any)} className="rounded-lg border border-slate-200 px-2 py-1 text-sm bg-white">
                        <option value="manager">менеджер</option>
                        <option value="supplier">постачальник</option>
                      </select>
                      <button className="rounded-xl px-3 py-1.5 text-sm hover:bg-slate-100" onClick={()=>resolveIssue(isu.id)}>Позначити виконаним</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-emerald-700">Зауважень немає</div>
              )}
            </div>

            {/* Editable fields (менеджер може дописати тут) */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="RTS упаковка">
                <input className="w-full bg-transparent outline-none" value={art.rtsPackageSpecs||""} onChange={(e)=>updateArticle({ rtsPackageSpecs: e.target.value })} placeholder="напр. Гофра Т‑23, короб 20 шт." />
              </Field>
              <Field label="Дата поставки">
                <input type="date" className="w-full bg-transparent outline-none" value={art.supplyDate} onChange={(e)=>updateArticle({ supplyDate: e.target.value })} />
              </Field>
              <Field label="Обʼєм поставки">
                <input className="w-full bg-transparent outline-none" value={art.supplyVolume} onChange={(e)=>updateArticle({ supplyVolume: e.target.value })} />
              </Field>
              <Field label="Сертифікати">
                <div className="flex flex-wrap gap-2">
                  {art.certificates.map(f => <FileChip key={f.id} f={f} />)}
                  <button className="rounded-xl border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-600">+ Додати</button>
                </div>
              </Field>
              <Field label="Фото">
                <div className="flex flex-wrap gap-2">
                  {art.photos.map(f => <FileChip key={f.id} f={f} />)}
                  <button className="rounded-xl border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-600">+ Додати</button>
                </div>
              </Field>
            </div>

            {/* Manager note for supplier */}
            <div>
              <div className="text-sm text-slate-500 mb-1">Коментар постачальнику (опційно)</div>
              <textarea value={managerNote} onChange={(e)=>setManagerNote(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 min-h-[90px]" placeholder="Опишіть, що саме потрібно дозаповнити та у якому форматі (наприклад, 4 фото: фронт/тил/бік/у коробі; MSDS у PDF)..." />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="rounded-2xl px-4 py-2 text-sm bg-emerald-600 text-white" onClick={sendForReapproval} disabled={packet.articles.some(a=>a.issues.length>0)}>Надіслати на повторне погодження</button>
              <button className="rounded-2xl px-4 py-2 text-sm bg-rose-600 text-white" onClick={sendBackToSupplier}>Повернути постачальнику</button>
              <button className="rounded-2xl px-4 py-2 text-sm hover:bg-slate-100">Зберегти як чернетку</button>
            </div>

            <div className="text-xs text-slate-500">Примітка: кнопка повторного погодження активна лише коли немає невирішених зауважень.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }){
  return (
    <label className="block">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 min-h-[42px]">{children}</div>
    </label>
  );
}
