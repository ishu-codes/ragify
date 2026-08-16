import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, Brain, EyeClosedIcon, EyeIcon } from "lucide-react";
import { toast } from "sonner";

import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useSessionStore from "@/store/session";
import { ThemeToggle } from "@/components/navbar/ThemeToggle";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignUpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");

  const setSession = useSessionStore((state) => state.setSession);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    try {
      const data = await authApi.register(values);
      setSession({ user: data.user, accessToken: data.access_token });

      toast.success("Account created successfully! Welcome to Ragify.");
      navigate("/workspaces", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

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
              <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Start building grounded AI workspaces in under a minute.
              </p>
              {plan ? (
                <p className="mx-auto w-fit rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1 text-xs font-medium text-primary">
                  Selected plan: {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </p>
              ) : null}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Jane Cooper"
                          autoComplete="name"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Email address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@company.com"
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
                            placeholder="At least 6 characters"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
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
                  {isLoading ? "Creating account..." : "Create account"}
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            </Form>

            <p className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/sign-in" className="font-medium text-primary transition-colors hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-5 text-center text-[11px] text-muted-foreground">
            Free to start. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}
