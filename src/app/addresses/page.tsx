"use client";

import { useEffect, useState } from "react";
import { getMessengerUserId } from "@/lib/messengerBridge";

interface HistoryOrder {
  id: string;
  address: string;
  createdAt: string;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const chatId = getMessengerUserId();
    if (!chatId) {
      setError("Адреса доступны только в мини-приложении Telegram.");
      return;
    }
    fetch(`/api/orders/history?chatId=${chatId}`)
      .then((res) => res.json())
      .then((orders: HistoryOrder[]) => {
        const unique = Array.from(new Set(orders.map((o) => o.address)));
        setAddresses(unique);
      })
      .catch(() => setError("Не удалось загрузить адреса."));
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-4 text-2xl font-extrabold">Мои адреса</h1>

      {error && <p className="text-muted">{error}</p>}

      {!addresses && !error && <p className="text-muted">Загружаем адреса…</p>}

      {addresses?.length === 0 && (
        <p className="text-muted">
          Пока нет адресов — они появятся здесь после первого заказа.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {addresses?.map((address) => (
          <li
            key={address}
            className="rounded-[10px] border border-black/5 p-3 text-sm"
          >
            📍 {address}
          </li>
        ))}
      </ul>
    </div>
  );
}
