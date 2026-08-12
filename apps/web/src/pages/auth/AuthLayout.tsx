import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useSession } from "@/hooks/useAuthSession";

export default function AuthLayout() {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.user) {
      navigate("/workspaces", { replace: true });
    }
  }, [session, navigate]);

  if (session?.user) return null;

  return <Outlet />;
}
