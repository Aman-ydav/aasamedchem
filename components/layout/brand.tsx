import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 font-heading font-semibold", className)}
    >
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <FlaskConical className="size-5" />
      </span>
      <span className="text-lg tracking-tight">
        Aasa<span className="text-primary">Med</span>Chem
      </span>
    </Link>
  );
}
