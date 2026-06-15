"use client";

import { useEffect, useRef, useState } from "react";
import { useList } from "@/context/ListContext";

export default function FloatingCartButton() {
  const { totalCount, openList } = useList();
  const [justAdded, setJustAdded] = useState(false);
  const prevCountRef = useRef(totalCount);

  useEffect(() => {
    if (totalCount > prevCountRef.current) {
      setJustAdded(true);
      const timer = setTimeout(() => setJustAdded(false), 1500);
      prevCountRef.current = totalCount;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = totalCount;
  }, [totalCount]);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
      <span
        className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-md transition-colors ${
          justAdded
            ? "bg-primary text-white"
            : "bg-white text-primary-dark"
        }`}
      >
        {justAdded ? "Добавлено ✓" : "Список"}
      </span>
      <button
        onClick={openList}
        aria-label="Открыть список покупок"
        className={`relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary bg-white text-4xl shadow-lg shadow-primary/20 transition hover:bg-primary/5 hover:shadow-xl ${
          justAdded ? "animate-cart-bump" : ""
        }`}
      >
        <span aria-hidden>🛒</span>
        {totalCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-white bg-tomato px-1 text-sm font-bold text-white">
            {totalCount}
          </span>
        )}
      </button>
    </div>
  );
}
