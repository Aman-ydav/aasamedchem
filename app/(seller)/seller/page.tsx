import Link from "next/link";
import { Package, Boxes, ShoppingCart, IndianRupee, Clock, CircleCheck } from "lucide-react";
import { requireSellerProfile } from "@/lib/seller";
import { db } from "@/lib/db";
import { toNum, formatINR } from "@/lib/format";
import { StatCard, PageHeader } from "@/components/dashboard/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_COPY = {
  PENDING: "Your storefront is awaiting admin approval. You can add products now — they go live once approved.",
  APPROVED: "Your storefront is approved and visible in the marketplace.",
  SUSPENDED: "Your storefront is suspended. Contact the platform admin.",
} as const;

export default async function SellerOverview() {
  const { profile } = await requireSellerProfile();

  const [products, orders] = await Promise.all([
    db.product.findMany({ where: { sellerId: profile.id } }),
    db.order.findMany({ where: { sellerId: profile.id } }),
  ]);

  const inventoryValue = products.reduce(
    (sum, p) => sum + toNum(p.pricePerBaseUnit) * toNum(p.inventoryInBase),
    0,
  );
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const revenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((s, o) => s + toNum(o.totalPrice), 0);

  const profileFields = [
    profile.companyName,
    profile.gstNumber,
    profile.description,
    profile.address,
    profile.contactNumber,
    profile.deliveryTime,
  ];
  const completion = Math.round(
    (profileFields.filter(Boolean).length / profileFields.length) * 100,
  );

  return (
    <div>
      <PageHeader
        title={`Welcome, ${profile.companyName}`}
        description="Your seller overview at a glance."
        action={
          <Button asChild>
            <Link href="/seller/products/new">Add product</Link>
          </Button>
        }
      />

      <Card className="mb-6 border-primary/30 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-3">
            <Badge
              variant={profile.status === "APPROVED" ? "default" : "secondary"}
            >
              {profile.status}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {STATUS_COPY[profile.status]}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Products" value={products.length} icon={Package} />
        <StatCard
          label="Active listings"
          value={products.filter((p) => p.isActive).length}
          icon={CircleCheck}
        />
        <StatCard
          label="Inventory value"
          value={formatINR(inventoryValue)}
          icon={Boxes}
        />
        <StatCard label="Total orders" value={orders.length} icon={ShoppingCart} />
        <StatCard label="Pending orders" value={pendingOrders} icon={Clock} />
        <StatCard
          label="Revenue (delivered)"
          value={formatINR(revenue)}
          icon={IndianRupee}
        />
      </div>

      <Card className="mt-6">
        <CardContent className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Profile completion</p>
            <span className="text-sm text-muted-foreground">{completion}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
          <Button asChild variant="link" className="mt-2 h-auto p-0">
            <Link href="/seller/profile">Complete your storefront →</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
