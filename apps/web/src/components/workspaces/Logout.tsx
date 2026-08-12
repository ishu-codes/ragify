import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import useSessionStore from "@/store/session";

interface Props {
  children: ReactNode;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}
export default function Logout({ children, variant = "default", className = "" }: Props) {
  const clearSession = useSessionStore((s) => s.clearSession);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/sign-in", { replace: true });
  };

  return (
    <Button variant={variant} className={className} onClick={handleLogout}>
      {children}
    </Button>
  );
}
