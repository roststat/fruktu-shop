import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { sendTelegramMessage } from "@/lib/telegram";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fruktu.ru";

export async function POST(request: Request) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response("unauthorized", { status: 401 });
  }

  const update = await request.json();
  const message = update.message;
  if (!message?.text) return Response.json({ ok: true });

  const chatId = message.chat.id as number;
  const text = message.text as string;

  if (text.startsWith("/start")) {
    const payload = text.split(" ")[1] ?? "";
    const orderId = payload.startsWith("order_") ? payload.slice("order_".length) : null;

    if (!orderId) {
      await sendTelegramMessage(
        chatId,
        "Привет! Это бот «Схожу на рынок». Чтобы оформить заказ, соберите список на сайте и нажмите «Отправить в Telegram»."
      );
      return Response.json({ ok: true });
    }

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) {
      await sendTelegramMessage(chatId, "Не нашли такой заказ. Попробуйте собрать список заново.");
      return Response.json({ ok: true });
    }

    await db
      .update(orders)
      .set({ messengerPlatform: "telegram", messengerChatId: String(chatId), updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    await sendTelegramMessage(
      chatId,
      `Мы получили ваш список (${order.itemsCount} товаров на ~${order.estimatedTotal} ₽).\n\nПодтвердите заказ, чтобы мы начали сборку.`,
      [[{ text: "✅ Подтвердить заказ", web_app: { url: `${SITE_URL}/order/${orderId}` } }]]
    );
  }

  return Response.json({ ok: true });
}
