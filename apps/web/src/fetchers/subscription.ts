import { api } from "@/lib/api";
import { Subscription, CreateSubscriptionInput } from "@/types/subscription";

export const subscriptionFetchers = {
  current: () => api.get<Subscription | null>("subscriptions/current"),
  create: (data: CreateSubscriptionInput) => api.post<Subscription>("subscriptions", data),
  cancel: () => api.post("subscriptions/cancel"),
  updateCharity: (charityId: string) => api.patch("subscriptions/charity", { charityId }),
};
