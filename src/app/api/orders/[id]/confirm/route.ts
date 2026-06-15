import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(_request: Request, ctx: RouteContext<"/api/orders/[id]/confirm">) {
  const { id } = await ctx.params;
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return Response.json({ error: "not found" }, { status: 404 });

  if (order.status === "new") {
    await db
      .update(orders)
      .set({ status: "confirmed", confirmedAt: new Date(), updatedAt: new Date() })
      .where(eq(orders.id, id));
  }

  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (adminChatId && order.status === "new") {
    await sendTelegramMessage(
      adminChatId,
      `✅ Клиент подтвердил заказ ${id.slice(0, 8)}. Можно начинать сборку.`
    ).catch((err) => console.error("Failed to notify admin", err));
  }

  return Response.json({ ok: true });
}
