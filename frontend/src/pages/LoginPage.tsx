import { Link } from "react-router-dom";
import { LoginForm } from "@/features/auth/LoginForm";

export function LoginPage() {
  return (
    <main className="container flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold">Log in to NEXORA</h1>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Create an account
          </Link>
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
