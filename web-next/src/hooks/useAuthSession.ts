"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { authApi } from "@/lib/api";
import type { AuthSession } from "@/lib/types";
import useSessionStore from "@/store/session";

export function useSession() {
  const storedSession = useSessionStore((state) => state.session);
  const hasHydrated = useSessionStore((state) => state.hasHydrated);
  const clearSession = useSessionStore((state) => state.clearSession);
  const hasAccessToken = Boolean(storedSession?.accessToken);
  const accessToken = storedSession?.accessToken;

  const query = useQuery({
    queryKey: ["session", accessToken],
    enabled: hasHydrated && hasAccessToken,
    retry: false,
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Session token is unavailable");
      }
      return authApi.getSession(accessToken);
    },
  });

  useEffect(() => {
    if (query.isError && storedSession) {
      clearSession();
    }
  }, [clearSession, query.isError, storedSession]);

  const session: AuthSession | null =
    !hasHydrated || !storedSession?.user
      ? null
      : storedSession && query.data
        ? {
            accessToken: storedSession.accessToken,
            user: query.data,
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
