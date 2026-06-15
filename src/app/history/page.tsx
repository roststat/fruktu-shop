"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMessengerUserId } from "@/lib/messengerBridge";

interface HistoryOrder {
  id: string;
  itemsCount: number;
  estimatedTotal: string;
  finalTotal: string | null;
  status: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Подтверждён, идёт сборка",
  assembled: "Собран",
};

export default function HistoryPage() {
  const [orders, setOrders] = useState<HistoryOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const chatId = getMessengerUserId();
    if (!chatId) {
      setError("История доступна только в мини-приложении Telegram.");
      return;
    }
    fetch(`/api/orders/history?chatId=${chatId}`)
      .then((res) => res.json())
      .then(setOrders)
      .catch(() => setError("Не удалось загрузить историю заказов."));
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-4 text-2xl font-extrabold">Мои заказы</h1>

      {error && <p className="text-muted">{error}</p>}

      {!orders && !error && <p className="text-muted">Загружаем историю…</p>}

      {orders?.length === 0 && <p className="text-muted">Пока нет завершённых заказов.</p>}

      <ul className="flex flex-col gap-2">
        {orders?.map((order) => (
          <li key={order.id} className="rounded-[10px] border border-black/5 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <p className="text-sm font-bold">
                {order.finalTotal ?? order.estimatedTotal} ₽
              </p>
            </div>
            <p className="mt-1 text-xs text-muted">
              {order.itemsCount} товаров · {STATUS_LABELS[order.status] ?? order.status}
            </p>
            <Link
              href={`/repeat/${order.id}`}
              className="mt-2 inline-block rounded-[10px] border border-primary bg-white px-3 py-1.5 text-xs font-bold text-primary"
            >
              🔁 Повторить
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
