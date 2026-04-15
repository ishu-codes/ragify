"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, ShieldAlert, UserCog, Mail, ShieldCheck, User, ShieldX, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

import { adminFetchers } from "@/fetchers/admin";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminFetchers.users,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const updateRoleMutation = useMutation({
    mutationFn: (values: { userId: string; role: string }) => adminFetchers.updateUserRole(values.userId, values.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User role updated successfully.");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64 rounded-full" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  const filteredUsers = users?.users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const adminCount = users?.users.filter((u) => u.role === "ADMIN").length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Identity Registry</h1>
          <p className="text-muted-foreground">Audit system members and manage access levels.</p>
        </div>

        <div className="flex items-center gap-6 px-6 py-3 bg-muted/50 rounded-xl border border-border">
          <div className="text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Nodes</p>
            <p className="text-xl font-bold">{users?.users.length || 0}</p>
          </div>
          <Separator orientation="vertical" className="h-8 shadow-none" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Admin Hooks</p>
            <p className="text-xl font-bold text-primary">{adminCount}</p>
          </div>
        </div>
      </div>

      <Card className="rounded-xl border shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/5 border-b py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">Member Database</CardTitle>
              <CardDescription>Filtered view of all identified system entities.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search nodes by identity..."
                className="pl-9 h-9 w-full md:w-[350px] rounded-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-semibold tracking-widest border-b">
                <tr>
                  <th className="px-6 py-3">Identity Node</th>
                  <th className="px-6 py-3">Clearance</th>
                  <th className="px-6 py-3">Commitment</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers?.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border overflow-hidden shrink-0">
                          {user.image ? (
                            <img src={user.image} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <User className="h-5 w-5 text-muted-foreground/40" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold leading-tight">{user.name || "Anonymous Node"}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 lowercase tracking-tight">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={user.role === "ADMIN" ? "default" : "outline"}
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 h-5",
                          user.role === "ADMIN" ? "bg-primary border-none" : "text-muted-foreground",
                        )}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user?.subscriptions && user?.subscriptions.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-semibold uppercase text-emerald-600">Active</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-medium text-muted-foreground/40 uppercase">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs font-medium">
                      {new Date(user?.createdAt ?? new Date()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 text-xs font-semibold rounded-md border"
                        onClick={() => {
                          const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
                          if (confirm(`Elevate/Restrict clearance for ${user.name}?`)) {
                            updateRoleMutation.mutate({ userId: user.id, role: newRole });
                          }
                        }}
                        disabled={updateRoleMutation.isPending}
                      >
                        <UserCog className="h-3.5 w-3.5" /> Toggle Role
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredUsers?.length && (
              <div className="py-24 text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-muted mb-4">
                  <ShieldX className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">Node not found</h3>
                <p className="text-sm text-muted-foreground">Adjust your search parameters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
          <Lock className="h-6 w-6" />
        </div>
        <div className="flex-1 space-y-1 text-center md:text-left">
          <h4 className="text-sm font-bold text-destructive uppercase tracking-widest">Security Directive</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Elevating a node to <span className="font-bold text-destructive">ADMIN</span> clearance grants full
            architectural control. Ensure you verify identities through established protocols before promotion.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          Audit Security Logs
        </Button>
      </div>
    </div>
  );
}
