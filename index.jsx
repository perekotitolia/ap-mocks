import React, { useMemo, useState } from "react";

/**
 * Supplier Request Creator – mock UI
 * Supplier can create a request that contains one or more articles.
 * REQUIRED per article: EAN, Назва, Розгорнутий опис, Спрощена категорія
 * OPTIONAL: Фото, Сертифікати, Характеристики товару, Характеристики упаковки
 * Includes minimal validation, test data and ability to add/remove articles.
 */

type SimpleCategory = { id: string; name: string };
const SIMPLE_CATEGORIES: SimpleCategory[] = [
  { id: "cat_snacks", name: "Закуски / снеки" },
  { id: "cat_choco", name: "Шоколад / батончики" },
  { id: "cat_drinks", name: "Напої" },
  { id: "cat_bakery", name: "Випічка" },
];

type FileStub = { id: string; name: string };

type ArticleDraft = {
  id: string;
  ean: string;
  title: string;
  description: string;
  categoryId: string;
  productSpecs?: string;
  packageSpecs?: string;
  photos: FileStub[];
  certificates: FileStub[];
};

type Errors = Partial<Record<keyof ArticleDraft, string>>;

function required(v?: string) { return !v || !v.trim() ? "Обов'язкове поле" : ""; }

const seed: ArticleDraft[] = [
  {
    id: "a1",
    ean: "4820000123456",
    title: "Печиво вівсяне 90 г",
    description: "Вівсяне печиво з медом, маса 90 г. Без підсилювачів смаку.",
    categoryId: "cat_bakery",
    productSpecs: "Вологість ≤ 14%, білки 7 г, жири 12 г, вуглеводи 64 г",
    packageSpecs: "Флоу-пак 90×150 мм, 24 шт. у коробі",
    photos: [{ id: "p1", name: "pack_front.jpg" }],
    certificates: [{ id: "c1", name: "Декларація відп.pdf" }],
  },
  {
    id: "a2",
    ean: "4820000765432",
    title: "Шоколад молочний 85 г",
    description: "Какао-масло 30%, какао-порошок 18%, без пальмової олії.",
    categoryId: "cat_choco",
    productSpecs: "Маса нетто 85 г, енерг. цінність 530 ккал/100 г",
    packageSpecs: "Фольга + картон, короб 20 шт.",
    photos: [],
    certificates: [],
  },
];

const Pill = ({children}:{children: React.ReactNode}) => (
  <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-xs px-2 py-0.5">{children}</span>
);

function ArticleCard({ art, onChange, onRemove, idx }: {
  art: ArticleDraft;
  idx: number;
  onChange: (next: ArticleDraft) => void;
  onRemove: () => void;
}){
  const errs: Errors = {
    ean: required(art.ean),
    title: required(art.title),
    description: required(art.description),
    categoryId: required(art.categoryId),
  };

  const isValid = !Object.values(errs).some(Boolean);

  const fileBadge = (f: FileStub) => (
    <span key={f.id} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-sm">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
      {f.name}
    </span>
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Артикул #{idx+1}</div>
        <div className="flex items-center gap-2">
          <Pill>{isValid ? "Готово до відправки" : "Заповніть обов'язкові"}</Pill>
          <button onClick={onRemove} className="rounded-xl px-3 py-1.5 text-sm hover:bg-slate-100">Видалити</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <label className="block">
          <div className="text-sm text-slate-500 mb-1">EAN *</div>
          <input value={art.ean} onChange={e=>onChange({...art, ean:e.target.value})} placeholder="482..." className={"w-full rounded-xl border px-3 py-2 " + (errs.ean?"border-rose-300":"border-slate-200")} />
          {errs.ean && <div className="text-xs text-rose-600 mt-1">{errs.ean}</div>}
        </label>
        <label className="block col-span-3">
          <div className="text-sm text-slate-500 mb-1">Назва *</div>
          <input value={art.title} onChange={e=>onChange({...art, title:e.target.value})} className={"w-full rounded-xl border px-3 py-2 " + (errs.title?"border-rose-300":"border-slate-200")} />
          {errs.title && <div className="text-xs text-rose-600 mt-1">{errs.title}</div>}
        </label>
      </div>

      <label className="block">
        <div className="text-sm text-slate-500 mb-1">Розгорнутий опис товару *</div>
        <textarea value={art.description} onChange={e=>onChange({...art, description:e.target.value})} rows={4} className={"w-full rounded-xl border px-3 py-2 " + (errs.description?"border-rose-300":"border-slate-200")} />
        {errs.description && <div className="text-xs text-rose-600 mt-1">{errs.description}</div>}
      </label>

      <div className="grid grid-cols-3 gap-4">
        <label className="block">
          <div className="text-sm text-slate-500 mb-1">Спрощена категорія *</div>
          <select value={art.categoryId} onChange={e=>onChange({...art, categoryId:e.target.value})} className={"w-full rounded-xl border px-3 py-2 bg-white " + (errs.categoryId?"border-rose-300":"border-slate-200")}>
            <option value="">—</option>
            {SIMPLE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errs.categoryId && <div className="text-xs text-rose-600 mt-1">{errs.categoryId}</div>}
        </label>
        <label className="block">
          <div className="text-sm text-slate-500 mb-1">Характеристики товару (необов'язково)</div>
          <textarea value={art.productSpecs||""} onChange={e=>onChange({...art, productSpecs:e.target.value})} rows={3} className="w-full rounded-xl border px-3 py-2 border-slate-200" />
        </label>
        <label className="block">
          <div className="text-sm text-slate-500 mb-1">Характеристики упаковки (необов'язково)</div>
          <textarea value={art.packageSpecs||""} onChange={e=>onChange({...art, packageSpecs:e.target.value})} rows={3} className="w-full rounded-xl border px-3 py-2 border-slate-200" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-slate-500 mb-1">Фото (необов'язково)</div>
          <div className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600">Перетягніть файли сюди або натисніть, щоб вибрати</div>
          <div className="flex flex-wrap gap-2 mt-2">{art.photos.map(fileBadge)}</div>
        </div>
        <div>
          <div className="text-sm text-slate-500 mb-1">Сертифікати (необов'язково)</div>
          <div className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600">Перетягніть файли сюди або натисніть, щоб вибрати</div>
          <div className="flex flex-wrap gap-2 mt-2">{art.certificates.map(fileBadge)}</div>
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const [articles, setArticles] = useState<ArticleDraft[]>(seed);
  const [submitted, setSubmitted] = useState(false);

  const addArticle = () => setArticles(prev => ([...prev, {
    id: Math.random().toString(36).slice(2),
    ean: "",
    title: "",
    description: "",
    categoryId: "",
    productSpecs: "",
    packageSpecs: "",
    photos: [],
    certificates: [],
  }]));

  const removeArticle = (id: string) => setArticles(prev => prev.filter(a=>a.id!==id));
  const updateArticle = (id: string, next: ArticleDraft) => setArticles(prev => prev.map(a => a.id===id? next : a));

  const invalidCount = useMemo(()=>articles.reduce((acc, a)=>{
    const errs = [required(a.ean), required(a.title), required(a.description), required(a.categoryId)];
    return acc + (errs.some(Boolean) ? 1 : 0);
  }, 0), [articles]);

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900">
      <div className="h-12 border-b border-slate-200 bg-white px-4 flex items-center">
        <div className="font-semibold">Supplier</div>
        <div className="ml-auto text-sm text-slate-500">Створення заявки з артикулами</div>
      </div>

      <div className="p-6 space-y-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-sm">
          <Pill>Обов'язкові поля: EAN, Назва, Опис, Категорія</Pill>
          {invalidCount>0 && <span className="text-rose-600">Незаповнені артикули: {invalidCount}</span>}
        </div>

        {articles.map((art, idx) => (
          <ArticleCard key={art.id} art={art} idx={idx} onChange={(next)=>updateArticle(art.id, next)} onRemove={()=>removeArticle(art.id)} />
        ))}

        <div className="flex gap-2">
          <button onClick={addArticle} className="rounded-2xl px-4 py-2 text-sm hover:bg-slate-100">+ Додати артикул</button>
        </div>

        <div className="flex gap-2 pt-2">
          <button className="rounded-2xl px-4 py-2 text-sm bg-slate-900 text-white" disabled={invalidCount>0} onclick="location.href='./m-raw-requests.html'">Відправити заявку</button>
          <button className="rounded-2xl px-4 py-2 text-sm hover:bg-slate-100">Зберегти як чернетку</button>
        </div>

        {submitted && (
          <div className="text-sm text-emerald-700">Заявку відправлено. {articles.length} артикули(ів) на перевірці менеджером.</div>
        )}
      </div>
    </div>
  );
}
