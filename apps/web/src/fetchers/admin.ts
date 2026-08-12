import { api } from "@/lib/api";
import type { PlatformStats } from "@/types/admin";
import type { User } from "./auth";
import type { Pagination } from "@/types/pagination";

export const adminFetchers = {
  stats: () => api.get<PlatformStats>("admin/stats"),
  users: () => api.get<{ users: User[]; pagination: Pagination }>("admin/users"),
  updateUserRole: (id: string, role: string) => api.patch(`admin/users/${id}/role`, { role }),
};
