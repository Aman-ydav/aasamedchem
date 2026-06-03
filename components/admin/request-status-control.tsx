"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateRequestStatus } from "@/app/actions/request";
import type { RequestStatus } from "@/lib/generated/prisma/enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES: RequestStatus[] = ["OPEN", "REVIEWING", "FULFILLED", "CLOSED"];

export function RequestStatusControl({
  id,
  status,
}: {
  id: string;
  status: RequestStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onChange(next: string) {
    if (next === status) return;
    setBusy(true);
    await updateRequestStatus(id, next as RequestStatus);
    setBusy(false);
    toast.success("Request updated");
    router.refresh();
  }

  return (
    <Select value={status} onValueChange={onChange} disabled={busy}>
      <SelectTrigger className="h-9 w-[140px]">
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
