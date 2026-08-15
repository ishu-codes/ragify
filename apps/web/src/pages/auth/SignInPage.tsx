import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, Brain, EyeClosedIcon, EyeIcon, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useSessionStore from "@/store/session";
import { ThemeToggle } from "@/components/navbar/ThemeToggle";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignInPage() {
  const navigate = useNavigate();
  const setSession = useSessionStore((state) => state.setSession);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (values: z.infer<typeof loginSchema>) => authApi.login(values),
    onSuccess: (data) => {
      setSession({ user: data.user, accessToken: data.access_token });
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate("/workspaces", { replace: true });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sign in. Check your credentials.");
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync(values);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  // Helper to fill demo credentials
  const fillDemoCredentials = () => {
    form.setValue("email", "demo@ragify.ai");
    form.setValue("password", "demo123456");
    toast.info("Demo credentials filled!");
  };

  return (
    <div className="relative min-h-dvh bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_8%,transparent),transparent_62%)]"
      />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Brain className="size-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Ragify</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="my-auto w-full">
          <div className="rounded-2xl border bg-card p-7 shadow-sm sm:p-9">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Sign in to access your workspaces.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Email address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@example.com"
                          type="email"
                          autoComplete="email"
                          className="h-10 rounded-xl text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            className="h-10 rounded-xl pr-10 text-sm"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((state) => !state)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeIcon className="size-4" /> : <EyeClosedIcon className="size-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="mt-1 h-10 w-full gap-2 rounded-xl shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            </Form>

            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={fillDemoCredentials}
                className="h-10 w-full gap-2 rounded-xl text-sm font-medium"
              >
                <KeyRound className="size-3.5 text-primary" />
                Fill demo credentials
              </Button>
            </div>

            <p className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/sign-up" className="font-medium text-primary transition-colors hover:underline underline-offset-4">
                Create a free account
              </Link>
            </p>
          </div>

          <p className="mt-5 text-center text-[11px] text-muted-foreground">
            Protected by end-to-end encryption and isolated vector security.
          </p>
        </div>
      </div>
    </div>
  );
}
