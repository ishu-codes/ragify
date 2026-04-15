import { Charity } from "./charity";

export type SubscriptionPlan = "MONTHLY" | "YEARLY";
export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED";

export interface Subscription {
    id: string;
    userId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    startDate: string;
    endDate: string;
    price: number;
    contributionPercent: number;
    charityId?: string;
    charity?: Charity;
    createdAt: string;
}

export interface CreateSubscriptionInput {
    plan: SubscriptionPlan;
    charityId: string;
}
