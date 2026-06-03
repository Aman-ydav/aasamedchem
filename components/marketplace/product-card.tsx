import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { toNum, formatINR } from "@/lib/format";
import {
  pricePerSellUnit,
  unitLabel,
  formatBaseQuantity,
  SELL_UNIT,
} from "@/lib/conversion-engine";
import type { Dimension } from "@/lib/generated/prisma/enums";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ProductCardData {
  id: string;
  name: string;
  category: string;
  image: string | null;
  dimension: Dimension;
  pricePerBaseUnit: unknown;
  inventoryInBase: unknown;
  sellerName?: string;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const price = pricePerSellUnit(toNum(product.pricePerBaseUnit), product.dimension);
  const stock = toNum(product.inventoryInBase);

  return (
    <Link href={`/product/${product.id}`} className="group">
      <Card className="h-full overflow-hidden py-0 transition-shadow hover:shadow-md">
        <div className="grid aspect-[4/3] place-items-center overflow-hidden bg-muted/40">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="size-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <FlaskConical className="size-12 text-muted-foreground/40" />
          )}
        </div>
        <CardContent className="space-y-1.5 p-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
            {stock > 0 ? (
              <span className="text-xs text-muted-foreground">
                {formatBaseQuantity(stock, product.dimension)}
              </span>
            ) : (
              <Badge variant="outline" className="text-xs text-destructive">
                Out of stock
              </Badge>
            )}
          </div>
          <h3 className="line-clamp-1 font-medium">{product.name}</h3>
          {product.sellerName && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {product.sellerName}
            </p>
          )}
          <p className="pt-1 font-semibold">
            {formatINR(price)}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / {unitLabel(SELL_UNIT[product.dimension])}
            </span>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
