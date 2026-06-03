import { describe, it, expect } from "vitest";
import {
  toBase,
  fromBase,
  unitsForDimension,
  assertSameDimension,
  isUnitValidForDimension,
  formatBaseQuantity,
  BASE_UNIT,
} from "./conversion-engine";

describe("conversion-engine", () => {
  it("converts weight to grams (base)", () => {
    expect(toBase(5, "KG")).toBe(5000);
    expect(toBase(250, "G")).toBe(250);
  });

  it("converts volume to millilitres (base)", () => {
    expect(toBase(2, "L")).toBe(2000);
    expect(toBase(500, "ML")).toBe(500);
  });

  it("leaves count unchanged", () => {
    expect(toBase(7, "UNIT")).toBe(7);
  });

  it("round-trips base <-> unit", () => {
    expect(fromBase(toBase(0.75, "L"), "L")).toBeCloseTo(0.75);
    expect(fromBase(5000, "KG")).toBe(5);
    expect(fromBase(2000, "L")).toBe(2);
  });

  it("lists only units for a dimension", () => {
    expect(unitsForDimension("WEIGHT").sort()).toEqual(["G", "KG"]);
    expect(unitsForDimension("VOLUME").sort()).toEqual(["L", "ML"]);
    expect(unitsForDimension("COUNT")).toEqual(["UNIT"]);
  });

  it("maps dimensions to the correct base unit", () => {
    expect(BASE_UNIT.WEIGHT).toBe("G");
    expect(BASE_UNIT.VOLUME).toBe("ML");
    expect(BASE_UNIT.COUNT).toBe("UNIT");
  });

  it("validates unit/dimension compatibility", () => {
    expect(isUnitValidForDimension("ML", "WEIGHT")).toBe(false);
    expect(isUnitValidForDimension("KG", "WEIGHT")).toBe(true);
    expect(() => assertSameDimension("ML", "WEIGHT")).toThrow();
    expect(() => assertSameDimension("KG", "WEIGHT")).not.toThrow();
  });

  it("formats base quantities readably", () => {
    expect(formatBaseQuantity(50000, "VOLUME")).toBe("50 L");
    expect(formatBaseQuantity(250, "WEIGHT")).toBe("250 g");
    expect(formatBaseQuantity(25000, "WEIGHT")).toBe("25 kg");
    expect(formatBaseQuantity(1, "COUNT")).toBe("1 unit");
    expect(formatBaseQuantity(5, "COUNT")).toBe("5 units");
  });
});
