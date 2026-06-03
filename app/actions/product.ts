"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSellerProfile } from "@/lib/seller";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import { BASE_UNIT, toBase, UNIT_TABLE } from "@/lib/conversion-engine";
import type { Unit } from "@/lib/generated/prisma/enums";

function isUniqueError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    (e as { code?: string }).code === "P2002"
  );
}

/** Convert seller-entered values (in their chosen unit) into base-unit storage. */
function toBaseValues(input: ProductInput) {
  const factor = UNIT_TABLE[input.inputUnit as Unit].factorToBase;
  return {
    baseUnit: BASE_UNIT[input.dimension],
    inventoryInBase: toBase(input.inventoryQuantity, input.inputUnit),
    pricePerBaseUnit: input.pricePerUnit / factor,
    minimumOrderQty: toBase(input.minimumOrderQty, input.inputUnit),
  };
}

export async function createProduct(input: ProductInput) {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { profile } = await requireSellerProfile();
  const v = toBaseValues(parsed.data);
  const d = parsed.data;

  try {
    const product = await db.product.create({
      data: {
        sellerId: profile.id,
        name: d.name,
        sku: d.sku,
        category: d.category,
        description: d.description || null,
        image: d.image || null,
        dimension: d.dimension,
        baseUnit: v.baseUnit,
        inventoryInBase: v.inventoryInBase,
        pricePerBaseUnit: v.pricePerBaseUnit,
        minimumOrderQty: v.minimumOrderQty,
        leadTime: d.leadTime || null,
        isActive: d.isActive,
      },
    });
    revalidatePath("/seller/products");
    revalidatePath("/seller/inventory");
    return { success: true as const, id: product.id };
  } catch (e) {
    if (isUniqueError(e)) return { error: "A product with this SKU already exists" };
    throw e;
  }
}

export async function updateProduct(id: string, input: ProductInput) {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { profile } = await requireSellerProfile();
  const existing = await db.product.findFirst({ where: { id, sellerId: profile.id } });
  if (!existing) return { error: "Product not found" };

  const v = toBaseValues(parsed.data);
  const d = parsed.data;

  try {
    await db.product.update({
      where: { id },
      data: {
        name: d.name,
        sku: d.sku,
        category: d.category,
        description: d.description || null,
        image: d.image || null,
        dimension: d.dimension,
        baseUnit: v.baseUnit,
        inventoryInBase: v.inventoryInBase,
        pricePerBaseUnit: v.pricePerBaseUnit,
        minimumOrderQty: v.minimumOrderQty,
        leadTime: d.leadTime || null,
        isActive: d.isActive,
      },
    });
    revalidatePath("/seller/products");
    revalidatePath("/seller/inventory");
    revalidatePath(`/product/${id}`);
    return { success: true as const, id };
  } catch (e) {
    if (isUniqueError(e)) return { error: "A product with this SKU already exists" };
    throw e;
  }
}

export async function setProductActive(id: string, isActive: boolean) {
  const { profile } = await requireSellerProfile();
  const updated = await db.product.updateMany({
    where: { id, sellerId: profile.id },
    data: { isActive },
  });
  if (updated.count === 0) return { error: "Product not found" };
  revalidatePath("/seller/products");
  return { success: true as const };
}

/** Restock or correct inventory; quantity is in the product's base unit. */
export async function setInventory(id: string, inventoryInBase: number) {
  if (!Number.isFinite(inventoryInBase) || inventoryInBase < 0)
    return { error: "Enter a valid quantity" };
  const { profile } = await requireSellerProfile();
  const updated = await db.product.updateMany({
    where: { id, sellerId: profile.id },
    data: { inventoryInBase },
  });
  if (updated.count === 0) return { error: "Product not found" };
  revalidatePath("/seller/inventory");
  revalidatePath("/seller/products");
  return { success: true as const };
}

export async function deleteProduct(id: string) {
  const { profile } = await requireSellerProfile();
  const product = await db.product.findFirst({
    where: { id, sellerId: profile.id },
    include: { _count: { select: { orderItems: true } } },
  });
  if (!product) return { error: "Product not found" };
  if (product._count.orderItems > 0) {
    return {
      error: "This product has orders. Deactivate it instead of deleting.",
    };
  }
  await db.product.delete({ where: { id } });
  revalidatePath("/seller/products");
  revalidatePath("/seller/inventory");
  return { success: true as const };
}
