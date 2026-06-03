import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("SELLER");
  return (
    <DashboardShell role="SELLER" user={{ name: user.name, email: user.email }}>
      {children}
    </DashboardShell>
  );
}
