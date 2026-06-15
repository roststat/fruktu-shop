import {
  pgTable,
  text,
  integer,
  numeric,
  jsonb,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  items: jsonb("items").notNull(),
  itemsCount: integer("items_count").notNull(),
  estimatedTotal: numeric("estimated_total", { precision: 10, scale: 2 }).notNull(),
  finalTotal: numeric("final_total", { precision: 10, scale: 2 }),
  address: text("address").notNull(),
  phone: text("phone"),
  comment: text("comment"),
  paymentUrl: text("payment_url"),
  status: text("status").notNull().default("new"),
  messengerPlatform: text("messenger_platform"),
  messengerChatId: text("messenger_chat_id"),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
