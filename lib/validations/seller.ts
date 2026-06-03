import { z } from "zod";

const opt = z.string().max(500).optional().or(z.literal(""));

export const sellerProfileSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  gstNumber: opt,
  description: z.string().max(2000).optional().or(z.literal("")),
  address: opt,
  contactNumber: opt,
  deliveryTime: opt,
  deliveryRegions: opt,
});

export type SellerProfileInput = z.infer<typeof sellerProfileSchema>;
