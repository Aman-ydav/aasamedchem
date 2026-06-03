import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole("ADMIN");

  const user = await db.user.findUnique({
    where: { id },
    include: {
      sellerProfile: {
        include: { products: true, orders: true },
      },
      buyerProfile: {
        include: { orders: true, chemicalRequests: true },
      },
    },
  });

  if (!user) notFound();

  const profile = user.sellerProfile ?? user.buyerProfile;
  const profileType =
    user.role === "SELLER" ? "Seller" : user.role === "BUYER" ? "Buyer" : "Admin";

  const fields = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Role", value: user.role },
    { label: "Joined", value: user.createdAt.toLocaleDateString() },
  ];

  const bio = user.sellerProfile?.description ?? user.buyerProfile?.companyName ?? "—";

  return (
    <div>
      <PageHeader title={`${user.name} profile`} description="Full account and profile details." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Profile type</p>
            <Badge className="mt-1">{profileType.toUpperCase()}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Has profile</p>
            <p className="text-2xl font-semibold">{profile ? "Yes" : "No"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Bio / summary</p>
            <p className="line-clamp-2 text-sm text-muted-foreground">{bio}</p>
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

      {user.sellerProfile && (
        <Card className="mt-6">
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Company</p>
              <p className="font-medium">{user.sellerProfile.companyName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={user.sellerProfile.status === "APPROVED" ? "default" : "secondary"}>
                {user.sellerProfile.status}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">GST</p>
              <p className="font-medium">{user.sellerProfile.gstNumber ?? "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Delivery</p>
              <p className="font-medium">{user.sellerProfile.deliveryTime ?? "—"}</p>
            </div>
            {user.sellerProfile.status === "APPROVED" && (
              <div className="sm:col-span-2">
                <Link
                  href={`/sellers/${user.sellerProfile.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Open public storefront
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {user.buyerProfile && (
        <Card className="mt-6">
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Company</p>
              <p className="font-medium">{user.buyerProfile.companyName ?? "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="font-medium">{user.buyerProfile.contactNumber ?? "—"}</p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{user.buyerProfile.address ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}