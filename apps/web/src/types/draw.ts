export type DrawStatus = "OPEN" | "PENDING" | "COMPLETED" | "CANCELLED";
export type DrawType = "ALGORITHM" | "RANDOM";

export interface Draw {
    id: string;
    month: number;
    year: number;
    status: DrawStatus;
    drawType: DrawType;
    prizePool: number;
    drawnAt?: string;
    createdAt: string;
    _count?: {
        entries: number;
    };
    winner?: any;
}

export interface CreateDrawInput {
    month: number;
    year: number;
    prizePool: number;
    type: DrawType;
}
