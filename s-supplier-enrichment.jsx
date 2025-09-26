import React, { useMemo, useState } from "react";

/**
 * Supplier – Complete Missing Details after Manager review (updated)
 * Change request:
 * - REMOVE sales forecast from supplier responsibilities
 * - ADD required fields for size & material descriptions of product and packaging
 */

type ManagerDecision = {
  artId: string;
  categories: { artName: string; eanCat: string; colorTaste: string };
  comment: string;
  required: Array<keyof ArticleForm>;
};

type FileStub = { id: string; name: string };

type ArticleForm = {
  id: string;
  ean: string;
  title: string;
  brand: string;
  shelfLife: string; // e.g. "12 міс."
  productSpecs: string; // інші характеристики товару
  packageSpecs: string; // інші характеристики упаковки
  rtsPackageSpecs: string;
  // new: explicit size/material breakdown
  productSizeMaterial: string; // розміри та матеріали товару
  packageSizeMaterial: string; // розміри та матеріали упаковки
  supplyDate: string; // YYYY-MM-DD
  supplyVolume: string; // e.g. "1200/міс"
  photos: FileStub[];
  certificates: FileStub[];
};

const seedArticles: ArticleForm[] = [
  {
    id: "a1",
    ean: "4820000123456",
    title: "Печиво вівсяне 90 г",
    brand: "",
    shelfLife: "",
    productSpecs: "",
    packageSpecs: "",
    rtsPackageSpecs: "",
    productSizeMaterial: "", // нове поле
    packageSizeMaterial: "", // нове поле
    supplyDate: "",
    supplyVolume: "",
    photos: [],
    certificates: [],
  },
  {
    id: "a2",
    ean: "4820000765432",
    title: "Шоколад молочний 85 г",
    brand: "Lemur",
    shelfLife: "12 міс.",
    productSpecs: "Маса нетто 85 г; енерг. цінність 530 ккал/100 г",
    packageSpecs: "Фольга + картон",
    rtsPackageSpecs: "Короб 20 шт., гофра Т-23",
    productSizeMaterial: "Плитка 85 г, 150×70×8 мм; какао-масло/какао-порошок",
    packageSizeMaterial: "Фольга + картон, 155×75×10 мм",
    supplyDate: "2025-10-10",
    supplyVolume: "800/тиж",
    photos: [{ id: "p1", name: "front.jpg" }],
    certificates: [],
  },
];

const decisions: ManagerDecision[] = [
  {
    artId: "a1",
    categories: { artName: "Випічка/печиво", eanCat: "EAN-13", colorTaste: "Медове" },
    comment: "Підтвердили категорію як випічка. Для старту потрібні бренд, сертифікат якості та розміри/матеріали.",
    required: [
      "brand",
      "shelfLife",
      "productSpecs",
      "packageSpecs",
      "productSizeMaterial",
      "packageSizeMaterial",
      "certificates",
    ],
  },
  {
    artId: "a2",
    categories: { artName: "Кондитерські/шоколад", eanCat: "EAN-13", colorTaste: "Молочний" },
    comment: "Ок по категорії. Уточніть дату наступної поставки та параметри упаковки (розмір/матеріал).",
    required: ["supplyDate", "supplyVolume", "packageSizeMaterial"],
  },
];

const Pill = ({ children, tone = "neutral" as "neutral" | "ok" | "warn" }) => (
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

function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm text-slate-500 mb-1 flex items-center gap-2">
        <span>{label}</span>
        {required && <Pill tone="warn">обов'язково</Pill>}
      </div>
      <div className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 min-h-[42px]">
        {children}
      </div>
    </label>
  );
}

export default function App() {
  const [articles, setArticles] = useState<ArticleForm[]>(seedArticles);
  const [submitted, setSubmitted] = useState(false);

  const merged = useMemo(() =>
    articles.map(a => ({
      form: a,
      decision: decisions.find(d => d.artId === a.id)!,
    })),
  [articles]);

  function update(id: string, patch: Partial<ArticleForm>) {
    setArticles(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)));
  }

  function isFilled(id: string, key: keyof ArticleForm) {
    const a = articles.find(x => x.id === id)!;
    const v = a[key] as any;
    if (Array.isArray(v)) return v.length > 0;
    return Boolean(v && String(v).trim());
  }

  const invalidCount = useMemo(() =>
    merged.reduce((acc, row) => {
      const req = row.decision.required;
      const missing = req.filter(k => !isFilled(row.form.id, k));
      return acc + (missing.length ? 1 : 0);
    }, 0),
  [merged]);

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900">
      <div className="h-12 border-b border-slate-200 bg-white px-4 flex items-center">
        <div className="font-semibold">Supplier</div>
        <div className="ml-auto text-sm text-slate-500">Дозаповнення інформації за коментарями менеджера</div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">
            Менеджер зафіксував категорії та список обов'язкових полів. Заповніть відсутні дані (замість прогнозів продажів — докладні розміри й матеріали товару та упаковки).
          </div>
        </div>

        {merged.map(({ form, decision }, idx) => {
          const requiredSet = new Set(decision.required);
          const checklist = decision.required.map(k => ({ key: k, ok: isFilled(form.id, k) }));

          return (
            <div key={form.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
              {/* Header with categories & comment */}
              <div className="flex flex-wrap items-start gap-4">
                <div className="grow min-w-[260px]">
                  <div className="text-lg font-semibold">Артикул #{idx + 1}: {form.title}</div>
                  <div className="text-slate-500 text-sm">EAN: {form.ean}</div>
                  <div className="text-slate-500 text-sm">Категорії: {decision.categories.artName} • {decision.categories.eanCat} • {decision.categories.colorTaste}</div>
                </div>
                <div className="max-w-[520px] text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <span className="font-medium">Коментар менеджера:</span> {decision.comment}
                </div>
              </div>

              {/* Checklist */}
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-sm text-slate-500 mb-2">Обов'язково до заповнення:</div>
                <div className="flex flex-wrap gap-2">
                  {checklist.map(item => (
                    <span key={String(item.key)} className={
                      "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs border " +
                      (item.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-800")
                    }>
                      {item.ok ? "✓" : "•"} {String(item.key)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-3 gap-4">
                <Field label="Бренд" required={requiredSet.has("brand")}>
                  <input className="w-full bg-transparent outline-none" value={form.brand} onChange={(e)=>update(form.id,{brand:e.target.value})} />
                </Field>
                <Field label="Термін придатності" required={requiredSet.has("shelfLife")}>
                  <input className="w-full bg-transparent outline-none" value={form.shelfLife} onChange={(e)=>update(form.id,{shelfLife:e.target.value})} placeholder="12 міс." />
                </Field>
                <div />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Фізичні характеристики товара" required={requiredSet.has("productSpecs")}>
                  <textarea className="w-full bg-transparent outline-none" rows={3} value={form.productSpecs} onChange={(e)=>update(form.id,{productSpecs:e.target.value})} />
                </Field>
                <Field label="Фізичні характеристики упаковки" required={requiredSet.has("packageSpecs")}>
                  <textarea className="w-full bg-transparent outline-none" rows={3} value={form.packageSpecs} onChange={(e)=>update(form.id,{packageSpecs:e.target.value})} />
                </Field>
                <Field label="Фізичні характеристики rts упаковки" required={requiredSet.has("rtsPackageSpecs")}>
                  <textarea className="w-full bg-transparent outline-none" rows={3} value={form.rtsPackageSpecs} onChange={(e)=>update(form.id,{rtsPackageSpecs:e.target.value})} />
                </Field>
              </div>

              {/* NEW explicit size/material fields */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Розміри та матеріал товару" required={requiredSet.has("productSizeMaterial")}>
                  <textarea className="w-full bg-transparent outline-none" rows={3} value={form.productSizeMaterial} onChange={(e)=>update(form.id,{productSizeMaterial:e.target.value})} placeholder="напр. 150×70×8 мм; інгредієнти/матеріали" />
                </Field>
                <Field label="Розміри та матеріал упаковки" required={requiredSet.has("packageSizeMaterial")}>
                  <textarea className="w-full bg-transparent outline-none" rows={3} value={form.packageSizeMaterial} onChange={(e)=>update(form.id,{packageSizeMaterial:e.target.value})} placeholder="напр. короб 20 шт., 160×80×12 мм; картон/фольга" />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Дата поставки" required={requiredSet.has("supplyDate")}>
                  <input type="date" className="w-full bg-transparent outline-none" value={form.supplyDate} onChange={(e)=>update(form.id,{supplyDate:e.target.value})} />
                </Field>
                <Field label="Обʼєм поставки" required={requiredSet.has("supplyVolume")}>
                  <input className="w-full bg-transparent outline-none" value={form.supplyVolume} onChange={(e)=>update(form.id,{supplyVolume:e.target.value})} placeholder="наприклад, 1200/міс" />
                </Field>
                <Field label="Сертифікати" required={requiredSet.has("certificates")}>
                  <div className="flex flex-wrap gap-2">
                    {form.certificates.map(f => (
                      <span key={f.id} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                        {f.name}
                      </span>
                    ))}
                    <button className="rounded-xl border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-600">+ Додати</button>
                  </div>
                </Field>
              </div>

              <div>
                <div className="text-sm text-slate-500 mb-1">Фото (за потреби менеджера)</div>
                <div className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600">Перетягніть файли сюди або натисніть, щоб вибрати</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.photos.map(f => (
                    <span key={f.id} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-sm">📷 {f.name}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex gap-2">
          <button disabled={invalidCount>0} onClick={()=>setSubmitted(true)} className={
            "rounded-2xl px-4 py-2 text-sm " + (invalidCount>0?"bg-slate-300 text-white":"bg-slate-900 text-white")
          }>Надіслати на повторну перевірку</button>
          {invalidCount>0 && <div className="text-sm text-rose-600">Є артикули з незаповненими обов'язковими полями</div>}
        </div>

        {submitted && (
          <div className="text-sm text-emerald-700">Дані надіслані. Менеджер повідомить про результат перевірки.</div>
        )}
      </div>
    </div>
  );
}
