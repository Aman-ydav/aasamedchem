import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("ADMIN");
  return (
    <DashboardShell role="ADMIN" user={{ name: user.name, email: user.email }}>
      {children}
    </DashboardShell>
  );
}
