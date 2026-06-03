"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  chemicalRequestSchema,
  type ChemicalRequestInput,
} from "@/lib/validations/request";
import { createChemicalRequest } from "@/app/actions/request";
import { unitLabel } from "@/lib/conversion-engine";
import type { Unit } from "@/lib/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_UNITS: Unit[] = ["G", "KG", "ML", "L", "UNIT"];

export function RequestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ChemicalRequestInput>({
    resolver: zodResolver(chemicalRequestSchema),
    defaultValues: {
      chemicalName: "",
      requestedQuantity: 1,
      requestedUnit: "KG",
      notes: "",
      deliveryLocation: "",
    },
  });

  async function onSubmit(values: ChemicalRequestInput) {
    setLoading(true);
    const res = await createChemicalRequest(values);
    setLoading(false);
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Request submitted — our admin team will review it");
    router.push("/buyer/requests");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="chemicalName">Chemical name</Label>
            <Input id="chemicalName" {...register("chemicalName")} placeholder="e.g. Anhydrous Ethanol" />
            {errors.chemicalName && (
              <p className="text-sm text-destructive">{errors.chemicalName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestedQuantity">Required quantity</Label>
            <Input
              id="requestedQuantity"
              type="number"
              step="any"
              {...register("requestedQuantity", { valueAsNumber: true })}
            />
            {errors.requestedQuantity && (
              <p className="text-sm text-destructive">{errors.requestedQuantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Unit</Label>
            <Controller
              control={control}
              name="requestedUnit"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {unitLabel(u)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="deliveryLocation">Delivery location</Label>
            <Input id="deliveryLocation" {...register("deliveryLocation")} placeholder="City, State" />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" rows={3} {...register("notes")} placeholder="Purity, grade, packaging, or any other requirements." />
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Submit request"}
        </Button>
      </div>
    </form>
  );
}
