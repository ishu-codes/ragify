"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trophy,
  CheckCircle2,
  Clock,
  Search,
  MoreVertical,
  ExternalLink,
  ShieldCheck,
  Ban,
  ArrowUpRight,
  Filter,
  ArrowRight,
  Layout,
  UserCheck,
  History as HistoryIcon,
  Image as ImageIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { winnerFetchers } from "@/fetchers/winner";

export default function AdminWinnersPage() {
  const queryClient = useQueryClient();
  const [selectedWinner, setSelectedWinner] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: winners, isLoading } = useQuery({
    queryKey: ["admin", "winners"],
    queryFn: winnerFetchers.list,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => winnerFetchers.verify(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "winners"] });
      toast.success("Winner verified successfully.");
      setIsPreviewOpen(false);
    },
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => winnerFetchers.pay(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "winners"] });
      toast.success("Payout confirmed.");
      setIsPreviewOpen(false);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // console.log({ winners });
  const pendingReview = winners?.winners.filter((w) => w.status === "PROOFS_UPLOADED") || [];
  const awaitingPayout = winners?.winners.filter((w) => w.status === "VERIFIED") || [];
  const completed = winners?.winners.filter((w) => w.status === "PAID") || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit & Settlement</h1>
          <p className="text-muted-foreground">Manage winner verification and prize disbursement.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-full border border-border shadow-sm">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg/seed=${i + 10}`} alt="" />
              </div>
            ))}
          </div>
          <p className="text-xs font-bold uppercase tracking-wider">{winners?.winners.length || 0} Total Entries</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-lg w-full md:w-auto h-auto grid grid-cols-3 md:flex md:gap-1">
          <TabsTrigger value="pending" className="rounded-md px-6 py-2 transition-all">
            Review{" "}
            <Badge variant="secondary" className="ml-2 px-1.5 h-4 text-[10px]">
              {pendingReview.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="payouts" className="rounded-md px-6 py-2 transition-all">
            Payouts{" "}
            <Badge variant="secondary" className="ml-2 px-1.5 h-4 text-[10px]">
              {awaitingPayout.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-md px-6 py-2 transition-all">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingReview.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingReview.map((winner) => (
                <Card key={winner.id} className="rounded-xl border shadow-sm flex flex-col group">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-bold text-primary border-primary/20"
                      >
                        Awaiting Audit
                      </Badge>
                      <Trophy className="h-4 w-4 text-primary opacity-20" />
                    </div>
                    <CardTitle className="text-lg">{winner.user?.name || "Unknown node"}</CardTitle>
                    <CardDescription className="text-xs font-medium uppercase tracking-tight">
                      {winner.user?.email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                        Prize Allocation
                      </p>
                      <p className="text-3xl font-bold text-foreground tracking-tight">
                        &#8377;{winner.amount?.toLocaleString()}
                      </p>
                    </div>
                    <div className="aspect-video bg-muted/30 rounded-lg border border-dashed flex flex-col items-center justify-center overflow-hidden relative group-hover:border-primary/40 transition-colors">
                      {winner.proofUrl ? (
                        <img
                          src={winner.proofUrl}
                          className="object-cover w-full h-full cursor-pointer hover:scale-105 transition-transform"
                          alt="Proof"
                          onClick={() => {
                            setSelectedWinner(winner);
                            setIsPreviewOpen(true);
                          }}
                        />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">
                            No proof attached
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 pb-6 px-6">
                    <Button
                      className="w-full rounded-lg h-10 text-xs font-bold gap-2"
                      onClick={() => {
                        setSelectedWinner(winner);
                        setIsPreviewOpen(true);
                      }}
                    >
                      Audit Entry <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border-2 border-dashed rounded-xl bg-muted/5">
              <UserCheck className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium text-sm">Review queue is empty.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payouts" className="mt-6">
          <Card className="rounded-xl border shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-semibold tracking-widest border-b">
                    <tr>
                      <th className="px-6 py-4">Winner Node</th>
                      <th className="px-6 py-4">Allocation</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Settlement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {awaitingPayout.map((winner) => (
                      <tr key={winner.id} className="hover:bg-muted/5 transition-colors">
                        <td className="px-6 py-5">
                          <p className="font-semibold text-base">{winner.user?.name}</p>
                          <p className="text-xs text-muted-foreground lowercase">{winner.user?.email}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-bold text-xl text-primary tracking-tight">
                            &#8377;{winner.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 text-[10px] font-bold uppercase tracking-widest">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Verified
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Button
                            size="sm"
                            className="rounded-lg font-bold gap-2"
                            onClick={() => {
                              if (confirm("Confirm terminal settlement?")) {
                                payMutation.mutate(winner.id);
                              }
                            }}
                          >
                            Execute Payout <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!awaitingPayout.length && (
                  <div className="py-20 text-center text-muted-foreground/30 font-semibold text-xs uppercase tracking-widest">
                    No verified payouts pending.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="rounded-xl border shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-semibold tracking-widest border-b">
                    <tr>
                      <th className="px-6 py-4">Recipient</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Completed</th>
                      <th className="px-6 py-4 text-right">Log</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {completed.map((winner) => (
                      <tr key={winner.id} className="hover:bg-muted/5 transition-colors opacity-80 hover:opacity-100">
                        <td className="px-6 py-4">
                          <p className="font-semibold">{winner.user?.name}</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                            {winner.user?.email}
                          </p>
                        </td>
                        <td className="px-6 py-4 font-bold text-primary">
                          &#8377;{winner.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs font-semibold tabular-nums uppercase">
                          {new Date(winner.paidAt!).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-md text-[10px] font-bold uppercase tracking-widest gap-1"
                          >
                            Audit <ExternalLink className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!completed.length && (
                <div className="py-20 text-center text-muted-foreground/30 font-semibold text-xs uppercase tracking-widest">
                  No settled records found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl p-0 rounded-xl overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-foreground text-background p-8">
            <DialogTitle className="text-2xl font-bold tracking-tight">Forensic Verification</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Cross-reference member evidence with registry score data.
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Entity Parameters
                  </p>
                  <div className="rounded-lg border bg-muted/30 p-5 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">Node Identity</span>
                      <span className="font-bold">{selectedWinner?.user?.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">Allocated Pool</span>
                      <span className="font-bold text-primary">
                        &#8377;{selectedWinner?.amount?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground font-medium">Hex Identifier</span>
                      <span className="font-mono text-muted-foreground/60">
                        #{selectedWinner?.id?.slice(-12).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-primary/5 p-5 rounded-lg border border-primary/20 flex gap-4">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0 opacity-60" />
                  <p className="text-[11px] font-medium text-primary/80 leading-relaxed">
                    Verify score proof against handicap index records before committing clearance.
                  </p>
                </div>
              </div>
              <div className="md:col-span-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Evidence Log</p>
                <div className="aspect-video bg-muted/20 rounded-lg border-2 border-dashed overflow-hidden flex items-center justify-center relative group">
                  {selectedWinner?.proofUrl ? (
                    <img src={selectedWinner.proofUrl} className="object-contain w-full h-full" alt="Winner Proof" />
                  ) : (
                    <HistoryIcon className="h-8 w-8 text-muted-foreground/20" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="ghost"
                className="flex-1 rounded-lg font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                Reject Proof
              </Button>
              <Button
                className="flex-[2] rounded-lg font-bold text-lg"
                disabled={verifyMutation.isPending || selectedWinner?.status === "VERIFIED"}
                onClick={() => verifyMutation.mutate(selectedWinner.id)}
              >
                {verifyMutation.isPending ? "Clearing..." : "Commit Clearance"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
