import { PageHeader } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";

export default function BuyerRequestsPage() {
  return (
    <div>
      <PageHeader
        title="My Requests"
        description="Chemicals you've requested from the platform."
      />
      <Card className="p-10 text-center text-muted-foreground">
        Chemical requests arrive with the request feature.
      </Card>
    </div>
  );
}
