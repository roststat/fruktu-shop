"use client";

import Link from "next/link";
import { Product, getDefaultQuantity } from "@/data/catalog";
import { useList } from "@/context/ListContext";

export default function ClearanceCard({ product }: { product: Product }) {
  const { getQuantity, addItem } = useList();
  const quantity = getQuantity(product.id);
  if (!product.clearance) return null;

  return (
    <div className="flex flex-col rounded-2xl border border-green-600/20 bg-card p-3 shadow-sm">
      <Link
        href={`/product/${product.id}`}
        className="flex aspect-square items-center justify-center rounded-xl bg-green-600/5 text-5xl"
      >
        {product.icon}
      </Link>
      <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
        🏷️ Зелёный ценник
      </span>
      <Link
        href={`/product/${product.id}`}
        className="mt-2 line-clamp-2 text-sm font-semibold hover:text-primary-dark"
      >
        {product.name}
      </Link>
      <p className="mt-1 text-xs text-muted">{product.clearance.reason}</p>
      <p className="mt-1 text-sm">
        <span className="font-bold text-green-700">
          {product.clearance.price} ₽
        </span>{" "}
        <span className="text-muted line-through">
          {product.price} ₽
        </span>{" "}
        / {product.unit}
      </p>

      <div className="mt-3">
        {quantity === 0 ? (
          <button
            onClick={() => addItem(product.id, getDefaultQuantity(product))}
            className="w-full rounded-full bg-green-600 px-3 py-2 text-sm font-semibold text-white"
          >
            В список
          </button>
        ) : (
          <p className="text-center text-sm font-bold text-green-700">
            В списке: {quantity} {product.unit}
          </p>
        )}
      </div>
    </div>
  );
}
