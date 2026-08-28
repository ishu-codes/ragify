import { create } from "zustand";
import { persist } from "zustand/middleware";

export const SIDEBAR_STORE_KEY = "ragify-sidebar";

type SidebarStore = {
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
};

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isCollapsed: false,
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    }),
    {
      name: SIDEBAR_STORE_KEY,
    },
  ),
);
