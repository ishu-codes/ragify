import type { ComponentProps, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/sign-in", { replace: true });
  };

  return (
    <Button variant={variant} className={className} {...props} onClick={handleLogout}>
      {children}
    </Button>
  );
}
