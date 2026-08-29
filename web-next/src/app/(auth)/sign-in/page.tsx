"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, EyeClosedIcon, EyeIcon, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { OutlinePill, Pill } from "@/components/marketing/Pill";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import useSessionStore from "@/store/session";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignInPage() {
  const router = useRouter();
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
      router.replace("/workspaces");
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to sign in. Check your credentials.",
      );
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
    <div className="w-full">
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
                <FormLabel className="text-sm font-medium">
                  Email address
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="email@example.com"
                    type="email"
                    autoComplete="email"
                    className="h-10 rounded-md text-sm"
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
                      className="h-10 rounded-md pr-10 text-sm"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((state) => !state)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeIcon className="size-4" />
                      ) : (
                        <EyeClosedIcon className="size-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Pill
            type="submit"
            className="mt-1 w-full justify-center"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
            <ArrowRight className="size-4" />
          </Pill>
        </form>
      </Form>

      <div className="mt-4">
        <OutlinePill
          type="button"
          onClick={fillDemoCredentials}
          className="w-full justify-center"
        >
          <KeyRound className="size-3.5" />
          Fill demo credentials
        </OutlinePill>
      </div>

      <p className="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-foreground transition-colors hover:underline underline-offset-4"
        >
          Create a free account
        </Link>
      </p>

      <p className="mt-5 text-center text-[11px] text-muted-foreground">
        Protected by end-to-end encryption and isolated vector security.
      </p>
    </div>
  );
}
