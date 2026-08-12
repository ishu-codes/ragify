import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { EyeClosedIcon, EyeIcon, Brain, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, UserPlus, Lock } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useSessionStore from "@/store/session";
import { ThemeToggle } from "@/components/navbar/ThemeToggle";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-background">
      {/* LEFT COLUMN: VISUAL FEATURE SHOWCASE */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-zinc-950 text-white overflow-hidden bg-grid-pattern">
        {/* Glowing Orbs */}
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/25 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 text-white group">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">Ragify</span>
          </Link>
          <Badge variant="outline" className="text-xs border-white/20 text-white/80 bg-white/5">
            {plan ? `Selected Plan: ${plan.toUpperCase()}` : "Instant Free Tier"}
          </Badge>
        </div>

        {/* Center Feature Highlights */}
        <div className="relative z-10 space-y-8 my-auto max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
              <Sparkles className="h-3.5 w-3.5" /> Start Building Knowledge Bases
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-balance leading-tight">
              Transform Static Docs into <span className="text-gradient-purple">Conversational AI.</span>
            </h2>
            <p className="text-sm text-zinc-400 font-medium leading-relaxed">
              Create your account in seconds to start building custom RAG workspaces for PDFs, Markdown files, and codebases.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { title: "Instant AI Workspace Creation", icon: <UserPlus className="h-4 w-4 text-emerald-400" /> },
              { title: "Verifiable Source Citations", icon: <ShieldCheck className="h-4 w-4 text-sky-400" /> },
              { title: "Free 50 MB Starter Storage", icon: <CheckCircle2 className="h-4 w-4 text-purple-400" /> },
            ].map((perk, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="p-2 rounded-lg bg-white/10">{perk.icon}</div>
                <span className="text-xs font-semibold">{perk.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 text-xs text-zinc-500 font-medium flex items-center justify-between border-t border-white/10 pt-6">
          <span>© {new Date().getFullYear()} Ragify AI</span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Lock className="h-3.5 w-3.5 text-emerald-400" /> Encrypted &amp; Private Storage
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: REGISTER FORM */}
      <div className="flex flex-col justify-between p-6 sm:p-12 bg-background relative">
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="lg:hidden flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">Ragify</span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="my-auto max-w-md w-full mx-auto space-y-6 py-8">
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground font-medium">
              Join Ragify to build intelligent AI RAG workspaces.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="h-11 rounded-xl bg-muted/20 focus:bg-background transition-colors"
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
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="email@example.com"
                        type="email"
                        className="h-11 rounded-xl bg-muted/20 focus:bg-background transition-colors"
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
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="At least 6 characters"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          className="h-11 rounded-xl bg-muted/20 focus:bg-background transition-colors pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((state) => !state)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeIcon className="w-4 h-4" /> : <EyeClosedIcon className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 text-xs font-bold rounded-xl gap-2 shadow-lg shadow-primary/20 cursor-pointer mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Register & Start Building"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </Form>

          <div className="text-center text-xs font-medium text-muted-foreground pt-4 border-t">
            Already have an account?{" "}
            <Link to="/sign-in" className="font-bold text-primary hover:underline underline-offset-4">
              Sign in to your account
            </Link>
          </div>
        </div>

        <div className="text-center text-[11px] text-muted-foreground font-medium">
          By registering, you agree to our Terms of Service &amp; Privacy Policy.
        </div>
      </div>
    </div>
  );
}
