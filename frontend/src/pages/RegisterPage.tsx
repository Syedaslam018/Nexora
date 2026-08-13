import { Link } from "react-router-dom";
import { RegisterForm } from "@/features/auth/RegisterForm";

export function RegisterPage() {
  return (
    <main className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold">Create your account</h1>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
        <RegisterForm />
      </div>
    </main>
  );
}
