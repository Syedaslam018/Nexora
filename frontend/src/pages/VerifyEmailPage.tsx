import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authApi } from "@/api/auth.api";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending",
  );

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
    <main className="container flex min-h-[65vh] items-center justify-center py-12 text-center">
      <div className="max-w-md rounded-3xl border border-border/70 bg-card/70 p-8 shadow-lift sm:p-12">
        {status === "pending" && (
          <>
            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <p className="text-muted-foreground">Verifying your email…</p>
          </>
        )}
        {status === "success" && (
          <>
            <h1 className="font-display text-3xl font-bold tracking-[-0.05em]">
              Email verified
            </h1>
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
            <h1 className="font-display text-3xl font-bold tracking-[-0.05em]">
              Link expired
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This verification link is invalid or has expired.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
