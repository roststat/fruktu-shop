import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

export async function GET(request: Request) {
  const chatId = new URL(request.url).searchParams.get("chatId");
  if (!chatId) return Response.json({ error: "chatId is required" }, { status: 400 });

  const history = await db
    .select({
      id: orders.id,
      itemsCount: orders.itemsCount,
      estimatedTotal: orders.estimatedTotal,
      finalTotal: orders.finalTotal,
      status: orders.status,
      address: orders.address,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(and(eq(orders.messengerChatId, chatId), ne(orders.status, "new")))
    .orderBy(desc(orders.createdAt))
    .limit(20);

  return Response.json(history);
}
