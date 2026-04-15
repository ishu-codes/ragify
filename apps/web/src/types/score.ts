export interface GolfScore {
    id: string;
    userId: string;
    score: number;
    courseName: string;
    playedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateScoreInput {
    score: number;
    courseName: string;
    playedAt: string;
}
