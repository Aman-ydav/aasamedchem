"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireBuyerProfile } from "@/lib/buyer";
import { requireRole } from "@/lib/rbac";
import { toNum } from "@/lib/format";
import { quote, hasStock, meetsMinimum } from "@/lib/quotation-engine";
import { isUnitValidForDimension } from "@/lib/conversion-engine";
import { placeOrderSchema } from "@/lib/validations/order";
import type { OrderStatus } from "@/lib/generated/prisma/enums";

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

/**
 * Updates an order's status. Sellers may only touch their own orders; admins
 * may touch any. Approving a PENDING order atomically decrements inventory for
 * every line, failing the whole transaction if any item is short on stock.
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const user = await requireRole(["SELLER", "ADMIN"]);
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { error: "Order not found" };

  if (user.role === "SELLER") {
    const sp = await db.sellerProfile.findUnique({ where: { userId: user.id } });
    if (!sp || sp.id !== order.sellerId) return { error: "This isn't your order" };
  }

  const decrementsStock = status === "APPROVED" && order.status === "PENDING";

  try {
    if (decrementsStock) {
      await db.$transaction(async (tx) => {
        for (const item of order.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) continue;
          const remaining = toNum(product.inventoryInBase) - toNum(item.convertedQuantity);
          if (remaining < 0) {
            throw new Error(`Insufficient stock for ${item.productName}`);
          }
          await tx.product.update({
            where: { id: product.id },
            data: { inventoryInBase: remaining },
          });
        }
        await tx.order.update({ where: { id: orderId }, data: { status } });
      });
    } else {
      await db.order.update({ where: { id: orderId }, data: { status } });
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update the order" };
  }

  revalidatePath("/seller/orders");
  revalidatePath("/buyer/orders");
  revalidatePath("/admin/orders");
  revalidatePath("/seller/inventory");
  return { success: true as const };
}
