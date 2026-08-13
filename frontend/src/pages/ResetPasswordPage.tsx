import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/common/FieldError";
import { resetPasswordFormSchema, type ResetPasswordFormValues } from "@/schemas/auth.schema";
import { authApi } from "@/api/auth.api";
import { isAxiosError } from "axios";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordFormSchema) });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) {
      setError("root", { message: "This reset link is missing its token" });
      return;
    }
    try {
      await authApi.resetPassword(token, values.password);
      toast.success("Password reset — please log in");
      navigate("/login");
    } catch (err) {
      const message = isAxiosError(err)
        ? ((err.response?.data as { message?: string } | undefined)?.message ?? "Reset failed")
        : "Reset failed";
      setError("root", { message });
    }
  }

  return (
    <main className="container flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold">Set a new password</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
          <div>
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            <FieldError message={errors.password?.message} />
          </div>
          {errors.root?.message && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errors.root.message}
            </p>
          )}
          <Button type="submit" isLoading={isSubmitting}>
            Reset password
          </Button>
        </form>
      </div>
    </main>
  );
}
