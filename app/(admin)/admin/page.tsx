import {
  Users,
  Store,
  ShoppingBag,
  Package,
  ShoppingCart,
  Clock,
  FileText,
  IndianRupee,
} from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { toNum, formatINR } from "@/lib/format";
import { StatCard, PageHeader } from "@/components/dashboard/stat-card";

export default async function AdminOverview() {
  await requireRole("ADMIN");

  const [
    users,
    sellers,
    buyers,
    products,
    orders,
    pendingOrders,
    pendingSellers,
    openRequests,
    revenueAgg,
  ] = await Promise.all([
    db.user.count(),
    db.sellerProfile.count(),
    db.buyerProfile.count(),
    db.product.count(),
    db.order.count(),
    db.order.count({ where: { status: "PENDING" } }),
    db.sellerProfile.count({ where: { status: "PENDING" } }),
    db.chemicalRequest.count({ where: { status: "OPEN" } }),
    db.order.aggregate({
      _sum: { totalPrice: true },
      where: { status: "DELIVERED" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Admin overview"
        description="Platform-wide activity at a glance."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={users} icon={Users} />
        <StatCard
          label="Sellers"
          value={sellers}
          icon={Store}
          hint={`${pendingSellers} awaiting approval`}
        />
        <StatCard label="Buyers" value={buyers} icon={ShoppingBag} />
        <StatCard label="Products" value={products} icon={Package} />
        <StatCard label="Total orders" value={orders} icon={ShoppingCart} />
        <StatCard label="Pending orders" value={pendingOrders} icon={Clock} />
        <StatCard label="Open requests" value={openRequests} icon={FileText} />
        <StatCard
          label="Revenue (delivered)"
          value={formatINR(toNum(revenueAgg._sum.totalPrice))}
          icon={IndianRupee}
        />
      </div>
    </div>
  );
}
