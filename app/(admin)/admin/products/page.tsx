import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { toNum, formatINR } from "@/lib/format";
import {
  pricePerSellUnit,
  unitLabel,
  formatBaseQuantity,
  SELL_UNIT,
} from "@/lib/conversion-engine";
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
import { AdminProductActions } from "@/components/admin/admin-product-actions";

export default async function AdminProductsPage() {
  await requireRole("ADMIN");
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { seller: { select: { companyName: true } } },
  });

  return (
    <div>
      <PageHeader title="Products" description={`${products.length} products across all sellers.`} />
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link href={`/product/${p.id}`} className="font-medium hover:underline">
                    {p.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">{p.sku}</div>
                </TableCell>
                <TableCell>{p.seller.companyName}</TableCell>
                <TableCell>
                  {formatINR(pricePerSellUnit(toNum(p.pricePerBaseUnit), p.dimension))}
                  <span className="text-muted-foreground">
                    {" "}
                    / {unitLabel(SELL_UNIT[p.dimension])}
                  </span>
                </TableCell>
                <TableCell>
                  {formatBaseQuantity(toNum(p.inventoryInBase), p.dimension)}
                </TableCell>
                <TableCell>
                  <Badge variant={p.isActive ? "default" : "secondary"}>
                    {p.isActive ? "Active" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <AdminProductActions id={p.id} isActive={p.isActive} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
