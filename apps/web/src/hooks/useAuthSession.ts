import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { authApi } from "@/lib/api";
import type { AuthSession } from "@/lib/types";
import useSessionStore from "@/store/session";

export function useSession() {
  const storedSession = useSessionStore((state) => state.session);
  const hasHydrated = useSessionStore((state) => state.hasHydrated);
  const clearSession = useSessionStore((state) => state.clearSession);
  const hasAccessToken = Boolean(storedSession?.accessToken);

  const query = useQuery({
    queryKey: ["session", storedSession?.accessToken],
    enabled: hasHydrated && hasAccessToken,
    retry: false,
    queryFn: async () => authApi.getSession(storedSession!.accessToken),
  });

  useEffect(() => {
    if (query.isError && storedSession) {
      clearSession();
    }
  }, [clearSession, query.isError, storedSession]);

  const session: AuthSession | null =
    !hasHydrated
      ? null
      : storedSession && query.data
      ? {
          accessToken: storedSession.accessToken,
          user: query.data.user,
        }
      : storedSession;

  const isPending = !hasHydrated || (hasAccessToken && query.isPending);

  return {
    ...query,
    data: session,
    isHydrated: hasHydrated,
    isPending,
    session,
    user: session?.user ?? null,
    isAuthenticated: Boolean(session?.accessToken),
  };
}
