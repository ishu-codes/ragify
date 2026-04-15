import { api } from "@/lib/api";
import { Subscription } from "@/types/subscription";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  image: string;
  subscriptions?: Subscription[];
  createdAt?: string;
}

export const authFetchers = {
  me: () => api.get<User>("auth/me"),
};
