import { api } from "@/lib/api";
import { GolfScore, CreateScoreInput } from "@/types/score";

export const scoreFetchers = {
  list: () => api.get<GolfScore[]>("scores"),
  create: (data: CreateScoreInput) => api.post<GolfScore>("scores", data),
  update: (id: string, data: Partial<CreateScoreInput>) => api.patch<GolfScore>(`scores/${id}`, data),
  delete: (id: string) => api.delete(`scores/${id}`),
};
