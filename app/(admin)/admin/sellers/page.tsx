import Link from "next/link";
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
import { SellerStatusControl } from "@/components/admin/seller-status-control";

const STATUS_VARIANT = {
  APPROVED: "default",
  PENDING: "secondary",
  SUSPENDED: "destructive",
} as const;

export default async function AdminSellersPage() {
  await requireRole("ADMIN");
  const sellers = await db.sellerProfile.findMany({
    orderBy: { joinedAt: "desc" },
    include: {
      user: { select: { email: true } },
      _count: { select: { products: true } },
    },
  });

  return (
    <div>
      <PageHeader title="Sellers" description="Approve or suspend seller storefronts." />
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sellers.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">
                  {s.status === "APPROVED" ? (
                    <Link href={`/sellers/${s.id}`} className="hover:underline">
                      {s.companyName}
                    </Link>
                  ) : (
                    s.companyName
                  )}
                </TableCell>
                <TableCell>{s.user.email}</TableCell>
                <TableCell>{s._count.products}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[s.status]}>{s.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <SellerStatusControl sellerId={s.id} status={s.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
