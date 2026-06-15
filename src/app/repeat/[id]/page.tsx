"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useList } from "@/context/ListContext";

export default function RepeatOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { replaceItems, openList } = useList();

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: { items: { productId: string; quantity: number }[] }) => {
        replaceItems(
          data.items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
        );
        openList();
        router.replace("/catalog");
      })
      .catch(() => router.replace("/catalog"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="mx-auto max-w-md px-4 py-6 text-center text-muted">
      Загружаем прошлый список…
    </div>
  );
}
