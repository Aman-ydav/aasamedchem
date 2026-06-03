"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Dimension, Unit } from "@/lib/generated/prisma/enums";
import {
  unitsForDimension,
  unitLabel,
  formatBaseQuantity,
  formatQuantity,
  pricePerSellUnit,
  SELL_UNIT,
} from "@/lib/conversion-engine";
import { quote, hasStock, meetsMinimum } from "@/lib/quotation-engine";
import { formatINR } from "@/lib/format";
import { addToCart } from "@/lib/cart-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function QuotationCalculator(props: {
  productId: string;
  name: string;
  sellerId: string;
  sellerName: string;
  dimension: Dimension;
  pricePerBaseUnit: number;
  inventoryInBase: number;
  minimumOrderQty: number;
  canOrder: boolean;
}) {
  const { dimension, pricePerBaseUnit, inventoryInBase, minimumOrderQty, canOrder } = props;
  const units = unitsForDimension(dimension);
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState<Unit>(SELL_UNIT[dimension]);

  const result = useMemo(() => {
    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) return null;
    try {
      const q = quote({
        pricePerBaseUnit,
        enteredQuantity: n,
        enteredUnit: unit,
        dimension,
      });
      return {
        ...q,
        inStock: hasStock(q.baseQuantity, inventoryInBase),
        aboveMin: meetsMinimum(q.baseQuantity, minimumOrderQty),
      };
    } catch {
      return null;
    }
  }, [qty, unit, pricePerBaseUnit, dimension, inventoryInBase, minimumOrderQty]);

  const canAdd = !!result && result.inStock && result.aboveMin && canOrder;

  function onAdd() {
    if (!result) return;
    addToCart({
      productId: props.productId,
      name: props.name,
      sellerId: props.sellerId,
      sellerName: props.sellerName,
      dimension,
      enteredQuantity: result.enteredQuantity,
      enteredUnit: result.enteredUnit,
      pricePerBaseUnit,
    });
    toast.success("Added to your quote cart");
  }

  return (
    <Card className="border-primary/30">
      <CardContent className="space-y-4 p-6">
        <div>
          <p className="text-sm font-medium">Live quotation</p>
          <p className="text-sm text-muted-foreground">
            {formatINR(pricePerSellUnit(pricePerBaseUnit, dimension))} per{" "}
            {unitLabel(SELL_UNIT[dimension])}
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            type="number"
            step="any"
            min="0"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="flex-1"
            aria-label="Quantity"
          />
          <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u} value={u}>
                  {unitLabel(u)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {result && (
          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              {formatQuantity(result.enteredQuantity, result.enteredUnit)}
              <ArrowRight className="size-3.5" />
              {formatBaseQuantity(result.baseQuantity, dimension)}
            </div>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-2xl font-semibold tracking-tight">
                {formatINR(result.total)}
              </span>
            </div>
          </div>
        )}

        {result && !result.aboveMin && (
          <p className="text-sm text-destructive">
            Below the minimum order of{" "}
            {formatBaseQuantity(minimumOrderQty, dimension)}.
          </p>
        )}
        {result && result.aboveMin && !result.inStock && (
          <p className="text-sm text-destructive">
            Only {formatBaseQuantity(inventoryInBase, dimension)} in stock.
          </p>
        )}

        {canOrder ? (
          <div className="flex gap-2">
            <Button className="flex-1" onClick={onAdd} disabled={!canAdd}>
              <ShoppingCart className="size-4" /> Add to quote
            </Button>
            <Button asChild variant="outline">
              <Link href="/buyer/cart">View cart</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Only buyers can place orders. You can still view pricing and product details.
            <div className="mt-3 flex gap-2">
              <Button asChild size="sm">
                <Link href={`/login?callbackUrl=${encodeURIComponent(`/product/${props.productId}`)}`}>
                  Log in as buyer
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/register">Create buyer account</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
