import { z } from "zod";

export const chemicalRequestSchema = z.object({
  chemicalName: z.string().min(2, "Chemical name is required"),
  requestedQuantity: z.number().positive("Enter a quantity"),
  requestedUnit: z.enum(["G", "KG", "ML", "L", "UNIT"]),
  notes: z.string().max(1000).optional().or(z.literal("")),
  deliveryLocation: z.string().max(300).optional().or(z.literal("")),
});

export type ChemicalRequestInput = z.infer<typeof chemicalRequestSchema>;
