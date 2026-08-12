import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthSession } from "@/lib/types";

type SessionStore = {
  session: AuthSession | null;
  hasHydrated: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      session: null,
      hasHydrated: false,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "ragify-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export default useSessionStore;
