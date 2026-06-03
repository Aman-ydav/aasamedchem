"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSellerProfile } from "@/lib/seller";
import {
  sellerProfileSchema,
  type SellerProfileInput,
} from "@/lib/validations/seller";

export async function updateSellerProfile(input: SellerProfileInput) {
  const parsed = sellerProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { profile } = await requireSellerProfile();
  const d = parsed.data;

  await db.sellerProfile.update({
    where: { id: profile.id },
    data: {
      companyName: d.companyName,
      gstNumber: d.gstNumber || null,
      description: d.description || null,
      address: d.address || null,
      contactNumber: d.contactNumber || null,
      deliveryTime: d.deliveryTime || null,
      deliveryRegions: d.deliveryRegions || null,
    },
  });

  revalidatePath("/seller");
  revalidatePath("/seller/profile");
  revalidatePath(`/sellers/${profile.id}`);
  return { success: true as const };
}
