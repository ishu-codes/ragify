"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, TrendingUp, Heart, Trophy, ArrowUpRight, DollarSign, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { adminFetchers } from "@/fetchers/admin";
import { cn } from "@/lib/utils";
import { AllocationChart } from "@/components/admin/AllocationChart";

export default function AdminDashboardPage() {
  const {
    data: stats,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminFetchers.stats,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const start = Date.now();
    await refetch();
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, 1000 - elapsed);
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Users",
      value: stats?.users.total || 0,
      icon: Users,
      trend: "+12%",
    },
    {
      label: "Revenue",
      value: `₹ ${(stats?.subscriptions.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      trend: "+8%",
    },
    {
      label: "Charities",
      value: `₹ ${(stats?.charity.totalDonated || 0).toLocaleString()}`,
      icon: Heart,
      trend: "Stable",
    },
    {
      label: "Distributed",
      value: `₹ ${(stats?.winners.totalPaid || 0).toLocaleString()}`,
      icon: Trophy,
      trend: "+24%",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">Monitor platform performance and system health.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-wider">System Live</span>
          </div>
          <Button size="sm" onClick={handleRefresh} disabled={isRefreshing} className="min-w-[100px]">
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i} className="rounded-xl border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {card.label}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl font-bold">{card.value}</CardTitle>
              {/*<p className="text-xs text-muted-foreground mt-1">
                <span className="text-emerald-500 font-medium">{card.trend}</span> from last month
              </p>*/}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-xl border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mission Impact</CardTitle>
                <CardDescription>Progress towards distribution targets</CardDescription>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Total Distributed
                </p>
                <p className="text-4xl font-bold tracking-tight text-primary">
                  &#8377;{(stats?.winners.totalPaid || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Target Delta</p>
                <p className="text-xl font-semibold opacity-50">
                  &#8377;{(2500000 - (stats?.winners.totalPaid || 0)).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Progress value={((stats?.winners.totalPaid || 0) / 2500000) * 100} className="h-2 rounded-full" />
              <div className="flex justify-between text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                <span>Phase Start</span>
                <span>&#8377;2.5M Target</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/20 py-4">
            <Button variant="ghost" size="sm" className="w-full text-xs font-semibold tracking-wide uppercase">
              View Performance Audit <ArrowUpRight className="ml-2 h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="rounded-xl border shadow-sm bg-muted/10">
          <CardHeader>
            <CardTitle>Capital Allocation</CardTitle>
            <CardDescription>Top supported charities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AllocationChart data={stats?.charitiesBreakdown ?? []} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Member Management</CardTitle>
                <CardDescription>Manage registry and permissions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Overview of {stats?.users.total || 0} registered members and {stats?.users.activeSubscriptions || 0}{" "}
              active nodes.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href="/admin/users">Access User Data</a>
            </Button>
          </CardFooter>
        </Card>

        <Card className="rounded-xl border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Heart className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Strategic Partners</CardTitle>
                <CardDescription>Audit charitable impact</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Monitoring {stats?.users.total || 0} partner endpoints with verified status.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href="/admin/charities">Partner Directory</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
