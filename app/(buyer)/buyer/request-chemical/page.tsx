import { requireBuyerProfile } from "@/lib/buyer";
import { PageHeader } from "@/components/dashboard/stat-card";
import { RequestForm } from "@/components/buyer/request-form";

export default async function RequestChemicalPage() {
  await requireBuyerProfile();
  return (
    <div>
      <PageHeader
        title="Request a Chemical"
        description="Can't find what you need in the marketplace? Tell us and our team will source it."
      />
      <RequestForm />
    </div>
  );
}
