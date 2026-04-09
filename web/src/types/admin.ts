export interface PlatformStats {
    users: {
        total: number;
        activeSubscriptions: number;
    };
    subscriptions: {
        totalRevenue: number;
    };
    charity: {
        totalDonated: number;
    };
    draws: {
        upcoming: number;
        totalEntries: number;
    };
    winners: {
        totalPaid: number;
        pendingPayouts: number;
    };
    charitiesBreakdown: Array<{
        id: string;
        name: string;
        totalReceived: number;
    }>;
}
