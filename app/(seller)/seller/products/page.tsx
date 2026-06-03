import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSellerProfile } from "@/lib/seller";
import { db } from "@/lib/db";
import { toNum, formatINR } from "@/lib/format";
import {
  formatBaseQuantity,
  pricePerSellUnit,
  unitLabel,
  SELL_UNIT,
} from "@/lib/conversion-engine";
import { PageHeader } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductActions } from "@/components/seller/product-actions";

export default async function SellerProductsPage() {
  const { profile } = await requireSellerProfile();
  const products = await db.product.findMany({
    where: { sellerId: profile.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your chemical listings."
        action={
          <Button asChild>
            <Link href="/seller/products/new">
              <Plus className="size-4" /> Add product
            </Link>
          </Button>
        }
      />

      {products.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted-foreground">No products yet.</p>
          <Button asChild className="mt-4">
            <Link href="/seller/products/new">Add your first product</Link>
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>In stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.sku}</div>
                  </TableCell>
                  <TableCell>{p.category}</TableCell>
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
                      {p.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ProductActions id={p.id} name={p.name} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
