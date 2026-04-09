"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trophy,
  Plus,
  Play,
  History,
  Users,
  Calendar,
  Ticket,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { cn } from "@/lib/utils";

import { drawFetchers } from "@/fetchers/draw";

const drawSchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.number().min(2024).max(2030),
  drawType: z.enum(["ALGORITHM", "RANDOM"]),
});

type DrawFormValues = z.infer<typeof drawSchema>;

export default function AdminDrawsPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: draws, isLoading } = useQuery({
    queryKey: ["admin", "draws"],
    queryFn: () => drawFetchers.list(),
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const form = useForm<DrawFormValues>({
    resolver: zodResolver(drawSchema),
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      drawType: "ALGORITHM",
    },
  });

  const createMutation = useMutation({
    mutationFn: drawFetchers.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "draws"] });
      toast.success("Draw scheduled successfully.");
      setIsAddOpen(false);
      form.reset();
    },
    onError: (err: any) => toast.error(err.message || "Failed to schedule draw"),
  });

  const runMutation = useMutation({
    mutationFn: drawFetchers.run,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "draws"] });
      toast.success(`Draw executed! Winner selected.`);
    },
    onError: (err: any) => toast.error(err.message || "Execution failed"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[250px] rounded-xl" />
          <Skeleton className="h-[250px] rounded-xl" />
        </div>
      </div>
    );
  }

  const openDraws = draws?.filter((d) => d.status === "OPEN") || [];
  const completedDraws = draws?.filter((d) => d.status === "COMPLETED") || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Draw Cycles</h1>
          <p className="text-muted-foreground">Manage and execute scheduled prize cycles.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> New Cycle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] rounded-xl">
            <DialogHeader>
              <DialogTitle>Schedule Draw Cycle</DialogTitle>
              <DialogDescription>Configure the parameters for a new prize distribution cycle.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v as any))} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="month"
                    className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Month (1-12)
                  </Label>
                  <Input id="month" type="number" {...form.register("month")} className="rounded-lg" />
                  {form.formState.errors.month && (
                    <p className="text-[10px] text-destructive font-bold">{form.formState.errors.month.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="year"
                    className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Year
                  </Label>
                  <Input id="year" type="number" {...form.register("year")} className="rounded-lg" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Selection Protocol
                </Label>
                <Select
                  onValueChange={(v) => form.setValue("drawType", v as any)}
                  defaultValue={form.getValues("drawType")}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select protocol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALGORITHM">Algorithm (Weighted)</SelectItem>
                    <SelectItem value="RANDOM">Random (Standard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg flex gap-3 text-xs text-muted-foreground border">
                <AlertCircle className="h-4 w-4 shrink-0 text-primary" />
                <p>Initializing a cycle opens registry for all qualified members immediately.</p>
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full rounded-lg" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Scheduling..." : "Schedule Cycle"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" /> Active Submissions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {openDraws.length ? (
            openDraws.map((draw) => (
              <Card key={draw.id} className="border shadow-sm rounded-xl flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                      Open
                    </Badge>
                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(0, draw.month - 1).toLocaleString("default", { month: "long" })} {draw.year}
                    </div>
                  </div>
                  <CardTitle className="text-lg">Cycle #{draw.id.slice(-4).toUpperCase()}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Prize Pool
                    </p>
                    <p className="text-2xl font-bold text-primary">${draw.prizePool?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs border rounded-lg p-3 bg-muted/20">
                    <div>
                      <p className="text-muted-foreground font-medium">Entries</p>
                      <p className="font-bold">{draw._count?.entries || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground font-medium">Protocol</p>
                      <p className="font-bold uppercase">{draw.drawType}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-6 px-6">
                  <Button
                    className="w-full rounded-lg"
                    size="sm"
                    disabled={runMutation.isPending || (draw._count?.entries || 0) === 0}
                    onClick={() => {
                      if (confirm("Execute draw? This operation cannot be reversed.")) {
                        runMutation.mutate(draw.id);
                      }
                    }}
                  >
                    <Play className="h-3.5 w-3.5 mr-2" /> {runMutation.isPending ? "Executing..." : "Execute Draw"}
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-muted/5">
              <Trophy className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium text-sm">No active cycles found.</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <History className="h-4 w-4" /> Historical Ledger
        </h2>
        <Card className="border shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-semibold tracking-widest border-b">
                  <tr>
                    <th className="px-6 py-3">Cycle</th>
                    <th className="px-6 py-3">Prize Pool</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Settled</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {completedDraws.map((draw) => (
                    <tr key={draw.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4 font-semibold">
                        {new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(0, draw.month - 1))}{" "}
                        {draw.year}
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">
                        ${draw.prizePool.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[9px] uppercase font-bold">
                          {draw.drawType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {draw.drawnAt ? new Date(draw.drawnAt).toLocaleDateString() : "---"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="h-8 rounded-md text-xs">
                          Logs
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!completedDraws.length && (
                <div className="py-12 text-center text-muted-foreground/30 font-medium text-xs uppercase tracking-widest">
                  No historical records found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
