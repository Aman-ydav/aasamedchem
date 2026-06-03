import { notFound } from "next/navigation";
import { requireSellerProfile } from "@/lib/seller";
import { db } from "@/lib/db";
import { toNum } from "@/lib/format";
import { fromBase, pricePerSellUnit, SELL_UNIT } from "@/lib/conversion-engine";
import { PageHeader } from "@/components/dashboard/stat-card";
import { ProductForm } from "@/components/seller/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await requireSellerProfile();
  const p = await db.product.findFirst({ where: { id, sellerId: profile.id } });
  if (!p) notFound();

  const sellUnit = SELL_UNIT[p.dimension];

  return (
    <div>
      <PageHeader title="Edit product" description={p.name} />
      <ProductForm
        mode="edit"
        productId={p.id}
        initial={{
          name: p.name,
          sku: p.sku,
          category: p.category,
          description: p.description ?? "",
          image: p.image ?? "",
          dimension: p.dimension,
          inputUnit: sellUnit,
          inventoryQuantity: fromBase(toNum(p.inventoryInBase), sellUnit),
          pricePerUnit: pricePerSellUnit(toNum(p.pricePerBaseUnit), p.dimension),
          minimumOrderQty: fromBase(toNum(p.minimumOrderQty), sellUnit),
          leadTime: p.leadTime ?? "",
          isActive: p.isActive,
        }}
      />
    </div>
  );
}
