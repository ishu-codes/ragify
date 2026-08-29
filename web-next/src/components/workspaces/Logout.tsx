"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import useSessionStore from "@/store/session";

interface Props extends ComponentProps<typeof Button> {
  children?: ReactNode;
}

export default function Logout({
  children,
  variant = "default",
  className = "",
  ...props
}: Props) {
  const clearSession = useSessionStore((s) => s.clearSession);
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <Button
      variant={variant}
      className={className}
      {...props}
      onClick={handleLogout}
    >
      {children}
    </Button>
  );
}
