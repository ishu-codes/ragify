export interface Charity {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    website?: string;
    totalReceived: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCharityInput {
    name: string;
    description: string;
    website?: string;
    logoUrl?: string;
}
