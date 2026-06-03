"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setInventory } from "@/app/actions/product";
import { toBase } from "@/lib/conversion-engine";
import type { Unit } from "@/lib/generated/prisma/enums";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function InventoryEditor({
  id,
  sellUnit,
  unitLabel,
  initialValue,
}: {
  id: string;
  sellUnit: Unit;
  unitLabel: string;
  initialValue: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState(String(initialValue));
  const [busy, setBusy] = useState(false);

  async function save() {
    const qty = Number(value);
    if (!Number.isFinite(qty) || qty < 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    setBusy(true);
    const res = await setInventory(id, toBase(qty, sellUnit));
    setBusy(false);
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Inventory updated");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Input
        type="number"
        step="any"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-28"
      />
      <span className="w-10 text-sm text-muted-foreground">{unitLabel}</span>
      <Button size="sm" variant="outline" onClick={save} disabled={busy}>
        Save
      </Button>
    </div>
  );
}
