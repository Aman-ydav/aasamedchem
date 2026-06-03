import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { toNum } from "@/lib/format";
import { formatQuantity } from "@/lib/conversion-engine";
import { PageHeader } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RequestStatusControl } from "@/components/admin/request-status-control";

export default async function AdminRequestsPage() {
  await requireRole("ADMIN");
  const requests = await db.chemicalRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { buyer: { select: { companyName: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Chemical Requests"
        description="Buyer requests for chemicals not yet on the marketplace."
      />
      {requests.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No chemical requests yet.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chemical</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.chemicalName}</TableCell>
                  <TableCell>
                    {formatQuantity(toNum(r.requestedQuantity), r.requestedUnit)}
                  </TableCell>
                  <TableCell>{r.buyer.companyName ?? "—"}</TableCell>
                  <TableCell>{r.deliveryLocation ?? "—"}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-muted-foreground">
                    {r.notes ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <RequestStatusControl id={r.id} status={r.status} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
