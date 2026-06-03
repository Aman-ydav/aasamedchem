import Link from "next/link";
import { ShoppingCart, Clock, PackageCheck, FlaskConical } from "lucide-react";
import { requireBuyerProfile } from "@/lib/buyer";
import { db } from "@/lib/db";
import { StatCard, PageHeader } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";

export default async function BuyerOverview() {
  const { user, profile } = await requireBuyerProfile();

  const [orders, requests] = await Promise.all([
    db.order.findMany({ where: { buyerId: profile.id }, select: { status: true } }),
    db.chemicalRequest.count({ where: { buyerId: profile.id } }),
  ]);

  const pending = orders.filter((o) => o.status === "PENDING").length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div>
      <PageHeader
        title={`Hello, ${user.name ?? "buyer"}`}
        description="Track your orders, quotations, and chemical requests."
        action={
          <Button asChild>
            <Link href="/products">Browse marketplace</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total orders" value={orders.length} icon={ShoppingCart} />
        <StatCard label="Pending" value={pending} icon={Clock} />
        <StatCard label="Delivered" value={delivered} icon={PackageCheck} />
        <StatCard label="Chemical requests" value={requests} icon={FlaskConical} />
      </div>
    </div>
  );
}
