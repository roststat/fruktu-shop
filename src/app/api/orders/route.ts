import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { getCartProductById, formatQuantity } from "@/data/catalog";
import { sendTelegramMessage } from "@/lib/telegram";

interface OrderItemInput {
  productId: string;
  quantity: number;
}

export async function POST(request: Request) {
  const body = await request.json();
  const items: OrderItemInput[] = body.items ?? [];
  const address: string = (body.address ?? "").trim();
  const phone: string | null = body.phone?.trim() || null;
  const comment: string | null = body.comment?.trim() || null;

  if (items.length === 0 || !address) {
    return Response.json(
      { error: "items and address are required" },
      { status: 400 }
    );
  }

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

  const validItems = snapshot.filter((i): i is NonNullable<typeof i> => i !== null);
  if (validItems.length === 0) {
    return Response.json({ error: "no valid items" }, { status: 400 });
  }

  const [order] = await db
    .insert(orders)
    .values({
      items: validItems,
      itemsCount: validItems.length,
      estimatedTotal: estimatedTotal.toFixed(2),
      address,
      phone,
      comment,
    })
    .returning({ id: orders.id });

  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (adminChatId) {
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

  return Response.json({ id: order.id });
}
