import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { toNum, formatINR } from "@/lib/format";
import { PageHeader } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusControl } from "@/components/orders/order-status-control";

export default async function AdminOrdersPage() {
  await requireRole("ADMIN");
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { companyName: true } },
      seller: { select: { companyName: true } },
      _count: { select: { items: true } },
    },
  });

  return (
    <div>
      <PageHeader title="Orders" description={`${orders.length} orders platform-wide.`} />
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">
                  #{o.id.slice(-8)}
                </TableCell>
                <TableCell>{o.buyer.companyName ?? "—"}</TableCell>
                <TableCell>{o.seller.companyName}</TableCell>
                <TableCell>{o._count.items}</TableCell>
                <TableCell>{formatINR(toNum(o.totalPrice))}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <OrderStatusControl orderId={o.id} status={o.status} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
