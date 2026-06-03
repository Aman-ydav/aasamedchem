"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setSellerStatus } from "@/app/actions/admin";
import type { SellerStatus } from "@/lib/generated/prisma/enums";
import { Button } from "@/components/ui/button";

export function SellerStatusControl({
  sellerId,
  status,
}: {
  sellerId: string;
  status: SellerStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function set(next: SellerStatus) {
    setBusy(true);
    await setSellerStatus(sellerId, next);
    setBusy(false);
    toast.success(`Seller ${next.toLowerCase()}`);
    router.refresh();
  }

  return (
    <div className="flex justify-end gap-2">
      {status !== "APPROVED" && (
        <Button size="sm" disabled={busy} onClick={() => set("APPROVED")}>
          Approve
        </Button>
      )}
      {status !== "SUSPENDED" && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => set("SUSPENDED")}
        >
          Suspend
        </Button>
      )}
    </div>
  );
}
