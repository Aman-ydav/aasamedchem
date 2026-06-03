import { redirect } from "next/navigation";
import { requireUser, dashboardPath } from "@/lib/rbac";

// Neutral landing after login — routes the user to their role's dashboard.
export default async function DashboardRedirect() {
  const user = await requireUser();
  redirect(dashboardPath(user.role));
}
