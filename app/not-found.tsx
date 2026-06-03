import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <FlaskConical className="size-7" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight font-heading">
        Page not found
      </h1>
      <p className="max-w-md text-muted-foreground">
        The page or product you're looking for doesn't exist or is no longer
        available.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Browse marketplace</Link>
        </Button>
      </div>
    </div>
  );
}
