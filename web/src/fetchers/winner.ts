import { api } from "@/lib/api";
import { Winner, Winning } from "@/types/winner";

export const winnerFetchers = {
  list: () => api.get<{ winners: Winner[] }>("winners"),
  mine: () => api.get<Winning>("winners/me"),
  uploadProof: (id: string, proofUrl: string) => api.post(`winners/${id}/proof`, { proofUrl }),
  verify: (id: string) => api.patch(`winners/${id}/verify`),
  pay: (id: string) => api.patch(`winners/${id}/pay`),
};
