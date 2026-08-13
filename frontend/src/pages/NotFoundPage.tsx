import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button-variants";

export function NotFoundPage() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <p className="font-mono-data text-sm text-muted-foreground">404</p>
      <h1 className="font-display text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        That page doesn't exist, or hasn't been built yet.
      </p>
      <Link to="/" className={buttonVariants({ variant: "default" })}>
        Back to NEXORA
      </Link>
    </main>
  );
}
