// ─────────────────────────────────────────────────────────────────────────
// AasaMedChem — Unit Conversion Engine
// THE single source of truth for converting between units.
//
// Rules:
//   WEIGHT: base = gram (g)      1 kg = 1000 g
//   VOLUME: base = millilitre(mL) 1 L  = 1000 mL
//   COUNT:  base = unit           1 unit = 1 unit
//
// Inventory and prices are ALWAYS stored in the base (smallest) unit.
// Pure, dependency-free, and safe to import in both server and client code.
// ─────────────────────────────────────────────────────────────────────────

import type { Dimension, Unit } from "@/lib/generated/prisma/enums";

interface UnitMeta {
  dimension: Dimension;
  /** Multiplier to convert a value in this unit into the base unit. */
  factorToBase: number;
  /** Human-friendly label. */
  label: string;
}

export const UNIT_TABLE: Record<Unit, UnitMeta> = {
  G: { dimension: "WEIGHT", factorToBase: 1, label: "g" },
  KG: { dimension: "WEIGHT", factorToBase: 1000, label: "kg" },
  ML: { dimension: "VOLUME", factorToBase: 1, label: "mL" },
  L: { dimension: "VOLUME", factorToBase: 1000, label: "L" },
  UNIT: { dimension: "COUNT", factorToBase: 1, label: "unit" },
};

/** The base (smallest) unit used for storage, per dimension. */
export const BASE_UNIT: Record<Dimension, Unit> = {
  WEIGHT: "G",
  VOLUME: "ML",
  COUNT: "UNIT",
};

/** The natural "selling" unit sellers/buyers think in, per dimension. */
export const SELL_UNIT: Record<Dimension, Unit> = {
  WEIGHT: "KG",
  VOLUME: "L",
  COUNT: "UNIT",
};

/** Convert a per-base-unit price into a per-selling-unit price (e.g. ₹/mL -> ₹/L). */
export function pricePerSellUnit(pricePerBase: number, dimension: Dimension): number {
  return pricePerBase * UNIT_TABLE[SELL_UNIT[dimension]].factorToBase;
}

export const DIMENSION_LABEL: Record<Dimension, string> = {
  WEIGHT: "Weight",
  VOLUME: "Volume",
  COUNT: "Count",
};

/** Units that belong to a given dimension (drives unit dropdowns in forms). */
export function unitsForDimension(dimension: Dimension): Unit[] {
  return (Object.keys(UNIT_TABLE) as Unit[]).filter(
    (u) => UNIT_TABLE[u].dimension === dimension,
  );
}

export function unitLabel(unit: Unit): string {
  return UNIT_TABLE[unit].label;
}

export function dimensionOf(unit: Unit): Dimension {
  return UNIT_TABLE[unit].dimension;
}

export function isUnitValidForDimension(unit: Unit, dimension: Dimension): boolean {
  return UNIT_TABLE[unit].dimension === dimension;
}

/** Convert a quantity expressed in `unit` into the base unit. */
export function toBase(quantity: number, unit: Unit): number {
  return quantity * UNIT_TABLE[unit].factorToBase;
}

/** Convert a base-unit quantity back into `unit`. */
export function fromBase(baseQuantity: number, unit: Unit): number {
  return baseQuantity / UNIT_TABLE[unit].factorToBase;
}

/** Throws if the unit doesn't match the product's dimension (e.g. mL for WEIGHT). */
export function assertSameDimension(unit: Unit, dimension: Dimension): void {
  if (!isUnitValidForDimension(unit, dimension)) {
    throw new Error(
      `Unit "${unitLabel(unit)}" cannot be used for ${DIMENSION_LABEL[
        dimension
      ].toLowerCase()} products.`,
    );
  }
}

/** Trim trailing zeros for clean display (e.g. 0.7500 -> "0.75"). */
function trim(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return parseFloat(value.toFixed(6)).toString();
}

/**
 * Render a base-unit quantity using the most readable unit for its dimension.
 * e.g. 50000 mL -> "50 L", 250 g -> "250 g", 5 unit -> "5 units".
 */
export function formatBaseQuantity(baseQuantity: number, dimension: Dimension): string {
  if (dimension === "COUNT") {
    const n = trim(baseQuantity);
    return `${n} ${baseQuantity === 1 ? "unit" : "units"}`;
  }
  const large: Unit = dimension === "WEIGHT" ? "KG" : "L";
  const small: Unit = dimension === "WEIGHT" ? "G" : "ML";
  if (Math.abs(baseQuantity) >= UNIT_TABLE[large].factorToBase) {
    return `${trim(fromBase(baseQuantity, large))} ${unitLabel(large)}`;
  }
  return `${trim(baseQuantity)} ${unitLabel(small)}`;
}

/** Render a quantity in a specific unit, e.g. (750, "ML") -> "750 mL". */
export function formatQuantity(quantity: number, unit: Unit): string {
  const label = unit === "UNIT" && quantity !== 1 ? "units" : unitLabel(unit);
  return `${trim(quantity)} ${label}`;
}
