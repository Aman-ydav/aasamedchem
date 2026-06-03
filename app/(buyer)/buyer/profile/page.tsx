import { requireBuyerProfile } from "@/lib/buyer";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function BuyerProfilePage() {
  const { user, profile } = await requireBuyerProfile();

  const [orders, requests] = await Promise.all([
    db.order.count({ where: { buyerId: profile.id } }),
    db.chemicalRequest.count({ where: { buyerId: profile.id } }),
  ]);

  const fields = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Company", value: profile.companyName ?? "—" },
    { label: "Contact", value: profile.contactNumber ?? "—" },
    { label: "Address", value: profile.address ?? "—" },
  ];

  return (
    <div>
      <PageHeader title="My profile" description="Your buyer account details." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Orders</p>
            <p className="text-2xl font-semibold">{orders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Chemical requests</p>
            <p className="text-2xl font-semibold">{requests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Role</p>
            <Badge className="mt-1">BUYER</Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className="space-y-1">
              <p className="text-sm text-muted-foreground">{field.label}</p>
              <p className="font-medium">{field.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}