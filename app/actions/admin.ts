"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import type { SellerStatus } from "@/lib/generated/prisma/enums";

export async function setSellerStatus(sellerId: string, status: SellerStatus) {
  await requireRole("ADMIN");
  await db.sellerProfile.update({ where: { id: sellerId }, data: { status } });
  revalidatePath("/admin/sellers");
  revalidatePath(`/sellers/${sellerId}`);
  return { success: true as const };
}

export async function adminSetProductActive(id: string, isActive: boolean) {
  await requireRole("ADMIN");
  await db.product.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/products");
  return { success: true as const };
}

export async function adminDeleteProduct(id: string) {
  await requireRole("ADMIN");
  const count = await db.orderItem.count({ where: { productId: id } });
  if (count > 0) {
    return { error: "Product has orders. Deactivate it instead of deleting." };
  }
  await db.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  return { success: true as const };
}
