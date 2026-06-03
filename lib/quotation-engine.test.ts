import { describe, it, expect } from "vitest";
import { quote, hasStock, meetsMinimum } from "./quotation-engine";

describe("quotation-engine", () => {
  it("matches the spec example: Acetone ₹500/L, 750 mL -> ₹375", () => {
    const r = quote({
      pricePerBaseUnit: 0.5, // ₹500/L stored as ₹0.5/mL
      enteredQuantity: 750,
      enteredUnit: "ML",
      dimension: "VOLUME",
    });
    expect(r.baseQuantity).toBe(750);
    expect(r.total).toBe(375);
  });

  it("prices a weight order entered in kg", () => {
    // ₹500/kg stored as ₹0.5/g; 3 kg -> 3000 g × 0.5 = ₹1500
    const r = quote({
      pricePerBaseUnit: 0.5,
      enteredQuantity: 3,
      enteredUnit: "KG",
      dimension: "WEIGHT",
    });
    expect(r.baseQuantity).toBe(3000);
    expect(r.total).toBe(1500);
  });

  it("prices count items", () => {
    const r = quote({
      pricePerBaseUnit: 120,
      enteredQuantity: 4,
      enteredUnit: "UNIT",
      dimension: "COUNT",
    });
    expect(r.total).toBe(480);
  });

  it("rejects a unit that doesn't match the dimension", () => {
    expect(() =>
      quote({ pricePerBaseUnit: 1, enteredQuantity: 1, enteredUnit: "ML", dimension: "WEIGHT" }),
    ).toThrow();
  });

  it("checks stock and minimum order", () => {
    expect(hasStock(750, 50000)).toBe(true);
    expect(hasStock(60000, 50000)).toBe(false);
    expect(meetsMinimum(750, 500)).toBe(true);
    expect(meetsMinimum(250, 500)).toBe(false);
  });
});
