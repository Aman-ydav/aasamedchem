import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireSellerProfile } from "@/lib/seller";
import { PageHeader } from "@/components/dashboard/stat-card";
import { ProfileForm } from "@/components/seller/profile-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function SellerProfilePage() {
  const { profile } = await requireSellerProfile();

  return (
    <div>
      <PageHeader
        title="Storefront"
        description="This information appears on your public seller profile."
        action={
          profile.status === "APPROVED" ? (
            <Button asChild variant="outline">
              <Link href={`/sellers/${profile.id}`} target="_blank">
                View public storefront <ExternalLink className="size-4" />
              </Link>
            </Button>
          ) : (
            <Badge variant="secondary">Visible once approved</Badge>
          )
        }
      />
      <ProfileForm
        initial={{
          companyName: profile.companyName,
          gstNumber: profile.gstNumber ?? "",
          description: profile.description ?? "",
          address: profile.address ?? "",
          contactNumber: profile.contactNumber ?? "",
          deliveryTime: profile.deliveryTime ?? "",
          deliveryRegions: profile.deliveryRegions ?? "",
        }}
      />
    </div>
  );
}
