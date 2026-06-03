"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  sellerProfileSchema,
  type SellerProfileInput,
} from "@/lib/validations/seller";
import { updateSellerProfile } from "@/app/actions/seller";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export function ProfileForm({ initial }: { initial: SellerProfileInput }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SellerProfileInput>({
    resolver: zodResolver(sellerProfileSchema),
    defaultValues: initial,
  });

  async function onSubmit(values: SellerProfileInput) {
    setLoading(true);
    const res = await updateSellerProfile(values);
    setLoading(false);
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Storefront updated");
    router.refresh();
  }

  const fields: Array<{
    name: keyof SellerProfileInput;
    label: string;
    placeholder?: string;
  }> = [
    { name: "companyName", label: "Company name" },
    { name: "gstNumber", label: "GST number", placeholder: "22AAAAA0000A1Z5" },
    { name: "contactNumber", label: "Contact number" },
    { name: "deliveryTime", label: "Delivery time", placeholder: "3–5 business days" },
    { name: "deliveryRegions", label: "Delivery regions", placeholder: "Maharashtra, Gujarat…" },
    { name: "address", label: "Address" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.name} className="space-y-2">
              <Label htmlFor={f.name}>{f.label}</Label>
              <Input id={f.name} placeholder={f.placeholder} {...register(f.name)} />
              {errors[f.name] && (
                <p className="text-sm text-destructive">
                  {errors[f.name]?.message}
                </p>
              )}
            </div>
          ))}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Storefront description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Tell buyers about your company, certifications, and specialities."
              {...register("description")}
            />
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save storefront"}
        </Button>
      </div>
    </form>
  );
}
