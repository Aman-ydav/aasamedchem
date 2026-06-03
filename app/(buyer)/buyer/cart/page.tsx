"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCart, removeFromCart, clearCart } from "@/lib/cart-store";
import { quote } from "@/lib/quotation-engine";
import { formatQuantity, formatBaseQuantity } from "@/lib/conversion-engine";
import { formatINR } from "@/lib/format";
import { placeOrder } from "@/app/actions/order";
import { PageHeader } from "@/components/dashboard/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const router = useRouter();
  const items = useCart();
  const [placing, setPlacing] = useState(false);

  const priced = useMemo(
    () =>
      items.map((it) => {
        const q = quote({
          pricePerBaseUnit: it.pricePerBaseUnit,
          enteredQuantity: it.enteredQuantity,
          enteredUnit: it.enteredUnit,
          dimension: it.dimension,
        });
        return { ...it, q };
      }),
    [items],
  );

  const total = priced.reduce((s, p) => s + p.q.total, 0);

  async function onPlace() {
    setPlacing(true);
    const res = await placeOrder(
      items.map((i) => ({
        productId: i.productId,
        enteredQuantity: i.enteredQuantity,
        enteredUnit: i.enteredUnit,
      })),
    );
    setPlacing(false);
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    clearCart();
    toast.success(
      `Order placed across ${res.orders} seller${res.orders === 1 ? "" : "s"}`,
    );
    router.push("/buyer/orders");
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Quote cart"
        description="Review your quotations and place your order."
      />

      {priced.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted-foreground">Your quote cart is empty.</p>
          <Button asChild className="mt-4">
            <Link href="/products">Browse the marketplace</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {priced.map((p, i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <Link
                    href={`/product/${p.productId}`}
                    className="font-medium hover:underline"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{p.sellerName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatQuantity(p.enteredQuantity, p.enteredUnit)} ={" "}
                    {formatBaseQuantity(p.q.baseQuantity, p.dimension)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{formatINR(p.q.total)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove"
                    onClick={() => removeFromCart(i)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <span className="text-lg font-medium">Total</span>
              <span className="text-2xl font-semibold">{formatINR(total)}</span>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => clearCart()}>
              Clear cart
            </Button>
            <Button onClick={onPlace} disabled={placing}>
              {placing ? "Placing order…" : "Place order"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
