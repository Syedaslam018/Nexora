import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button-variants";

export function NotFoundPage() {
  return (
    <main className="container flex min-h-[65vh] flex-col items-center justify-center gap-4 text-center">
      <div className="font-display text-8xl font-bold tracking-[-0.1em] text-primary/20">
        404
      </div>
      <h1 className="font-display text-3xl font-bold tracking-[-0.05em]">
        Page not found
      </h1>
      <p className="text-sm text-muted-foreground">
        That page doesn't exist, or hasn't been built yet.
      </p>
      <Link to="/" className={buttonVariants({ variant: "default" })}>
        Back to NEXORA
      </Link>
    </main>
  );
}
