"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, EyeClosedIcon, EyeIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Pill } from "@/components/marketing/Pill";
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

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams?.get("plan") ?? null;

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
      router.replace("/workspaces");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Start building grounded AI workspaces in under a minute.
        </p>
        {plan ? (
          <p className="mx-auto w-fit rounded-full border border-brand/30 bg-brand/10 px-3 py-1 font-mono text-xs font-medium text-brand-text">
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Email address
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@company.com"
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
                      placeholder="At least 6 characters"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
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
            {isLoading ? "Creating account..." : "Create account"}
            <ArrowRight className="size-4" />
          </Pill>
        </form>
      </Form>

      <p className="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-foreground transition-colors hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>

      <p className="mt-5 text-center text-[11px] text-muted-foreground">
        Free to start. No credit card required.
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
