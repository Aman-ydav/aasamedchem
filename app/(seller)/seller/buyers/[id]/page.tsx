import { notFound } from "next/navigation";
import { requireSellerProfile } from "@/lib/seller";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SellerBuyerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile: seller } = await requireSellerProfile();

  const buyer = await db.buyerProfile.findFirst({
    where: { id },
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      orders: { where: { sellerId: seller.id } },
      chemicalRequests: true,
    },
  });

  if (!buyer) notFound();

  const fields = [
    { label: "Company", value: buyer.companyName ?? "—" },
    { label: "Contact", value: buyer.contactNumber ?? "—" },
    { label: "Address", value: buyer.address ?? "—" },
    { label: "User name", value: buyer.user.name ?? "—" },
    { label: "Email", value: buyer.user.email ?? "—" },
  ];

  return (
    <div>
      <PageHeader
        title={buyer.companyName ?? "Buyer profile"}
        description="Profile information for the customer behind the order or request."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Orders with you</p>
            <p className="text-2xl font-semibold">{buyer.orders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Chemical requests</p>
            <p className="text-2xl font-semibold">{buyer.chemicalRequests.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Profile type</p>
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