import Link from "next/link";
import { Brand } from "@/components/layout/brand";

const columns = [
  {
    title: "Marketplace",
    links: [
      { href: "/products", label: "Browse chemicals" },
      { href: "/register", label: "Become a seller" },
      { href: "/buyer/request-chemical", label: "Request a chemical" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Create account" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div className="space-y-3">
          <Brand />
          <p className="max-w-xs text-sm text-muted-foreground">
            A B2B marketplace for laboratory and industrial chemicals — with live
            unit conversion, instant quotations, and verified sellers.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="space-y-3">
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 text-xs text-muted-foreground sm:px-6 lg:px-8">
          © {new Date().getFullYear()} AasaMedChem. Built as a marketplace
          reference platform.
        </div>
      </div>
    </footer>
  );
}
