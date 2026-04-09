import { Draw } from "./draw";

export type WinnerStatus = "PENDING_PROOF" | "PROOFS_UPLOADED" | "VERIFIED" | "PAID" | "REJECTED";

export interface Winner {
  id: string;
  userId: string;
  drawId: string;
  amount: number;
  status: WinnerStatus;
  proofUrl?: string;
  paidAt?: string;
  createdAt: string;
  draw: Draw;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Winning {
  list: Winner[];
  totalWon: number;
  pendingPayments: number;
}
