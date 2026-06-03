# AasaMedChem — B2B Chemical Marketplace

Live app: https://aasamedchem-liard.vercel.app/

AasaMedChem is a B2B marketplace for laboratory and industrial chemicals.
It is built around four core ideas:

The app uses **Next.js 16** (App Router + Proxy), **React 19**, **Prisma 7** on
**Neon PostgreSQL**, **NextAuth**, and **Tailwind v4 + shadcn/ui**.

---

## Roles

| Role | Can |
|------|-----|
| **Admin** | Approve/suspend sellers, view any user profile, moderate products, view all orders, review chemical requests, see platform analytics |
| **Seller** | Manage storefront, list products, manage inventory, view buyer profiles tied to orders, receive & fulfil orders |
| **Buyer** | Search products, open seller storefronts, see live quotations, place orders, view their profile/cart, request missing chemicals |

`/register` creates Buyer/Seller accounts. The admin is bootstrapped via a script
(see below). Sellers start **PENDING** until an admin approves them.

## How the app works now

1. A user registers as a buyer or seller.
2. Sellers wait for admin approval before their storefront is public.
3. Buyers browse the marketplace, open a product, and see a live quotation.
4. Only buyers can add to the quote cart and place an order.
5. Sellers approve orders later; approval decrements stock atomically.
6. Buyers can submit chemical requests when they cannot find a product.
7. Admins can inspect users, sellers, products, orders, and chemical requests.

## Main screens

- Public marketplace: `/products`
- Product detail with quotation: `/product/[id]`
- Public seller storefront: `/sellers/[id]`
- Buyer dashboard and profile: `/buyer`, `/buyer/profile`
- Buyer quote cart: `/buyer/cart`
- Buyer chemical request form: `/buyer/request-chemical`
- Seller dashboard, products, inventory, orders, profile: `/seller/*`
- Admin dashboard, users, sellers, products, orders, requests: `/admin/*`
- Any user can open a seller's public profile from the marketplace or product pages, and buyers will usually use it to review the seller before ordering.

---

## The core engines

### Unit conversion — `lib/conversion-engine.ts`
Single source of truth. Everything is stored in the **smallest unit**:

- Weight → grams (`1 kg = 1000 g`)
- Volume → millilitres (`1 L = 1000 mL`)
- Count → unit

Prices are stored **per smallest unit** as `Decimal(20,8)` — never float.

This means a seller can enter a listing in a selling unit like kg or L, but the
database always stores the product in the base unit.

### Money and quantity rules

This is the most important business rule in the project:

- the UI may show kg, L, mL, g, or units
- the database always stores the smallest base unit
- the database always stores prices per smallest unit
- the server always recalculates totals before saving an order

Example:

- Seller enters: `50 L` at `₹500/L`
- Database stores: `50000 mL` and `₹0.5/mL`
- Buyer orders: `750 mL`
- Server calculates: `750 × 0.5 = ₹375`

This avoids floating-point mistakes, keeps inventory accurate, and makes sure
the same product can be shown in different units without losing precision.

### Live quotation — `lib/quotation-engine.ts`
`total = toBase(quantity, unit) × pricePerBaseUnit`. Powers the instant
calculator on each product page **and** server-side order pricing (the client
total is never trusted). Example: Acetone at ₹500/L → 750 mL → **₹375**.

The product page shows pricing to everyone, but only buyers can add the item to
their quote cart and place an order. Admins and sellers can still view the
product and the quotation, but they do not get the order button.

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

Role-aware UI is shown in the navbar and dashboard sidebar so the current user
can jump directly to their profile, cart, orders, requests, or storefront.

Seller profiles are public, so buyers and other users can inspect the seller's
company details, catalog, and trust information before starting a purchase.

## Deployed App

Live URL: https://aasamedchem-liard.vercel.app/

## Future Enhancements

The current app is already functional, but we can improve it further with these
features:

1. **Real-time chat system**
   - Add WebSocket-based chat between buyers and sellers.
   - Use it for negotiation, order questions, and quick support.

2. **Email flow and password reset**
   - Add email verification during sign-up.
   - Add password reset and account recovery by email.

3. **Seller verification**
   - Verify seller email.
   - Verify seller mobile number.
   - Add physical/business verification for trusted storefronts.
   - Support stronger approval states so buyers can trust verified sellers.

4. **Rating and review system**
   - Let buyers rate sellers and products after successful orders.
   - Show average rating on seller storefronts and product cards.

5. **Cloud image storage**
   - Store uploaded product images in Cloudinary.
   - Save only the image URL in the database instead of storing the file itself.

6. **Pricing safeguards**
   - Keep money stored in the smallest practical unit.
   - If needed, add a minimum order quantity so very small prices do not become awkward or nearly zero after conversion.
   - This helps avoid pricing problems like tiny decimal values.

7. **Business reporting and fulfillment**
   - Add company revenue dashboards.
   - Add delivery tracking.
   - Add commission handling so the platform can calculate its cut on each sale.

These are the natural next steps if we continue improving the platform after the
current marketplace, auth, quotation, and inventory flow.

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
2. **Register a seller** at `/register` → seller lands **PENDING**.
3. Admin approves the seller at `/admin/sellers`.
4. Seller opens `/seller/profile`, completes storefront details, and adds a product.
5. The seller may type values in kg or L, but the system stores the product in the
   smallest base unit for accuracy.
6. **Buyer** opens `/products`, clicks a product card, and sees the live quotation.
7. Only the buyer sees the add-to-cart and place-order action on the product page.
8. Buyer reviews `/buyer/cart` and places the order.
9. The server recalculates the order price from the stored base-unit data.
10. Seller reviews `/seller/orders` and approves it; inventory drops automatically.
11. Buyer submits a chemical request at `/buyer/request-chemical`; admin reviews it in `/admin/requests`.

### Quick pricing example

If a product is priced at `₹500/L`, the app stores it as `₹0.5/mL`.
If a buyer enters `750 mL`, the live quotation shows `₹375`.
If the seller has `50 L` in stock, the app stores that as `50000 mL`.
After an approved order for `750 mL`, the stock becomes `49250 mL`.

Profile visibility works like this:

- Admin can open any user profile from `/admin/users`.
- Seller can open buyer profiles linked to their orders.
- Buyer can open their own profile from `/buyer/profile`.
- Buyer can also open public seller storefronts from `/sellers/[id]`.

---

## Architecture

```
proxy.ts                     RBAC at the edge
app/(public)                 landing, marketplace, product, seller storefronts
app/(auth)                   login / register
app/(admin|seller|buyer)     role dashboards, profiles, carts, requests, orders
app/actions/*                server actions (auth, product, order, request, admin, seller)
lib/conversion-engine.ts     ★ units
lib/quotation-engine.ts      ★ pricing
lib/db.ts                    Prisma singleton (@prisma/adapter-pg)
lib/rbac.ts / seller / buyer auth + role helpers
prisma/schema.prisma         data model (Decimal(20,8) money/quantities)
```

## Data model at a glance

- `User` stores login identity and role.
- `SellerProfile` stores storefront details, approval status, and public seller data.
- `BuyerProfile` stores buyer company/contact data.
- `Product` stores the chemical listing in the smallest unit.
- `Order` and `OrderItem` store buyer/seller purchases and line-item conversions.
- `ChemicalRequest` stores buyer sourcing requests for items that are not listed.

Quantities and prices are stored as precise decimals, and the app converts them
only for display and quote calculations.

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
