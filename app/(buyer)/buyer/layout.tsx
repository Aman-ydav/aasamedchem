import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("BUYER");
  return (
    <DashboardShell role="BUYER" user={{ name: user.name, email: user.email }}>
      {children}
    </DashboardShell>
  );
}
