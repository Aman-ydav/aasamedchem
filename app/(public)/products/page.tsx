import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { SearchBar } from "@/components/marketplace/search-bar";
import { FilterBar } from "@/components/marketplace/filter-bar";
import { ProductCard } from "@/components/marketplace/product-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Marketplace" };

const PAGE_SIZE = 12;

function str(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = str(sp.q);
  const category = str(sp.category);
  const dimension = str(sp.dimension);
  const stock = str(sp.stock);
  const sort = str(sp.sort) || "new";
  const page = Math.max(1, parseInt(str(sp.page) || "1", 10) || 1);

  const current: Record<string, string> = {};
  for (const [k, v] of Object.entries({ q, category, dimension, stock, sort })) {
    if (v) current[k] = v;
  }

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    seller: { status: "APPROVED" },
    ...(category ? { category } : {}),
    ...(dimension ? { dimension: dimension as Prisma.ProductWhereInput["dimension"] } : {}),
    ...(stock === "in" ? { inventoryInBase: { gt: 0 } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { seller: { companyName: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { pricePerBaseUnit: "asc" }
      : sort === "price_desc"
        ? { pricePerBaseUnit: "desc" }
        : sort === "name"
          ? { name: "asc" }
          : { createdAt: "desc" };

  const [total, products, categoryRows] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { seller: { select: { companyName: true } } },
    }),
    db.product.findMany({
      where: { isActive: true, seller: { status: "APPROVED" } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (p: number) => {
    const params = new URLSearchParams(current);
    params.set("page", String(p));
    return `/products?${params.toString()}`;
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight font-heading">Marketplace</h1>
        <p className="mt-1 text-muted-foreground">
          Browse chemicals from verified sellers.
        </p>
      </div>

      <div className="sticky top-16 z-20 -mx-2 mb-6 space-y-3 bg-background/80 px-2 py-3 backdrop-blur">
        <SearchBar current={current} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterBar current={current} categories={categoryRows.map((c) => c.category)} />
          <span className="text-sm text-muted-foreground">
            {total} result{total === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {products.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            No products match your search.
          </p>
          <Button asChild className="mt-4">
            <Link href="/buyer/request-chemical">Request this chemical</Link>
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={{ ...p, sellerName: p.seller.companyName }}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button asChild variant="outline" size="sm" disabled={page <= 1}>
                <Link href={pageHref(Math.max(1, page - 1))}>Previous</Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
                <Link href={pageHref(Math.min(totalPages, page + 1))}>Next</Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
