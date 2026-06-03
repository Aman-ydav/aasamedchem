"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminDeleteProduct, adminSetProductActive } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

export function AdminProductActions({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    await adminSetProductActive(id, !isActive);
    setBusy(false);
    toast.success(isActive ? "Product hidden" : "Product listed");
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this product?")) return;
    setBusy(true);
    const res = await adminDeleteProduct(id);
    setBusy(false);
    if (res?.error) return toast.error(res.error);
    toast.success("Product deleted");
    router.refresh();
  }

  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="outline" disabled={busy} onClick={toggle}>
        {isActive ? "Hide" : "List"}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        disabled={busy}
        onClick={remove}
        aria-label="Delete"
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}
