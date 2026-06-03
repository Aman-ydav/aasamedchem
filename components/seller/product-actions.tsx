"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct } from "@/app/actions/product";
import { Button } from "@/components/ui/button";

export function ProductActions({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusy(true);
    const res = await deleteProduct(id);
    setBusy(false);
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Product deleted");
    router.refresh();
  }

  return (
    <div className="flex justify-end gap-1">
      <Button asChild variant="ghost" size="icon" aria-label="Edit">
        <Link href={`/seller/products/${id}/edit`}>
          <Pencil className="size-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Delete"
        disabled={busy}
        onClick={onDelete}
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}
