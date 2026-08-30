import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/common/FieldError";
import { loginFormSchema, type LoginFormValues } from "@/schemas/auth.schema";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { mergeGuestCartIfAny } from "@/features/cart/useCart";
import { isAxiosError } from "axios";

export function LoginForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  async function onSubmit(values: LoginFormValues) {
    try {
      const { user, accessToken } = await authApi.login(values);
      setAuth(user, accessToken);
      await mergeGuestCartIfAny(queryClient);
      toast.success(`Welcome back, ${user.firstName}`);
      navigate("/");
    } catch (err) {
      const message = isAxiosError(err)
        ? ((err.response?.data as { message?: string } | undefined)?.message ??
          "Login failed")
        : "Login failed";
      setError("root", { message });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            to="/forgot-password"
            className="text-xs text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>
      {errors.root?.message && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errors.root.message}
        </p>
      )}
      <Button
        type="submit"
        isLoading={isSubmitting}
        className="mt-3 h-12 w-full"
      >
        Log in
      </Button>
    </form>
  );
}
