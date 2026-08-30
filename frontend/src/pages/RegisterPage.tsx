import { Link } from "react-router-dom";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { RegisterForm } from "@/features/auth/RegisterForm";

export function RegisterPage() {
  return (
    <main className="grid min-h-[calc(100vh-4.5rem)] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-foreground p-12 text-background lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative">
          <div className="mb-16 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background font-bold text-foreground">
              N
            </span>
            <span className="font-display text-xl font-bold">NEXORA</span>
          </div>
          <p className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">
            <Sparkles className="h-4 w-4" /> Make room for better
          </p>
          <h2 className="max-w-lg font-display text-5xl font-bold leading-[1.02] tracking-[-0.07em]">
            A more considered way to shop.
          </h2>
          <div className="mt-8 flex flex-col gap-3 text-sm text-background/70">
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" /> Save your favorite
              discoveries
            </span>
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" /> Track every order in one
              place
            </span>
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" /> First access to new
              drops
            </span>
          </div>
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
            Join the collection
          </p>
          <h1 className="font-display text-4xl font-bold tracking-[-0.06em]">
            Create your account
          </h1>
          <p className="mb-8 mt-3 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline"
            >
              Log in <ArrowRight className="inline h-3.5 w-3.5" />
            </Link>
          </p>
          <RegisterForm />
        </div>
      </section>
    </main>
  );
}
