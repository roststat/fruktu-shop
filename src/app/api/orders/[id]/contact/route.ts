import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

export async function POST(request: Request, ctx: RouteContext<"/api/orders/[id]/contact">) {
  const { id } = await ctx.params;
  const body = await request.json();
  const name: string = (body.name ?? "").trim();
  const phone: string = (body.phone ?? "").trim();

  if (!name || !phone) {
    return Response.json({ error: "name and phone are required" }, { status: 400 });
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return Response.json({ error: "not found" }, { status: 404 });

  await db
    .update(orders)
    .set({ customerName: name, phone, updatedAt: new Date() })
    .where(eq(orders.id, id));

  return Response.json({ ok: true });
}
