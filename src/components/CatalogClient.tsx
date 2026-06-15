"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { categories, products } from "@/data/catalog";
import ProductCard from "./ProductCard";

export default function CatalogClient() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState<string | null>(
    initialCategory
  );

  const filtered = activeCategory
    ? products.filter((p) => p.categoryId === activeCategory)
    : products;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-extrabold">Каталог</h1>

      <div
        className="sticky z-30 -mx-4 mb-6 border-b border-black/5 bg-background/95 px-4 py-2 backdrop-blur"
        style={{ top: "var(--header-height, 0px)" }}
      >
        <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              activeCategory === null
                ? "bg-primary text-white"
                : "bg-primary/10 text-primary-dark"
            }`}
          >
            Все товары
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                activeCategory === c.id
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary-dark"
              }`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>

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
