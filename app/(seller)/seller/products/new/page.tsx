import { requireSellerProfile } from "@/lib/seller";
import { PageHeader } from "@/components/dashboard/stat-card";
import { ProductForm } from "@/components/seller/product-form";

export default async function NewProductPage() {
  await requireSellerProfile();
  return (
    <div>
      <PageHeader
        title="Add product"
        description="List a new chemical. Enter values in your selling unit — we store the smallest unit automatically."
      />
      <ProductForm mode="create" />
    </div>
  );
}
