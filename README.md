# AasaMedChem — B2B Chemical Marketplace

A marketplace platform (not a CRUD app) for buying and selling laboratory and
industrial chemicals. Built around four hard problems: **precise unit
conversion**, **live quotations**, **role-based access**, and **consistent
inventory**.

Built with **Next.js 16** (App Router + Proxy), **React 19**, **Prisma 7** on
**Neon PostgreSQL**, **NextAuth**, **Tailwind v4 + shadcn/ui**, themed in
Industrial Emerald.

---

## Roles

| Role | Can |
|------|-----|
| **Admin** | Approve/suspend sellers, moderate products, view all orders, review chemical requests, see platform analytics |
| **Seller** | Manage storefront, list products, manage inventory, receive & fulfil orders |
| **Buyer** | Search products, get live quotations, place orders, request missing chemicals |

`/register` creates Buyer/Seller accounts. The admin is bootstrapped via a script
(see below). Sellers start **PENDING** until an admin approves them.

---

## The core engines

### Unit conversion — `lib/conversion-engine.ts`
Single source of truth. Everything is stored in the **smallest unit**:

- Weight → grams (`1 kg = 1000 g`)
- Volume → millilitres (`1 L = 1000 mL`)
- Count → unit

Prices are stored **per smallest unit** as `Decimal(20,8)` — never float.

### Live quotation — `lib/quotation-engine.ts`
`total = toBase(quantity, unit) × pricePerBaseUnit`. Powers the instant
calculator on each product page **and** server-side order pricing (the client
total is never trusted). Example: Acetone at ₹500/L → 750 mL → **₹375**.

Both engines are pure and covered by Vitest (`npm test`).

### Inventory consistency
On order **approval**, a Prisma transaction decrements each product's
`inventoryInBase` and fails atomically if any line is short on stock.

---

## RBAC

`proxy.ts` (Next.js 16 renamed Middleware → **Proxy**) guards `/admin`,
`/seller`, `/buyer` by reading the JWT at the edge and redirecting by role.
Server Components and Actions re-verify with `getServerSession` /
`requireRole()` (defence in depth).

---

## Getting started

### 1. Configure environment
Copy `.env.example` to `.env` and fill in:

```bash
DATABASE_URL=...        # Neon pooled connection string
NEXTAUTH_SECRET=...     # npx auth secret  (or any long random string)
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

### 2. Install & migrate
```bash
npm install
npm run db:migrate      # applies prisma/migrations to Neon, generates client
npm run db:seed-admin   # creates the ADMIN user from ADMIN_* env vars
```

### 3. Run
```bash
npm run dev             # http://localhost:3000
```

### Scripts
| Script | Purpose |
|--------|---------|
| `npm run dev` / `build` / `start` | Next.js dev / production build / serve |
| `npm test` | Vitest engine tests |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed-admin` | Bootstrap the admin user |

---

## Demo flow (end-to-end)

1. **Admin** logs in (seeded account) → `/admin`.
2. **Register a seller** at `/register` → lands **PENDING**.
3. Admin approves the seller at `/admin/sellers`.
4. Seller adds *Acetone* — selling unit **L**, inventory **50**, price **₹500** →
   stored as **50000 mL** and **₹0.5/mL**.
5. **Register a buyer**, open the product, enter **750 mL** → live total **₹375** →
   add to quote cart → place order.
6. Seller approves the order at `/seller/orders` → inventory drops to **49250 mL**.
7. Buyer submits a **chemical request**; it appears for the admin to review.

---

## Architecture

```
proxy.ts                     RBAC at the edge
app/(public)                 landing, marketplace, product, seller storefronts
app/(auth)                   login / register
app/(admin|seller|buyer)     role dashboards (guarded)
app/actions/*                server actions (auth, product, order, request, admin, seller)
lib/conversion-engine.ts     ★ units
lib/quotation-engine.ts      ★ pricing
lib/db.ts                    Prisma singleton (@prisma/adapter-pg)
lib/rbac.ts / seller / buyer auth + role helpers
prisma/schema.prisma         data model (Decimal(20,8) money/quantities)
```

---

## Deploying to Vercel

1. Push to GitHub and import the repo in Vercel.
2. Set env vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
   (your production URL, e.g. `https://your-app.vercel.app`).
3. Run `npm run db:migrate` against the production database once (or
   `prisma migrate deploy` in a build step), then `npm run db:seed-admin`.
4. Deploy. The Prisma client is generated during `next build`.

> Note: `DATABASE_URL` lives only in `.env` (gitignored). Rotate any credential
> that has been shared in plaintext.
