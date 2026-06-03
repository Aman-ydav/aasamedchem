"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireBuyerProfile } from "@/lib/buyer";
import { toNum } from "@/lib/format";
import { quote, hasStock, meetsMinimum } from "@/lib/quotation-engine";
import { isUnitValidForDimension } from "@/lib/conversion-engine";
import { placeOrderSchema } from "@/lib/validations/order";

/**
 * Creates orders from a buyer's cart. Everything is recomputed server-side from
 * the database — the client's prices are never trusted. Items are grouped into
 * one order per seller. Inventory is decremented later, when the seller approves.
 */
export async function placeOrder(rawItems: unknown) {
  const parsed = placeOrderSchema.safeParse(rawItems);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Your cart is invalid" };
  }
  const items = parsed.data;
  const { profile: buyer } = await requireBuyerProfile();

  const products = await db.product.findMany({
    where: {
      id: { in: items.map((i) => i.productId) },
      isActive: true,
      seller: { status: "APPROVED" },
    },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  type Line = {
    productId: string;
    productName: string;
    enteredQuantity: number;
    enteredUnit: (typeof items)[number]["enteredUnit"];
    convertedQuantity: number;
    calculatedPrice: number;
  };
  const groups = new Map<string, { lines: Line[]; total: number }>();

  for (const it of items) {
    const p = byId.get(it.productId);
    if (!p) return { error: "A product in your cart is no longer available" };
    if (!isUnitValidForDimension(it.enteredUnit, p.dimension)) {
      return { error: `Invalid unit for ${p.name}` };
    }
    const q = quote({
      pricePerBaseUnit: toNum(p.pricePerBaseUnit),
      enteredQuantity: it.enteredQuantity,
      enteredUnit: it.enteredUnit,
      dimension: p.dimension,
    });
    if (!meetsMinimum(q.baseQuantity, toNum(p.minimumOrderQty))) {
      return { error: `${p.name} requires a larger minimum order` };
    }
    if (!hasStock(q.baseQuantity, toNum(p.inventoryInBase))) {
      return { error: `${p.name} doesn't have enough stock for that quantity` };
    }
    const g = groups.get(p.sellerId) ?? { lines: [], total: 0 };
    g.lines.push({
      productId: p.id,
      productName: p.name,
      enteredQuantity: it.enteredQuantity,
      enteredUnit: it.enteredUnit,
      convertedQuantity: q.baseQuantity,
      calculatedPrice: q.total,
    });
    g.total += q.total;
    groups.set(p.sellerId, g);
  }

  await db.$transaction(
    [...groups.entries()].map(([sellerId, g]) =>
      db.order.create({
        data: {
          buyerId: buyer.id,
          sellerId,
          status: "PENDING",
          totalPrice: g.total,
          items: { create: g.lines },
        },
      }),
    ),
  );

  revalidatePath("/buyer/orders");
  revalidatePath("/seller/orders");
  return { success: true as const, orders: groups.size };
}
