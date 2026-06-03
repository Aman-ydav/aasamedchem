import { notFound } from "next/navigation";
import {
  BadgeCheck,
  MapPin,
  Phone,
  Truck,
  CalendarDays,
  ReceiptText,
} from "lucide-react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/marketplace/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SellerStorefrontPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const seller = await db.sellerProfile.findFirst({
    where: { id, status: "APPROVED" },
    include: {
      user: { select: { name: true } },
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!seller) notFound();

  const meta = [
    seller.gstNumber && { icon: ReceiptText, text: `GST: ${seller.gstNumber}` },
    seller.address && { icon: MapPin, text: seller.address },
    seller.contactNumber && { icon: Phone, text: seller.contactNumber },
    seller.deliveryTime && { icon: Truck, text: `Delivery: ${seller.deliveryTime}` },
    seller.deliveryRegions && { icon: MapPin, text: `Regions: ${seller.deliveryRegions}` },
    { icon: CalendarDays, text: `Joined ${seller.joinedAt.toLocaleDateString()}` },
  ].filter(Boolean) as { icon: React.ElementType; text: string }[];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Card className="mb-8 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/80 to-primary/40" />
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight font-heading">
                  {seller.companyName}
                </h1>
                <Badge className="gap-1">
                  <BadgeCheck className="size-3.5" /> Verified
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {seller.products.length} product
                {seller.products.length === 1 ? "" : "s"} listed
              </p>
            </div>
          </div>

          {seller.description && (
            <p className="mt-4 max-w-prose text-muted-foreground">
              {seller.description}
            </p>
          )}

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {meta.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <m.icon className="size-4 shrink-0 text-primary" />
                <span>{m.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-4 text-xl font-semibold">Catalog</h2>
      {seller.products.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          This seller hasn't listed any products yet.
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {seller.products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
