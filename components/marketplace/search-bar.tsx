"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar({ current }: { current: Record<string, string> }) {
  const router = useRouter();
  const [value, setValue] = useState(current.q ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function push(next: string) {
    const params = new URLSearchParams(current);
    if (next) params.set("q", next);
    else params.delete("q");
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  }

  function onChange(v: string) {
    setValue(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => push(v), 350);
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search chemicals by name, SKU, category, or seller…"
        className="pl-9"
        aria-label="Search products"
      />
    </div>
  );
}
