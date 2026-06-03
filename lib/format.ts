// Display helpers. `toNum` safely turns a Prisma Decimal (or string/number)
// into a JS number for formatting and engine math.

export function toNum(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "object" && typeof (value as { toNumber?: unknown }).toNumber === "function") {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(String(value));
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatINR(value: number): string {
  return inr.format(value);
}

/** Currency with up to 4 decimals — used for per-smallest-unit prices. */
export function formatINRPrecise(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 4,
  }).format(value);
}
