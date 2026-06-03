import { notFound } from "next/navigation";
import Link from "next/link";
import { FlaskConical, Store } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/rbac";
import { toNum } from "@/lib/format";
import { formatBaseQuantity, DIMENSION_LABEL } from "@/lib/conversion-engine";
import { QuotationCalculator } from "@/components/marketplace/quotation-calculator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await db.product.findFirst({
    where: { id, isActive: true, seller: { status: "APPROVED" } },
    include: { seller: true },
  });
  if (!product) notFound();

  const user = await getCurrentUser();
  const canOrder = user?.role === "BUYER";

  const details = [
    { label: "SKU", value: product.sku },
    { label: "Category", value: product.category },
    { label: "Measured by", value: DIMENSION_LABEL[product.dimension] },
    {
      label: "In stock",
      value: formatBaseQuantity(toNum(product.inventoryInBase), product.dimension),
    },
    {
      label: "Minimum order",
      value: formatBaseQuantity(toNum(product.minimumOrderQty), product.dimension),
    },
    { label: "Lead time", value: product.leadTime ?? "—" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="mb-6 grid aspect-[16/9] place-items-center overflow-hidden rounded-xl border bg-muted/40">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image}
                alt={product.name}
                className="size-full object-cover"
              />
            ) : (
              <FlaskConical className="size-16 text-muted-foreground/40" />
            )}
          </div>

          <Badge variant="secondary" className="mb-3">
            {product.category}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight font-heading">
            {product.name}
          </h1>

          <Link
            href={`/sellers/${product.sellerId}`}
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Store className="size-4" /> {product.seller.companyName}
          </Link>

          {product.description && (
            <p className="mt-4 max-w-prose text-muted-foreground">
              {product.description}
            </p>
          )}

          <Card className="mt-6">
            <CardContent className="grid gap-x-8 gap-y-3 p-6 sm:grid-cols-2">
              {details.map((d) => (
                <div key={d.label} className="flex justify-between gap-4 border-b py-1.5 text-sm last:border-0">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <QuotationCalculator
            productId={product.id}
            name={product.name}
            sellerId={product.sellerId}
            sellerName={product.seller.companyName}
            dimension={product.dimension}
            pricePerBaseUnit={toNum(product.pricePerBaseUnit)}
            inventoryInBase={toNum(product.inventoryInBase)}
            minimumOrderQty={toNum(product.minimumOrderQty)}
            canOrder={canOrder}
          />
        </div>
      </div>
    </div>
  );
}
