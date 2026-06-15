import { getCartProductById, formatQuantity } from "@/data/catalog";
import { sendTelegramMessage } from "@/lib/telegram";

interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface OrderSnapshotItem {
  productId: string;
  name: string;
  icon: string;
  isClearance: boolean;
  quantity: number;
  quantityLabel: string;
  price: number;
  lineTotal: number;
}

export function buildOrderSnapshot(items: OrderItemInput[]) {
  let estimatedTotal = 0;
  const snapshot = items.map((item) => {
    const entry = getCartProductById(item.productId);
    if (!entry) return null;
    const lineTotal = entry.price * item.quantity;
    estimatedTotal += lineTotal;
    return {
      productId: item.productId,
      name: entry.product.name,
      icon: entry.product.icon,
      isClearance: entry.isClearance,
      quantity: item.quantity,
      quantityLabel: formatQuantity(entry.product, item.quantity),
      price: entry.price,
      lineTotal,
    };
  });

  const validItems = snapshot.filter((i): i is OrderSnapshotItem => i !== null);
  return { validItems, estimatedTotal };
}

export async function notifyAdminNewOrder(
  validItems: OrderSnapshotItem[],
  estimatedTotal: number,
  address: string,
  phone: string | null,
  comment: string | null,
  referredBy: string | null = null,
  referrerName: string | null = null
) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) return;

  const lines = validItems.map(
    (item) => `• ${item.name} — ${item.quantityLabel}${item.isClearance ? " 🏷️" : ""}`
  );
  const text = [
    "🧺 <b>Новый список на сборку</b>",
    ...lines,
    "",
    `Адрес: ${address}`,
    phone ? `Телефон: ${phone}` : null,
    comment ? `Комментарий: ${comment}` : null,
    referredBy
      ? `По рекомендации: ${referrerName ? `${referrerName} (${referredBy})` : referredBy}`
      : null,
    `Ориентировочная сумма: ${estimatedTotal} ₽`,
    "",
    "Ожидаем подтверждения клиента в боте.",
  ]
    .filter(Boolean)
    .join("\n");

  await sendTelegramMessage(adminChatId, text).catch((err) =>
    console.error("Failed to notify admin", err)
  );
}
