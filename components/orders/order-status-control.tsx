"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrderStatus } from "@/app/actions/order";
import type { OrderStatus } from "@/lib/generated/prisma/enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES: OrderStatus[] = [
  "PENDING",
  "APPROVED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REJECTED",
];

export function OrderStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onChange(next: string) {
    if (next === status) return;
    setBusy(true);
    const res = await updateOrderStatus(orderId, next as OrderStatus);
    setBusy(false);
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    toast.success(`Order marked ${next.toLowerCase()}`);
    router.refresh();
  }

  return (
    <Select value={status} onValueChange={onChange} disabled={busy}>
      <SelectTrigger className="h-9 w-[150px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
