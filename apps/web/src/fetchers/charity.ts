import { api } from "@/lib/api";
import { Charity, CreateCharityInput } from "@/types/charity";

export const charityFetchers = {
  list: () => api.get<Charity[]>("charities"),
  get: (id: string) => api.get<Charity>(`charities/${id}`),
  create: (data: CreateCharityInput) => api.post<Charity>("charities", data),
  update: (id: string, data: Partial<CreateCharityInput> & { isActive?: boolean }) =>
    api.patch<Charity>(`charities/${id}`, data),
  delete: (id: string) => api.delete(`charities/${id}`),
};
