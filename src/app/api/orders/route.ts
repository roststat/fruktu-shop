import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { buildOrderSnapshot, notifyAdminNewOrder } from "@/lib/orders";

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
  const referredBy: string | null = body.referredBy?.trim() || null;

  if (items.length === 0 || !address) {
    return Response.json(
      { error: "items and address are required" },
      { status: 400 }
    );
  }

  const { validItems, estimatedTotal } = buildOrderSnapshot(items);
  if (validItems.length === 0) {
    return Response.json({ error: "no valid items" }, { status: 400 });
  }

  let referrerName: string | null = null;
  if (referredBy) {
    const [referrerOrder] = await db
      .select({ customerName: orders.customerName })
      .from(orders)
      .where(
        and(eq(orders.messengerChatId, referredBy), isNotNull(orders.customerName))
      )
      .orderBy(desc(orders.createdAt))
      .limit(1);
    referrerName = referrerOrder?.customerName ?? null;
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
      referredBy,
    })
    .returning({ id: orders.id });

  await notifyAdminNewOrder(
    validItems,
    estimatedTotal,
    address,
    phone,
    comment,
    referredBy,
    referrerName
  );

  return Response.json({ id: order.id });
}
