import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

export async function GET(_request: Request, ctx: RouteContext<"/api/orders/[id]">) {
  const { id } = await ctx.params;
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(order);
}
