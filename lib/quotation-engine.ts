// ─────────────────────────────────────────────────────────────────────────
// AasaMedChem — Live Quotation Engine
// Computes a price from a buyer's entered quantity + unit, using the
// conversion engine as the single source of truth. Pure & client/server safe.
//
//   total = toBase(enteredQuantity, enteredUnit) × pricePerBaseUnit
//
// Example: Acetone at ₹500/L is stored as ₹0.5/mL.
//   750 mL -> 750 base × 0.5 = ₹375
// ─────────────────────────────────────────────────────────────────────────

import type { Dimension, Unit } from "@/lib/generated/prisma/enums";
import { toBase, assertSameDimension } from "./conversion-engine";

export interface QuoteInput {
  /** Price per smallest unit (e.g. ₹/mL), as stored in the DB. */
  pricePerBaseUnit: number;
  enteredQuantity: number;
  enteredUnit: Unit;
  dimension: Dimension;
}

export interface QuoteResult {
  enteredQuantity: number;
  enteredUnit: Unit;
  /** Quantity converted to the smallest unit. */
  baseQuantity: number;
  pricePerBaseUnit: number;
  total: number;
}

export function quote(input: QuoteInput): QuoteResult {
  assertSameDimension(input.enteredUnit, input.dimension);
  const baseQuantity = toBase(input.enteredQuantity, input.enteredUnit);
  const total = baseQuantity * input.pricePerBaseUnit;
  return {
    enteredQuantity: input.enteredQuantity,
    enteredUnit: input.enteredUnit,
    baseQuantity,
    pricePerBaseUnit: input.pricePerBaseUnit,
    total,
  };
}

/** True when the requested base quantity can be fulfilled from stock. */
export function hasStock(baseQuantity: number, inventoryInBase: number): boolean {
  return baseQuantity <= inventoryInBase + 1e-9;
}

/** True when the requested base quantity meets the product's minimum order. */
export function meetsMinimum(baseQuantity: number, minimumOrderInBase: number): boolean {
  return baseQuantity >= minimumOrderInBase - 1e-9;
}
