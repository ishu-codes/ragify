import { api } from "@/lib/api";
import { Draw, CreateDrawInput } from "@/types/draw";

export const drawFetchers = {
  list: (status?: string) => api.get<Draw[]>("draws", { params: status ? { status } : undefined }),
  get: (id: string) => api.get<Draw>(`draws/${id}`),
  enter: (id: string) => api.post(`draws/${id}/enter`),
  create: (data: CreateDrawInput) => api.post<Draw>("draws", data),
  run: (id: string) => api.post<any>(`draws/${id}/run`),
  update: (id: string, data: Partial<Draw>) => api.patch<Draw>(`draws/${id}`, data),
};
