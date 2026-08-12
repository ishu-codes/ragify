import type { Subscription } from "./subscription";
import type { GolfScore } from "./score";
import type { Draw } from "./draw";
import type { Winning } from "./winner";

export interface DashboardData {
  subscription: Subscription | null;
  scores: {
    active: GolfScore[];
    recent: GolfScore[];
    average: number;
    total: number;
  };
  draws: {
    entries: any[];
    upcoming: Draw[];
    totalEntered: number;
  };
  winnings: Winning;
}
