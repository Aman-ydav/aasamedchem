import { z } from "zod";
import { isUnitValidForDimension } from "@/lib/conversion-engine";

export const productSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    sku: z.string().min(2, "SKU is required"),
    category: z.string().min(2, "Category is required"),
    description: z.string().max(2000).optional().or(z.literal("")),
    image: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
    dimension: z.enum(["WEIGHT", "VOLUME", "COUNT"]),
    inputUnit: z.enum(["G", "KG", "ML", "L", "UNIT"]),
    inventoryQuantity: z.number().min(0, "Cannot be negative"),
    pricePerUnit: z.number().positive("Enter a price"),
    minimumOrderQty: z.number().positive("Must be greater than 0"),
    leadTime: z.string().max(120).optional().or(z.literal("")),
    isActive: z.boolean(),
  })
  .refine((d) => isUnitValidForDimension(d.inputUnit, d.dimension), {
    message: "Selected unit does not match the product dimension",
    path: ["inputUnit"],
  });

export type ProductInput = z.infer<typeof productSchema>;
