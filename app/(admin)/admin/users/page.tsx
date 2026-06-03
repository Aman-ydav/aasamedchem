import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ROLE_VARIANT = {
  ADMIN: "default",
  SELLER: "secondary",
  BUYER: "outline",
} as const;

export default async function AdminUsersPage() {
  await requireRole("ADMIN");
  const users = await db.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader title="Users" description={`${users.length} registered users.`} />
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant={ROLE_VARIANT[u.role]}>{u.role}</Badge>
                </TableCell>
                <TableCell>{u.createdAt.toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
