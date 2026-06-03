import type { OrderStatus } from "@/lib/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";

const VARIANT: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  APPROVED: "default",
  PROCESSING: "outline",
  PACKED: "outline",
  SHIPPED: "outline",
  DELIVERED: "default",
  CANCELLED: "destructive",
  REJECTED: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={VARIANT[status]}>{status}</Badge>;
}
