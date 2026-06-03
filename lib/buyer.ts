import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/rbac";

/** Ensures the current user is a BUYER and returns their profile. */
export async function requireBuyerProfile() {
  const user = await requireRole("BUYER");
  const profile = await db.buyerProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) redirect("/login");
  return { user, profile };
}
