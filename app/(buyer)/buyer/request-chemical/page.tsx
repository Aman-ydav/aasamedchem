import { PageHeader } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";

export default function RequestChemicalPage() {
  return (
    <div>
      <PageHeader
        title="Request a Chemical"
        description="Can't find what you need? Ask the platform to source it."
      />
      <Card className="p-10 text-center text-muted-foreground">
        The request form arrives with the chemical request feature.
      </Card>
    </div>
  );
}
