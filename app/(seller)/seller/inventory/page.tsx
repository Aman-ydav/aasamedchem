import Link from "next/link";
import { requireSellerProfile } from "@/lib/seller";
import { db } from "@/lib/db";
import { toNum } from "@/lib/format";
import {
  formatBaseQuantity,
  fromBase,
  unitLabel,
  SELL_UNIT,
} from "@/lib/conversion-engine";
import { PageHeader } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InventoryEditor } from "@/components/seller/inventory-editor";

export default async function InventoryPage() {
  const { profile } = await requireSellerProfile();
  const products = await db.product.findMany({
    where: { sellerId: profile.id },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Update stock levels. Values are entered in each product's selling unit and stored in the smallest unit."
      />

      {products.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted-foreground">No products to manage yet.</p>
          <Button asChild className="mt-4">
            <Link href="/seller/products/new">Add a product</Link>
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Current stock</TableHead>
                <TableHead className="text-right">Set stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const sellUnit = SELL_UNIT[p.dimension];
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.sku}</div>
                    </TableCell>
                    <TableCell>
                      {formatBaseQuantity(toNum(p.inventoryInBase), p.dimension)}
                    </TableCell>
                    <TableCell>
                      <InventoryEditor
                        id={p.id}
                        sellUnit={sellUnit}
                        unitLabel={unitLabel(sellUnit)}
                        initialValue={fromBase(toNum(p.inventoryInBase), sellUnit)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
