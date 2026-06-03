"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export async function registerUser(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password, role, companyName, contactNumber } =
    parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await db.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) return { error: "An account with this email already exists" };

  const hashed = await bcrypt.hash(password, 10);

  await db.user.create({
    data: {
      name,
      email: normalizedEmail,
      password: hashed,
      role,
      ...(role === "SELLER"
        ? {
            sellerProfile: {
              create: { companyName, contactNumber, status: "PENDING" },
            },
          }
        : {
            buyerProfile: {
              create: { companyName, contactNumber },
            },
          }),
    },
  });

  return { success: true as const };
}
