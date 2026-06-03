"use client";

import { useSyncExternalStore } from "react";
import type { Dimension, Unit } from "@/lib/generated/prisma/enums";

export interface CartItem {
  productId: string;
  name: string;
  sellerId: string;
  sellerName: string;
  dimension: Dimension;
  enteredQuantity: number;
  enteredUnit: Unit;
  /** Snapshot of the per-smallest-unit price (server re-verifies on checkout). */
  pricePerBaseUnit: number;
}

const KEY = "aasamedchem-cart";
const EMPTY: CartItem[] = [];
const listeners = new Set<() => void>();
let cache: { raw: string; items: CartItem[] } = { raw: "[]", items: EMPTY };

function read(): CartItem[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = localStorage.getItem(KEY) ?? "[]";
  if (raw !== cache.raw) {
    try {
      cache = { raw, items: JSON.parse(raw) as CartItem[] };
    } catch {
      cache = { raw, items: EMPTY };
    }
  }
  return cache.items;
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l());
}

export function addToCart(item: CartItem) {
  write([...read(), item]);
}

export function removeFromCart(index: number) {
  const items = read().slice();
  items.splice(index, 1);
  write(items);
}

export function clearCart() {
  write([]);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
