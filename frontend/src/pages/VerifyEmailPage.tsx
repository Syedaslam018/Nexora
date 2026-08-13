import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authApi } from "@/api/auth.api";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <main className="container flex min-h-screen items-center justify-center text-center">
      <div className="max-w-sm">
        {status === "pending" && <p className="text-muted-foreground">Verifying your email…</p>}
        {status === "success" && (
          <>
            <h1 className="font-display text-2xl font-semibold">Email verified</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You're all set.{" "}
              <Link to="/" className="text-primary hover:underline">
                Continue to NEXORA
              </Link>
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="font-display text-2xl font-semibold">Link expired</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This verification link is invalid or has expired.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
