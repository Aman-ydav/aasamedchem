import Link from "next/link";
import { requireBuyerProfile } from "@/lib/buyer";
import { db } from "@/lib/db";
import { toNum, formatINR } from "@/lib/format";
import { formatQuantity } from "@/lib/conversion-engine";
import { PageHeader } from "@/components/dashboard/stat-card";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function BuyerOrdersPage() {
  const { profile } = await requireBuyerProfile();
  const orders = await db.order.findMany({
    where: { buyerId: profile.id },
    orderBy: { createdAt: "desc" },
    include: { items: true, seller: true },
  });

  return (
    <div>
      <PageHeader title="My Orders" description="Every order you've placed." />

      {orders.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted-foreground">You haven't placed any orders yet.</p>
          <Button asChild className="mt-4">
            <Link href="/products">Browse the marketplace</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{order.seller.companyName}</p>
                    <p className="text-xs text-muted-foreground">
                      Order #{order.id.slice(-8)} ·{" "}
                      {order.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-semibold">
                      {formatINR(toNum(order.totalPrice))}
                    </span>
                  </div>
                </div>
                <div className="divide-y rounded-lg border">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-4 py-2 text-sm"
                    >
                      <span>
                        {item.productName}
                        <span className="text-muted-foreground">
                          {" "}
                          ×{" "}
                          {formatQuantity(toNum(item.enteredQuantity), item.enteredUnit)}
                        </span>
                      </span>
                      <span>{formatINR(toNum(item.calculatedPrice))}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
