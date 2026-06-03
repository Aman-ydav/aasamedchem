import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  enteredQuantity: z.number().positive(),
  enteredUnit: z.enum(["G", "KG", "ML", "L", "UNIT"]),
});

export const placeOrderSchema = z.array(cartItemSchema).min(1, "Your cart is empty");

export type CartItemInput = z.infer<typeof cartItemSchema>;
