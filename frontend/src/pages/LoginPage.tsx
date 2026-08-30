import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { LoginForm } from "@/features/auth/LoginForm";

export function LoginPage() {
  return (
    <main className="grid min-h-[calc(100vh-4.5rem)] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-foreground p-12 text-background lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
        <div className="relative">
          <div className="mb-16 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background font-bold text-foreground">
              N
            </span>
            <span className="font-display text-xl font-bold">NEXORA</span>
          </div>
          <p className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-warning">
            <Sparkles className="h-4 w-4" /> Curated for your rhythm
          </p>
          <h2 className="max-w-lg font-display text-5xl font-bold leading-[1.02] tracking-[-0.07em]">
            Welcome back to the good stuff.
          </h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-background/60">
            Your saved pieces, orders, and wishlist are right where you left
            them.
          </p>
        </div>
        <p className="relative text-xs text-background/45">
          Small details. Better days.
        </p>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link
              to="/"
              className="font-display text-xl font-bold tracking-[-0.06em]"
            >
              NEXORA
            </Link>
          </div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Member login
          </p>
          <h1 className="font-display text-4xl font-bold tracking-[-0.06em]">
            Log in to NEXORA
          </h1>
          <p className="mb-8 mt-3 text-sm text-muted-foreground">
            New here?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary hover:underline"
            >
              Create an account <ArrowRight className="inline h-3.5 w-3.5" />
            </Link>
          </p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
