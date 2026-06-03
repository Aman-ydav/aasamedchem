"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Store,
  Users,
  UserCog,
  IdCard,
  ClipboardList,
  FlaskConical,
  FileText,
  Menu,
} from "lucide-react";
import type { Role } from "@/lib/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type NavItem = { href: string; label: string; icon: React.ElementType };

const NAV: Record<Role, NavItem[]> = {
  SELLER: [
    { href: "/seller", label: "Overview", icon: LayoutDashboard },
    { href: "/seller/products", label: "Products", icon: Package },
    { href: "/seller/inventory", label: "Inventory", icon: Boxes },
    { href: "/seller/orders", label: "Orders", icon: ShoppingCart },
    { href: "/seller/profile", label: "Storefront", icon: Store },
  ],
  BUYER: [
    { href: "/buyer", label: "Overview", icon: LayoutDashboard },
    { href: "/buyer/profile", label: "My Profile", icon: IdCard },
    { href: "/buyer/cart", label: "Quote Cart", icon: ShoppingCart },
    { href: "/buyer/orders", label: "My Orders", icon: ShoppingCart },
    { href: "/buyer/requests", label: "My Requests", icon: ClipboardList },
    { href: "/buyer/request-chemical", label: "Request a Chemical", icon: FlaskConical },
    { href: "/products", label: "Marketplace", icon: Store },
  ],
  ADMIN: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/sellers", label: "Sellers", icon: UserCog },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/requests", label: "Chemical Requests", icon: FileText },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin Console",
  SELLER: "Seller Hub",
  BUYER: "Buyer Hub",
};

function NavLinks({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {NAV[role].map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== `/${role.toLowerCase()}` && pathname.startsWith(item.href + "/"));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  role,
  user,
  children,
}: {
  role: Role;
  user: { name?: string | null; email?: string | null };
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex min-h-dvh bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar px-4 py-5 md:flex">
        <Brand className="px-2" />
        <p className="mb-4 mt-1 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {ROLE_LABEL[role]}
        </p>
        <NavLinks role={role} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-4">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand className="px-2" />
              <p className="mb-4 mt-1 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {ROLE_LABEL[role]}
              </p>
              <NavLinks role={role} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="font-heading text-sm font-semibold md:hidden">
            <Brand />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <UserMenu
              name={user.name}
              email={user.email}
              dashboardHref={`/${role.toLowerCase()}`}
            />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
