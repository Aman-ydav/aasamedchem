"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireBuyerProfile } from "@/lib/buyer";
import { requireRole } from "@/lib/rbac";
import {
  chemicalRequestSchema,
  type ChemicalRequestInput,
} from "@/lib/validations/request";
import type { RequestStatus } from "@/lib/generated/prisma/enums";

export async function createChemicalRequest(input: ChemicalRequestInput) {
  const parsed = chemicalRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { profile } = await requireBuyerProfile();
  const d = parsed.data;

  await db.chemicalRequest.create({
    data: {
      buyerId: profile.id,
      chemicalName: d.chemicalName,
      requestedQuantity: d.requestedQuantity,
      requestedUnit: d.requestedUnit,
      notes: d.notes || null,
      deliveryLocation: d.deliveryLocation || null,
    },
  });

  revalidatePath("/buyer/requests");
  revalidatePath("/admin/requests");
  return { success: true as const };
}

export async function updateRequestStatus(id: string, status: RequestStatus) {
  await requireRole("ADMIN");
  await db.chemicalRequest.update({ where: { id }, data: { status } });
  revalidatePath("/admin/requests");
  return { success: true as const };
}
