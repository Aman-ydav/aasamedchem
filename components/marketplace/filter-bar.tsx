"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FilterBar({
  current,
  categories,
}: {
  current: Record<string, string>;
  categories: string[];
}) {
  const router = useRouter();

  function update(key: string, value: string) {
    const params = new URLSearchParams(current);
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={current.category ?? "all"}
        onValueChange={(v) => update("category", v)}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={current.dimension ?? "all"}
        onValueChange={(v) => update("dimension", v)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Unit type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All unit types</SelectItem>
          <SelectItem value="WEIGHT">Weight</SelectItem>
          <SelectItem value="VOLUME">Volume</SelectItem>
          <SelectItem value="COUNT">Count</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={current.stock ?? "all"}
        onValueChange={(v) => update("stock", v)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Availability" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All products</SelectItem>
          <SelectItem value="in">In stock</SelectItem>
        </SelectContent>
      </Select>

      <Select value={current.sort ?? "new"} onValueChange={(v) => update("sort", v)}>
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">Newest</SelectItem>
          <SelectItem value="price_asc">Price: low to high</SelectItem>
          <SelectItem value="price_desc">Price: high to low</SelectItem>
          <SelectItem value="name">Name: A–Z</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
