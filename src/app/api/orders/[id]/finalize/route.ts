import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { sendTelegramMessage } from "@/lib/telegram";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fruktu.ru";

export async function POST(request: Request, ctx: RouteContext<"/api/orders/[id]/finalize">) {
  const { id } = await ctx.params;
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return new Response("unauthorized", { status: 401 });
  }

  const body = await request.json();
  const finalTotal: number | undefined = body.finalTotal;
  const paymentUrl: string | undefined = body.paymentUrl;

  if (finalTotal === undefined || !paymentUrl) {
    return Response.json({ error: "finalTotal and paymentUrl are required" }, { status: 400 });
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return Response.json({ error: "not found" }, { status: 404 });

  await db
    .update(orders)
    .set({
      status: "assembled",
      finalTotal: finalTotal.toFixed(2),
      paymentUrl,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id));

  if (order.messengerPlatform === "telegram" && order.messengerChatId) {
    await sendTelegramMessage(
      order.messengerChatId,
      `📦 Ваш заказ собран!\n\nИтоговая сумма: <b>${finalTotal} ₽</b>\n\nУкажите имя и телефон для курьера и перейдите к оплате:`,
      [[{ text: "💳 К оплате", web_app: { url: `${SITE_URL}/order/${id}` } }]]
    ).catch((err) => console.error("Failed to notify customer", err));
  }

  return Response.json({ ok: true });
}
