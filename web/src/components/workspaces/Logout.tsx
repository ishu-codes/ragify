"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import useSessionStore from "@/store/session";

interface Props {
  children: ReactNode;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}
export default function Logout({ children, variant = "default", className = "" }: Props) {
  const clearSession = useSessionStore((s) => s.clearSession);
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    router.replace("/sign-in");
  };

  return (
    <Button variant={variant} className={className} onClick={handleLogout}>
      {children}
    </Button>
  );
}
