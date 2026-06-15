"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { closeMessengerApp, openExternalLink } from "@/lib/messengerBridge";

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
  paymentUrl: string | null;
  address: string;
  customerName: string | null;
  phone: string | null;
  status: string;
}

export default function OrderConfirmPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingContact, setSavingContact] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: Order) => {
        setOrder(data);
        if (data.status !== "new") setConfirmed(true);
        if (data.customerName && data.phone) {
          setName(data.customerName);
          setPhone(data.phone);
          setContactSaved(true);
        }
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

  const handleSaveContact = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("Укажите имя и телефон.");
      return;
    }
    setError(null);
    setSavingContact(true);
    try {
      const res = await fetch(`/api/orders/${id}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      if (!res.ok) throw new Error("failed");
      setContactSaved(true);
    } catch {
      setError("Не получилось сохранить данные. Попробуйте ещё раз.");
    } finally {
      setSavingContact(false);
    }
  };

  const handleRepeat = () => {
    router.push(`/repeat/${id}`);
  };

  return (
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

            {order.status === "assembled" ? (
              <div className="rounded-[10px] bg-green-50 p-4">
                <p className="text-center font-bold text-green-700">Заказ собран 📦</p>
                <p className="mt-1 text-center text-sm font-bold">
                  Итоговая сумма: {order.finalTotal} ₽
                </p>

                {!contactSaved ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <p className="text-sm text-muted">
                      Укажите имя и телефон для курьера:
                    </p>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Имя"
                      className="rounded-[10px] border border-black/10 px-3 py-2 text-sm"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Телефон"
                      className="rounded-[10px] border border-black/10 px-3 py-2 text-sm"
                    />
                    <button
                      onClick={handleSaveContact}
                      disabled={savingContact}
                      className="rounded-[10px] bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                    >
                      {savingContact ? "Сохраняем…" : "Продолжить"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => order.paymentUrl && openExternalLink(order.paymentUrl)}
                    className="mt-3 w-full rounded-[10px] bg-primary px-4 py-3 text-sm font-bold text-white"
                  >
                    💳 Перейти к оплате
                  </button>
                )}
              </div>
            ) : confirmed ? (
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
                <button
                  onClick={handleRepeat}
                  className="mt-2 w-full rounded-[10px] border border-primary bg-white px-4 py-2 text-sm font-bold text-primary"
                >
                  🔁 Повторить этот заказ
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
  );
}
