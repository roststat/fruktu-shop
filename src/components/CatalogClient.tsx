"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  categories,
  products,
  getCategoryById,
  productMatchesCategory,
} from "@/data/catalog";
import ProductCard from "./ProductCard";

export default function CatalogClient() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState<string | null>(
    initialCategory
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  const activeCategoryObj = activeCategory
    ? getCategoryById(activeCategory)
    : null;

  const filtered = activeCategory
    ? products.filter((p) => productMatchesCategory(p, activeCategory))
    : products;

  const selectCategory = (id: string | null) => {
    setActiveCategory(id);
    setPickerOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-extrabold">Каталог</h1>

      <div
        className="sticky z-30 -mx-4 mb-6 border-b border-black/5 bg-background/95 px-4 py-2 backdrop-blur"
        style={{ top: "var(--header-height, 0px)" }}
      >
        <div className="flex items-center gap-2">
          <span className="flex-1 truncate rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
            {activeCategoryObj
              ? `${activeCategoryObj.icon} ${activeCategoryObj.name}`
              : "Все товары"}
          </span>
          <button
            onClick={() => setPickerOpen(true)}
            aria-label="Выбрать категорию"
            className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-primary-dark"
          >
            <span aria-hidden>☰</span>
            <span className="hidden sm:inline">Категории</span>
          </button>
        </div>
      </div>

      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-t-3xl bg-white p-4 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Категории</h2>
              <button
                onClick={() => setPickerOpen(false)}
                aria-label="Закрыть"
                className="text-xl text-muted"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => selectCategory(null)}
                className={`rounded-xl px-3 py-2 text-left text-sm font-semibold ${
                  activeCategory === null
                    ? "bg-primary text-white"
                    : "hover:bg-primary/10 text-primary-dark"
                }`}
              >
                Все товары
              </button>
              {categories.map((c) => (
                <div key={c.id}>
                  <button
                    onClick={() => selectCategory(c.id)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold ${
                      activeCategory === c.id
                        ? "bg-primary text-white"
                        : "hover:bg-primary/10 text-primary-dark"
                    }`}
                  >
                    {c.icon} {c.name}
                  </button>
                  {c.subcategories && c.subcategories.length > 0 && (
                    <div className="ml-4 flex flex-col gap-1 border-l border-black/5 pl-2">
                      {c.subcategories.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => selectCategory(s.id)}
                          className={`rounded-xl px-3 py-2 text-left text-sm font-medium ${
                            activeCategory === s.id
                              ? "bg-primary text-white"
                              : "hover:bg-primary/10 text-muted"
                          }`}
                        >
                          {s.icon} {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-muted">
          В этой категории пока нет товаров.
        </p>
      )}
    </div>
  );
}
