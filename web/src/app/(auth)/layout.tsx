"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/hooks/useAuthSession";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.replace("/workspaces");
    }
  }, [session, router]);

  if (session?.user) return null;

  return <>{children}</>;
}
