import { requireSellerProfile } from "@/lib/seller";
import { db } from "@/lib/db";
import { toNum, formatINR } from "@/lib/format";
import { formatQuantity } from "@/lib/conversion-engine";
import { PageHeader } from "@/components/dashboard/stat-card";
import { OrderStatusControl } from "@/components/orders/order-status-control";
import { Card, CardContent } from "@/components/ui/card";

export default async function SellerOrdersPage() {
  const { profile } = await requireSellerProfile();
  const orders = await db.order.findMany({
    where: { sellerId: profile.id },
    orderBy: { createdAt: "desc" },
    include: { items: true, buyer: true },
  });

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Approve orders to reserve stock. Approving decrements your inventory automatically."
      />

      {orders.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No orders yet.
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {order.buyer.companyName ?? "Buyer"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Order #{order.id.slice(-8)} ·{" "}
                      {order.createdAt.toLocaleDateString()} ·{" "}
                      {formatINR(toNum(order.totalPrice))}
                    </p>
                  </div>
                  <OrderStatusControl orderId={order.id} status={order.status} />
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
