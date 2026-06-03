import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/rbac";

/** Ensures the current user is a SELLER and returns their profile. */
export async function requireSellerProfile() {
  const user = await requireRole("SELLER");
  const profile = await db.sellerProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) redirect("/login");
  return { user, profile };
}
