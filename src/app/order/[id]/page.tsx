"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useParams } from "next/navigation";
import { initMessengerApp, closeMessengerApp } from "@/lib/messengerBridge";

interface OrderItem {
  productId: string;
  name: string;
  icon: string;
  isClearance: boolean;
  quantityLabel: string;
  price: number;
  lineTotal: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  estimatedTotal: string;
  finalTotal: string | null;
  address: string;
  status: string;
}

export default function OrderConfirmPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initMessengerApp();
  }, []);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: Order) => {
        setOrder(data);
        if (data.status !== "new") setConfirmed(true);
      })
      .catch(() => setError("Не нашли такой заказ."));
  }, [id]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const res = await fetch(`/api/orders/${id}/confirm`, { method: "POST" });
      if (!res.ok) throw new Error("failed");
      setConfirmed(true);
    } catch {
      setError("Не получилось подтвердить заказ. Попробуйте ещё раз.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <div className="mx-auto max-w-md px-4 py-6">
        <h1 className="mb-4 text-2xl font-extrabold">Подтверждение заказа</h1>

        {error && <p className="text-red-600">{error}</p>}

        {!order && !error && <p className="text-muted">Загружаем заказ…</p>}

        {order && (
          <>
            <ul className="mb-4 flex flex-col gap-2">
              {order.items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between gap-2 rounded-[10px] border border-black/5 p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-sm font-semibold">
                        {item.name}
                        {item.isClearance && (
                          <span className="ml-1 text-xs text-green-600">🏷️</span>
                        )}
                      </p>
                      <p className="text-xs text-muted">{item.quantityLabel}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{item.lineTotal} ₽</p>
                </li>
              ))}
            </ul>

            <div className="mb-4 rounded-[10px] bg-background p-3 text-sm">
              <p>Адрес: {order.address}</p>
              <p className="mt-1 font-bold">
                Ориентировочная сумма: {order.estimatedTotal} ₽
              </p>
            </div>

            {confirmed ? (
              <div className="rounded-[10px] bg-green-50 p-4 text-center">
                <p className="font-bold text-green-700">Заказ подтверждён ✅</p>
                <p className="mt-1 text-sm text-muted">
                  Мы начали сборку и пришлём сюда итоговую сумму и ссылку на оплату.
                </p>
                <button
                  onClick={closeMessengerApp}
                  className="mt-3 rounded-[10px] bg-primary px-4 py-2 text-sm font-bold text-white"
                >
                  Закрыть
                </button>
              </div>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="w-full rounded-[10px] bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {confirming ? "Подтверждаем…" : "✅ Подтвердить заказ"}
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
