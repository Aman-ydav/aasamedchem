import { PageHeader } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";

export default function SellerOrdersPage() {
  return (
    <div>
      <PageHeader title="Orders" description="Orders placed for your products." />
      <Card className="p-10 text-center text-muted-foreground">
        Order management arrives with the quotation workflow.
      </Card>
    </div>
  );
}
