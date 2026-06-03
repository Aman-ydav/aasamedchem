import Link from "next/link";
import {
  ArrowRight,
  Scale,
  Calculator,
  ShieldCheck,
  Search,
  Store,
  PackageCheck,
  FlaskConical,
  Beaker,
  Droplets,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Scale,
    title: "Unit Conversion Engine",
    desc: "kg ↔ g, L ↔ mL handled by a single source of truth. Inventory and pricing are stored in the smallest unit for absolute precision.",
  },
  {
    icon: Calculator,
    title: "Live Quotation Engine",
    desc: "Enter a quantity and unit, and see the converted amount and total price update instantly — no page reloads, no surprises.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    desc: "Separate, protected workspaces for Admins, Sellers, and Buyers. Every route is guarded at the edge.",
  },
  {
    icon: Search,
    title: "Smart Search",
    desc: "Find chemicals by name, SKU, category, or seller. Debounced, paginated, and filterable by unit type, price, and availability.",
  },
  {
    icon: Store,
    title: "Seller Storefronts",
    desc: "Every verified seller gets a public profile with their catalog, delivery regions, GST details, and lead times.",
  },
  {
    icon: PackageCheck,
    title: "Order Lifecycle",
    desc: "From quote to delivery — orders move through a clear lifecycle while inventory updates atomically on approval.",
  },
];

const categories = [
  { icon: FlaskConical, label: "Solvents" },
  { icon: Beaker, label: "Reagents" },
  { icon: Droplets, label: "Acids & Bases" },
  { icon: Boxes, label: "Powders & Salts" },
];

const steps = [
  {
    role: "Sellers",
    title: "List & manage inventory",
    desc: "Create a storefront, add products with their dimension and base unit, and set pricing per smallest unit.",
  },
  {
    role: "Buyers",
    title: "Search & quote instantly",
    desc: "Browse the marketplace, pick a quantity in any supported unit, and get a live quotation before ordering.",
  },
  {
    role: "Admin",
    title: "Approve & oversee",
    desc: "Approve sellers, monitor every order and quotation, and review buyer requests for missing chemicals.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,var(--accent)_0%,transparent_70%)] opacity-70"
        />
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 md:py-28 lg:px-8">
          <Badge variant="secondary" className="gap-1.5">
            <span className="size-1.5 rounded-full bg-primary" />
            B2B Chemical Marketplace
          </Badge>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight font-heading sm:text-5xl md:text-6xl">
            Source lab &amp; industrial chemicals from{" "}
            <span className="text-primary">verified sellers</span>
          </h1>
          <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
            AasaMedChem connects buyers and suppliers with a precision unit-conversion
            engine, instant quotations, and trusted storefronts — built for how
            chemicals are actually bought and sold.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/products">
                Browse marketplace <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register">Sell on AasaMedChem</Link>
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {categories.map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm text-muted-foreground"
              >
                <c.icon className="size-4 text-primary" />
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight font-heading sm:text-4xl">
            Not a CRUD app — a marketplace platform
          </h2>
          <p className="mt-4 text-muted-foreground">
            Strong inventory, conversion, quotation, and role-based architecture at
            the core.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="border-border/60">
              <CardContent className="space-y-3 p-6">
                <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight font-heading sm:text-4xl">
              One platform, three roles
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everyone gets a workspace designed for what they do.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <Card key={s.role} className="relative overflow-hidden">
                <CardContent className="space-y-3 p-6">
                  <span className="text-5xl font-bold text-primary/15 font-heading">
                    0{i + 1}
                  </span>
                  <Badge variant="outline">{s.role}</Badge>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight font-heading sm:text-4xl">
            Ready to start trading chemicals?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
            Create a free account as a buyer or seller and explore the marketplace in
            minutes.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">Create your account</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/products">Explore products</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
