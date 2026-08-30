import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/common/FieldError";
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from "@/schemas/auth.schema";
import { authApi } from "@/api/auth.api";

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    // Backend always responds the same way regardless of whether the email
    // exists, so the UI shows the same "check your email" state either way.
    await authApi.forgotPassword(values.email).catch(() => {});
    setSubmitted(true);
  }

  return (
    <main className="container flex min-h-[65vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card/70 p-7 shadow-lift sm:p-10">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          Account recovery
        </p>
        <h1 className="font-display text-4xl font-bold tracking-[-0.06em]">
          Reset your password
        </h1>
        {submitted ? (
          <p className="mt-4 text-sm text-muted-foreground">
            If an account exists for that email, a reset link is on its way.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-7 flex flex-col gap-5"
          >
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>
            <Button type="submit" isLoading={isSubmitting}>
              Send reset link
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
