"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useList } from "@/context/ListContext";
import { useAiAssistant } from "@/context/AiAssistantContext";
import { getProductById, getCartProductById, formatQuantity, getQuantityStep } from "@/data/catalog";

const round = (n: number) => Math.round(n * 10) / 10;

const FREE_DELIVERY_THRESHOLD = 3000;
const DELIVERY_COST = 300;
const FREE_DELIVERY_WEIGHT_LIMIT = 15;

const SHOP_PHONE = "79790474734";

export default function ListDrawer() {
  const {
    items,
    isOpen,
    closeList,
    setQuantity,
    totalPrice,
    totalCount,
    totalWeight,
    removedItems,
    restoreItem,
    clearRemoved,
  } = useList();
  const router = useRouter();
  const [showRemoved, setShowRemoved] = useState(false);
  const [step, setStep] = useState<"list" | "checkout">("list");
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState(false);
  const [phoneRequested, setPhoneRequested] = useState(false);
  const { openAssistant } = useAiAssistant();

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isOverWeightLimit = totalWeight > FREE_DELIVERY_WEIGHT_LIMIT;
  const deliveryCost =
    items.length === 0
      ? 0
      : isOverWeightLimit
        ? DELIVERY_COST
        : totalPrice >= FREE_DELIVERY_THRESHOLD
          ? 0
          : DELIVERY_COST;
  const grandTotal = totalPrice + deliveryCost;

  const handleClose = () => {
    closeList();
    setStep("list");
    setPhoneRequested(false);
  };

  const buildMessage = () => {
    const lines = items.map((item) => {
      const entry = getCartProductById(item.productId);
      if (!entry) return null;
      const label = entry.isClearance ? " (зелёный ценник)" : "";
      return `• ${entry.product.name}${label} — ${formatQuantity(entry.product, item.quantity)}`;
    });
    return [
      "Список покупок «Схожу на рынок»:",
      ...lines.filter((l): l is string => Boolean(l)),
      "",
      `Адрес доставки: ${address.trim()}`,
      `Ориентировочная сумма: ${totalPrice} ₽`,
    ].join("\n");
  };

  const handleSend = (channel: "telegram" | "max" | "whatsapp") => {
    if (!address.trim()) {
      setAddressError(true);
      return;
    }
    setAddressError(false);
    const text = encodeURIComponent(buildMessage());
    const urls: Record<typeof channel, string> = {
      telegram: `https://t.me/share/url?text=${text}`,
      whatsapp: `https://wa.me/${SHOP_PHONE}?text=${text}`,
      max: `https://max.ru/share?text=${text}`,
    };
    window.open(urls[channel], "_blank");
  };

  const goToClearance = () => {
    handleClose();
    router.push("/catalog");
  };

  const handlePhoneRequest = () => {
    if (!address.trim()) {
      setAddressError(true);
      return;
    }
    setAddressError(false);
    setPhoneRequested(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div
        className="absolute inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-black/5 p-4">
          <div className="flex items-center gap-2">
            {step === "checkout" && (
              <button
                onClick={() => setStep("list")}
                className="rounded-[10px] p-1 text-muted hover:bg-black/5"
                aria-label="Назад"
              >
                ←
              </button>
            )}
            <h2 className="text-lg font-bold">
              {step === "list" ? "Мой список" : "Оформление"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {step === "list" && removedItems.length > 0 && (
              <button
                onClick={() => setShowRemoved((v) => !v)}
                className="rounded-[10px] bg-black/5 px-3 py-1 text-xs font-semibold text-muted hover:bg-black/10"
              >
                Удалённые ({removedItems.length})
              </button>
            )}
            <button
              onClick={handleClose}
              className="rounded-[10px] p-1 text-muted hover:bg-black/5"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
        </div>

        {step === "list" && showRemoved && removedItems.length > 0 && (
          <div className="border-b border-black/5 bg-background p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-muted">
                Недавно удалённые
              </p>
              <button
                onClick={() => {
                  clearRemoved();
                  setShowRemoved(false);
                }}
                className="text-xs text-muted underline hover:text-primary-dark"
              >
                Очистить
              </button>
            </div>
            <ul className="flex flex-col gap-2">
              {removedItems.map((item) => {
                const product = getProductById(item.productId);
                if (!product) return null;
                return (
                  <li
                    key={item.productId}
                    className="flex items-center gap-3 rounded-[10px] border border-black/5 bg-white p-2"
                  >
                    <span className="text-xl">{product.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted">
                        {formatQuantity(product, item.quantity)}
                      </p>
                    </div>
                    <button
                      onClick={() => restoreItem(item.productId)}
                      className="shrink-0 rounded-[10px] bg-primary/10 px-3 py-1 text-xs font-bold text-primary-dark hover:bg-primary/20"
                    >
                      Вернуть
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {step === "list" ? (
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted">
                <span className="text-4xl">🧺</span>
                <p>Список пока пуст.</p>
                <p className="text-sm">
                  Добавляйте товары из каталога — мы сходим на рынок и купим
                  всё для вас.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {items.map((item) => {
                  const entry = getCartProductById(item.productId);
                  if (!entry) return null;
                  const { product, price, isClearance } = entry;
                  const step = getQuantityStep(product);
                  const itemPrice = Math.round(price * item.quantity);
                  return (
                    <li
                      key={item.productId}
                      className={`flex items-center gap-3 rounded-[10px] border p-3 ${
                        isClearance
                          ? "border-green-600/20 bg-green-600/5"
                          : "border-black/5"
                      }`}
                    >
                      <span className="text-2xl">{product.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{product.name}</p>
                        {isClearance && (
                          <span className="mb-0.5 inline-flex w-fit items-center gap-1 rounded-[10px] bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            🏷️ Зелёный ценник
                          </span>
                        )}
                        <p className="text-xs text-muted">
                          {price} ₽ / {product.unit} · {itemPrice} ₽
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setQuantity(item.productId, round(item.quantity - step))
                          }
                          className="h-7 w-7 rounded-[10px] bg-primary/10 text-primary-dark"
                        >
                          −
                        </button>
                        <span className="w-12 text-center text-sm font-semibold">
                          {formatQuantity(product, item.quantity)}
                        </span>
                        <button
                          onClick={() =>
                            setQuantity(item.productId, round(item.quantity + step))
                          }
                          className="h-7 w-7 rounded-[10px] bg-primary/10 text-primary-dark"
                        >
                          +
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {items.length > 0 && (
              <button
                onClick={openAssistant}
                className="relative mt-3 flex w-full items-center justify-center gap-2 overflow-hidden rounded-[10px] bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] px-4 py-3 text-sm font-bold text-white shadow-sm shadow-[#7c5cff]/30 hover:shadow-md"
              >
                <span className="pointer-events-none absolute -right-2 -top-3 text-4xl opacity-20" aria-hidden>
                  ✨
                </span>
                <span aria-hidden>✨</span> Что ещё может понадобиться?
              </button>
            )}

            <button
              onClick={goToClearance}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:shadow-md"
            >
              <span aria-hidden>🏷️</span> Зелёные ценники
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <label className="mb-1 block text-sm font-semibold">
              Адрес доставки
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (e.target.value.trim()) setAddressError(false);
              }}
              placeholder="Улица, дом, квартира / подъезд / этаж"
              className={`w-full rounded-[10px] border px-4 py-3 text-sm focus:outline-none ${
                addressError
                  ? "border-tomato focus:border-tomato"
                  : "border-black/10 focus:border-primary"
              }`}
            />
            {addressError && (
              <p className="mt-1 text-xs text-tomato">
                Пожалуйста, укажите адрес доставки
              </p>
            )}

            <div className="mt-4 rounded-[10px] bg-background p-3 text-sm">
              <div className="flex items-center justify-between text-muted">
                <span>Товаров: {totalCount}</span>
                <span>{totalPrice} ₽</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-muted">
                <span>Общий вес</span>
                <span className={isOverWeightLimit ? "font-semibold text-tomato" : ""}>
                  ~{round(totalWeight)} кг
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-muted">
                <span>Доставка по Ялте</span>
                {deliveryCost === 0 ? (
                  <span className="font-semibold text-primary-dark">
                    Бесплатно 🎉
                  </span>
                ) : (
                  <span>+{DELIVERY_COST} ₽</span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-2">
                <span className="font-semibold">Итого с доставкой</span>
                <span className="text-lg font-extrabold text-primary-dark">
                  {grandTotal} ₽
                </span>
              </div>
              {deliveryCost > 0 && (
                <p className="mt-1 text-xs text-muted">
                  {isOverWeightLimit
                    ? `Доставка платная: вес заказа превышает ${FREE_DELIVERY_WEIGHT_LIMIT} кг`
                    : `Бесплатная доставка при заказе от ${FREE_DELIVERY_THRESHOLD} ₽ и весом до ${FREE_DELIVERY_WEIGHT_LIMIT} кг`}
                </p>
              )}
            </div>

            {phoneRequested && (
              <div className="mt-4 rounded-[10px] bg-primary/10 p-3 text-sm text-primary-dark">
                Заявка принята! Мы позвоним вам в ближайшее время, чтобы
                уточнить заказ и сообщить точную сумму.
              </div>
            )}
          </div>
        )}

        {step === "list" && items.length > 0 && (
          <div className="border-t border-black/5 p-4">
            <div className="mb-1 flex items-center justify-between text-sm text-muted">
              <span>Товаров: {totalCount}</span>
              <span>{totalPrice} ₽</span>
            </div>
            <div className="mb-1 flex items-center justify-between text-sm text-muted">
              <span>Общий вес</span>
              <span className={isOverWeightLimit ? "font-semibold text-tomato" : ""}>
                ~{round(totalWeight)} кг
              </span>
            </div>
            <div className="mb-1 flex items-center justify-between text-sm text-muted">
              <span>Доставка по Ялте</span>
              {deliveryCost === 0 ? (
                <span className="font-semibold text-primary-dark">
                  Бесплатно 🎉
                </span>
              ) : (
                <span>+{DELIVERY_COST} ₽</span>
              )}
            </div>
            <div className="mb-3 flex items-center justify-between border-t border-black/5 pt-2">
              <span className="text-sm text-muted">
                Итого с доставкой
                <br />
                <span className="text-xs">после сборки сумма может уточниться</span>
              </span>
              <span className="text-xl font-extrabold text-primary-dark">
                {grandTotal} ₽
              </span>
            </div>
            {deliveryCost > 0 && (
              <p className="mb-3 text-xs text-muted">
                {isOverWeightLimit
                  ? `Доставка платная: вес заказа превышает ${FREE_DELIVERY_WEIGHT_LIMIT} кг`
                  : `Бесплатная доставка при заказе от ${FREE_DELIVERY_THRESHOLD} ₽ и весом до ${FREE_DELIVERY_WEIGHT_LIMIT} кг`}
              </p>
            )}
            <div className="mb-3 flex items-start gap-2 rounded-[10px] bg-primary/5 p-3 text-xs text-primary-dark">
              <span className="text-base leading-none">🤝</span>
              <span>
                Соберём заказ так, чтобы его стоимость не превысила
                ориентировочную сумму — {totalPrice} ₽
              </span>
            </div>
            <button
              onClick={() => setStep("checkout")}
              className="w-full rounded-[10px] bg-primary px-4 py-3 text-sm font-bold text-white"
            >
              Отправить список
            </button>
            <p className="mt-2 text-center text-xs text-muted">
              Мы свяжемся с вами, соберём заказ и пришлём точную сумму к
              оплате
            </p>
          </div>
        )}

        {step === "checkout" && (
          <div className="border-t border-black/5 p-4">
            <p className="mb-2 text-sm font-semibold">
              Отправить список удобным способом
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSend("telegram")}
                className="flex flex-col items-center gap-1 rounded-[10px] bg-[#229ED9]/10 px-2 py-3 text-xs font-semibold text-[#229ED9]"
              >
                <span className="text-2xl">✈️</span>
                Telegram
              </button>
              <button
                onClick={() => handleSend("max")}
                className="flex flex-col items-center gap-1 rounded-[10px] bg-accent/10 px-2 py-3 text-xs font-semibold text-accent"
              >
                <span className="text-2xl">🟣</span>
                MAX
              </button>
              <button
                onClick={() => handleSend("whatsapp")}
                className="flex flex-col items-center gap-1 rounded-[10px] bg-[#25D366]/10 px-2 py-3 text-xs font-semibold text-[#1da851]"
              >
                <span className="text-2xl">💬</span>
                WhatsApp
              </button>
            </div>

            <button
              onClick={handlePhoneRequest}
              className="mt-3 w-full rounded-[10px] border border-black/10 px-4 py-3 text-sm font-bold text-foreground hover:bg-black/5"
            >
              📞 Без мессенджера — позвоните мне
            </button>
            <p className="mt-2 text-center text-xs text-muted">
              После отправки мы перезвоним вам, уточним заказ и сообщим точную
              сумму к оплате
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
