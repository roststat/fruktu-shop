"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useList } from "@/context/ListContext";
import { useAiAssistant } from "@/context/AiAssistantContext";
import {
  categories,
  products,
  getProductById,
  getRelatedProducts,
  getDefaultQuantity,
  getQuantityStep,
  formatQuantity,
  type Product,
} from "@/data/catalog";

const round = (n: number) => Math.round(n * 10) / 10;

interface ChatMessage {
  role: "assistant" | "user";
  text: string;
}

const HOUSEHOLD_TIPS = [
  { id: "toilet-paper", icon: "🧻", name: "Туалетная бумага" },
  { id: "napkins", icon: "🧽", name: "Бумажные полотенца" },
  { id: "trash-bags", icon: "🗑️", name: "Мешки для мусора" },
];

const INTRO_MESSAGE: ChatMessage = {
  role: "assistant",
  text:
    "Привет! Напишите, например: «Соберите ужин на 2 человек до 1000 ₽» или «Что нужно для борща?» — помогу подобрать продукты.",
};

export default function AiAssistant() {
  const { items, addItem } = useList();
  const { isOpen: open, openAssistant, closeAssistant } = useAiAssistant();
  const [mounted, setMounted] = useState(false);
  const [notedHousehold, setNotedHousehold] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO_MESSAGE]);
  const [chatInput, setChatInput] = useState("");
  const [pickerProduct, setPickerProduct] = useState<Product | null>(null);
  const [pickerQty, setPickerQty] = useState(0);
  const [replaceFrom, setReplaceFrom] = useState<Product | null>(null);
  const [pickerCategoryId, setPickerCategoryId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const recommendations = useMemo(() => {
    const inCartIds = new Set(items.map((i) => i.productId));
    const candidates = new Map<string, Product>();
    items.forEach((item) => {
      const product = getProductById(item.productId);
      if (!product) return;
      getRelatedProducts(product).forEach((related) => {
        if (!inCartIds.has(related.id)) candidates.set(related.id, related);
      });
    });
    return [...candidates.values()].slice(0, 4);
  }, [items]);

  const visibleHouseholdTips = HOUSEHOLD_TIPS.filter(
    (tip) => !notedHousehold.has(tip.id)
  );

  const badgeCount = recommendations.length + visibleHouseholdTips.length;

  const openPicker = (product: Product) => {
    setPickerProduct(product);
    setPickerQty(getDefaultQuantity(product));
  };

  const openReplacePicker = (product: Product) => {
    setReplaceFrom(product);
    setPickerCategoryId(product.categoryId);
  };

  const closeReplacePicker = () => {
    setReplaceFrom(null);
    setPickerCategoryId(null);
  };

  const confirmAdd = () => {
    if (!pickerProduct) return;
    addItem(pickerProduct.id, pickerQty);
    setPickerProduct(null);
    setReplaceFrom(null);
    setPickerCategoryId(null);
  };

  const handleToggleHousehold = (id: string) => {
    setNotedHousehold((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      {
        role: "assistant",
        text:
          "Это прототип помощника — пока я не подключён к настоящему ИИ. Скоро здесь появится умный подбор продуктов под ваш бюджет и рецепт. А пока выберите подходящие товары из подсказок выше или в каталоге 🙂",
      },
    ]);
    setChatInput("");
  };

  if (items.length === 0) return null;

  const pickerStep = pickerProduct ? getQuantityStep(pickerProduct) : 0;
  const pickerTotal = pickerProduct
    ? Math.round(pickerProduct.price * pickerQty)
    : 0;

  return (
    <>
      <button
        onClick={openAssistant}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7c5cff]/30 transition hover:shadow-xl"
      >
        <span className="text-lg" aria-hidden>
          ✨
        </span>
        <span className="hidden sm:inline">Рекомендации</span>
        {badgeCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-tomato px-1 text-xs font-bold text-white">
            {badgeCount}
          </span>
        )}
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 p-4 sm:items-end"
            onClick={closeAssistant}
          >
            <div
              className="relative flex max-h-[80vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-[#7c5cff] to-[#a78bfa] p-4 text-white">
                <span className="pointer-events-none absolute -right-4 -top-6 text-6xl opacity-20">
                  ✨
                </span>
                <div className="relative flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold">
                      <span className="flex items-center gap-1.5">
                        <span aria-hidden>✨</span> ИИ-помощник
                      </span>
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                        beta
                      </span>
                    </h2>
                    <p className="mt-0.5 text-xs text-white/80">
                      Подбираю то, что может понадобиться к вашему списку
                    </p>
                  </div>
                  <button
                    onClick={closeAssistant}
                    className="shrink-0 rounded-full p-1 text-white/80 hover:bg-white/10"
                    aria-label="Закрыть"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {(recommendations.length > 0 || visibleHouseholdTips.length > 0) && (
                  <div className="mb-4">
                    <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-muted">
                      <span aria-hidden>🪄</span> Возможно, вам пригодится
                    </p>
                    <div className="flex flex-col gap-2">
                      {recommendations.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 rounded-2xl border border-[#7c5cff]/15 bg-[#7c5cff]/5 p-2"
                        >
                          <span className="text-xl">{product.icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted">
                              {product.price} ₽ / {product.unit}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col gap-1">
                            <button
                              onClick={() => openPicker(product)}
                              className="rounded-full bg-[#7c5cff] px-3 py-1 text-xs font-bold text-white hover:bg-[#6a4ce0]"
                            >
                              + Добавить
                            </button>
                            <button
                              onClick={() => openReplacePicker(product)}
                              className="rounded-full bg-[#7c5cff]/10 px-3 py-1 text-xs font-bold text-[#7c5cff] hover:bg-[#7c5cff]/20"
                            >
                              🔄 Заменить
                            </button>
                          </div>
                        </div>
                      ))}

                      {visibleHouseholdTips.map((tip) => (
                        <div
                          key={tip.id}
                          className="flex items-center gap-3 rounded-2xl border border-dashed border-black/10 p-2"
                        >
                          <span className="text-xl">{tip.icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{tip.name}</p>
                            <p className="text-xs text-muted">
                              Часто забывают — нет в каталоге, но можно
                              добавить к заявке
                            </p>
                          </div>
                          <button
                            onClick={() => handleToggleHousehold(tip.id)}
                            className="shrink-0 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent hover:bg-accent/30"
                          >
                            Напомнить
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-muted">
                    <span aria-hidden>💬</span> Соберите заказ под бюджет или
                    рецепт
                  </p>
                  <div className="flex flex-col gap-2 rounded-2xl bg-background p-3">
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                          m.role === "assistant"
                            ? "self-start bg-white text-foreground shadow-sm"
                            : "self-end bg-[#7c5cff] text-white"
                        }`}
                      >
                        {m.role === "assistant" && (
                          <span className="mr-1" aria-hidden>
                            ✨
                          </span>
                        )}
                        {m.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-black/5 p-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendChat();
                  }}
                  placeholder="Например: ужин на 2 человек до 1000 ₽"
                  className="flex-1 rounded-full border border-black/10 px-4 py-2 text-sm focus:border-[#7c5cff] focus:outline-none"
                />
                <button
                  onClick={handleSendChat}
                  className="rounded-full bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] px-4 py-2 text-sm font-bold text-white"
                >
                  ➤
                </button>
              </div>

              {replaceFrom && (
                <div
                  className="absolute inset-0 z-10 flex flex-col bg-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-black/5 p-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted">Выбрать вместо</p>
                      <p className="truncate text-sm font-bold">
                        {replaceFrom.icon} {replaceFrom.name}
                      </p>
                    </div>
                    <button
                      onClick={closeReplacePicker}
                      className="shrink-0 rounded-full p-1 text-muted hover:bg-black/5"
                      aria-label="Закрыть"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex gap-2 overflow-x-auto border-b border-black/5 p-3 scrollbar-hide">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setPickerCategoryId(c.id)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          pickerCategoryId === c.id
                            ? "bg-[#7c5cff] text-white"
                            : "bg-[#7c5cff]/10 text-[#7c5cff]"
                        }`}
                      >
                        {c.icon} {c.name}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto p-3">
                    <div className="flex flex-col gap-2">
                      {products
                        .filter(
                          (p) =>
                            p.categoryId === pickerCategoryId &&
                            p.id !== replaceFrom.id
                        )
                        .map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 rounded-2xl border border-black/5 p-2"
                          >
                            <span className="text-xl">{product.icon}</span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted">
                                {product.price} ₽ / {product.unit}
                              </p>
                            </div>
                            <button
                              onClick={() => openPicker(product)}
                              className="shrink-0 rounded-full bg-[#7c5cff] px-3 py-1 text-xs font-bold text-white hover:bg-[#6a4ce0]"
                            >
                              Выбрать
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {pickerProduct && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 p-4"
                  onClick={() => setPickerProduct(null)}
                >
                  <div
                    className="w-full max-w-xs rounded-3xl bg-white p-4 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-3xl">{pickerProduct.icon}</span>
                      <div>
                        <p className="text-sm font-bold">{pickerProduct.name}</p>
                        <p className="text-xs text-muted">
                          {pickerProduct.price} ₽ / {pickerProduct.unit}
                        </p>
                      </div>
                    </div>
                    <div className="mb-4 flex items-center justify-center gap-4">
                      <button
                        onClick={() =>
                          setPickerQty((q) => Math.max(pickerStep, round(q - pickerStep)))
                        }
                        className="h-9 w-9 rounded-full bg-[#7c5cff]/10 text-lg font-bold text-[#7c5cff]"
                      >
                        −
                      </button>
                      <span className="min-w-16 text-center text-base font-bold">
                        {formatQuantity(pickerProduct, pickerQty)}
                      </span>
                      <button
                        onClick={() => setPickerQty((q) => round(q + pickerStep))}
                        className="h-9 w-9 rounded-full bg-[#7c5cff]/10 text-lg font-bold text-[#7c5cff]"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPickerProduct(null)}
                        className="flex-1 rounded-full border border-black/10 px-4 py-2 text-sm font-bold text-foreground hover:bg-black/5"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={confirmAdd}
                        className="flex-1 rounded-full bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] px-4 py-2 text-sm font-bold text-white leading-tight"
                      >
                        <span className="block">Добавить</span>
                        <span className="block text-xs font-semibold text-white/80">
                          {pickerTotal} ₽
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
