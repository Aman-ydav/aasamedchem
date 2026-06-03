import { PageHeader } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";

export default function SellerProfilePage() {
  return (
    <div>
      <PageHeader
        title="Storefront"
        description="Your public seller profile and storefront details."
      />
      <Card className="p-10 text-center text-muted-foreground">
        Storefront editing arrives with the seller storefront feature.
      </Card>
    </div>
  );
}
