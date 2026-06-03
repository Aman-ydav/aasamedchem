"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import {
  unitsForDimension,
  unitLabel,
  DIMENSION_LABEL,
} from "@/lib/conversion-engine";
import type { Dimension } from "@/lib/generated/prisma/enums";
import { createProduct, updateProduct } from "@/app/actions/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const DIMENSIONS: Dimension[] = ["WEIGHT", "VOLUME", "COUNT"];
const DEFAULT_UNIT: Record<Dimension, ProductInput["inputUnit"]> = {
  WEIGHT: "KG",
  VOLUME: "L",
  COUNT: "UNIT",
};

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function ProductForm({
  mode,
  productId,
  initial,
}: {
  mode: "create" | "edit";
  productId?: string;
  initial?: Partial<ProductInput>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      description: "",
      image: "",
      dimension: "WEIGHT",
      inputUnit: "KG",
      inventoryQuantity: 0,
      pricePerUnit: 0,
      minimumOrderQty: 1,
      leadTime: "",
      isActive: true,
      ...initial,
    },
  });

  const dimension = watch("dimension");
  const inputUnit = watch("inputUnit");

  async function onSubmit(values: ProductInput) {
    setLoading(true);
    const res =
      mode === "create"
        ? await createProduct(values)
        : await updateProduct(productId!, values);
    setLoading(false);
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    toast.success(mode === "create" ? "Product created" : "Product updated");
    router.push("/seller/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
          <Field label="Product name" error={errors.name?.message}>
            <Input {...register("name")} placeholder="Acetone 99.5%" />
          </Field>
          <Field label="SKU" error={errors.sku?.message}>
            <Input {...register("sku")} placeholder="ACE-995-01" />
          </Field>
          <Field label="Category" error={errors.category?.message}>
            <Input {...register("category")} placeholder="Solvents" />
          </Field>
          <Field label="Image URL (optional)" error={errors.image?.message}>
            <Input {...register("image")} placeholder="https://…" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description (optional)" error={errors.description?.message}>
              <Textarea {...register("description")} rows={3} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
          <Field
            label="Dimension"
            error={errors.dimension?.message}
            hint="How this product is measured."
          >
            <Controller
              control={control}
              name="dimension"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setValue("inputUnit", DEFAULT_UNIT[val as Dimension]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIMENSIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {DIMENSION_LABEL[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field
            label="Selling unit"
            error={errors.inputUnit?.message}
            hint="Enter inventory & price in this unit; we store the smallest unit."
          >
            <Controller
              control={control}
              name="inputUnit"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitsForDimension(dimension).map((u) => (
                      <SelectItem key={u} value={u}>
                        {unitLabel(u)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field
            label={`Inventory (in ${unitLabel(inputUnit)})`}
            error={errors.inventoryQuantity?.message}
          >
            <Input
              type="number"
              step="any"
              {...register("inventoryQuantity", { valueAsNumber: true })}
            />
          </Field>

          <Field
            label={`Price per ${unitLabel(inputUnit)} (₹)`}
            error={errors.pricePerUnit?.message}
          >
            <Input
              type="number"
              step="any"
              {...register("pricePerUnit", { valueAsNumber: true })}
            />
          </Field>

          <Field
            label={`Minimum order (in ${unitLabel(inputUnit)})`}
            error={errors.minimumOrderQty?.message}
          >
            <Input
              type="number"
              step="any"
              {...register("minimumOrderQty", { valueAsNumber: true })}
            />
          </Field>

          <Field label="Lead time (optional)" error={errors.leadTime?.message}>
            <Input {...register("leadTime")} placeholder="3–5 business days" />
          </Field>

          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              {...register("isActive")}
            />
            <span className="text-sm">List this product on the marketplace</span>
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
