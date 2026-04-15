"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Heart,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Info,
  LayoutGrid,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { charityFetchers } from "@/fetchers/charity";

const charitySchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description is too short."),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
});

export default function AdminCharitiesPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState<any>(null);
  const [search, setSearch] = useState("");

  const { data: charities, isLoading } = useQuery({
    queryKey: ["admin", "charities"],
    queryFn: charityFetchers.list,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const form = useForm<z.infer<typeof charitySchema>>({
    resolver: zodResolver(charitySchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
      imageUrl: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: charityFetchers.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "charities"] });
      toast.success("Charity partner added.");
      setIsAddOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: any) => charityFetchers.update(editingCharity.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "charities"] });
      toast.success("Partner details updated.");
      setEditingCharity(null);
      setIsAddOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: charityFetchers.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "charities"] });
      toast.success("Partner removed.");
    },
  });

  function onSubmit(values: z.infer<typeof charitySchema>) {
    if (editingCharity) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  const openEdit = (charity: any) => {
    setEditingCharity(charity);
    form.reset({
      name: charity.name,
      description: charity.description,
      website: charity.website || "",
      imageUrl: charity.imageUrl || "",
    });
    setIsAddOpen(true);
  };

  const filteredCharities = charities?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Charity Partners</h1>
          <p className="text-muted-foreground">Manage and track charitable distribution targets.</p>
        </div>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => {
            setEditingCharity(null);
            form.reset();
            setIsAddOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Partner
        </Button>
      </div>

      <Card className="rounded-xl border shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/5 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">Partner Directory</CardTitle>
              <CardDescription>View and manage all active partners.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search partners..."
                className="pl-9 h-9 w-full md:w-[300px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-semibold tracking-widest border-b">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Partner</th>
                    <th className="px-6 py-3 font-semibold">Impact</th>
                    <th className="px-6 py-3 font-semibold">Website</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCharities?.map((charity) => (
                    <tr key={charity.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border overflow-hidden shrink-0">
                            {charity.imageUrl ? (
                              <img src={charity.imageUrl} className="object-cover w-full h-full" alt="" />
                            ) : (
                              <Heart className="h-5 w-5 text-primary/40" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{charity.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                              {charity.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-primary">
                            &#8377;{charity.totalReceived?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">Total Donated</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={charity.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline hover:underline-offset-4"
                        >
                          Visit <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => openEdit(charity)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this charity?")) {
                                deleteMutation.mutate(charity.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredCharities?.length && (
                <div className="py-24 text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-muted mb-4">
                    <LayoutGrid className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">No partners found</h3>
                  <p className="text-sm text-muted-foreground">Adjust your search to find more results.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-xl">
          <DialogHeader>
            <DialogTitle>{editingCharity ? "Edit Partner" : "Add New Partner"}</DialogTitle>
            <DialogDescription>
              Define the details for this charitable distribution partner.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Partner Name
              </Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="e.g. Global Relief Fund"
                className="rounded-lg"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive font-medium">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Outline impact goals and protocols..."
                className="min-h-[100px] rounded-lg resize-none"
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive font-medium">{form.formState.errors.description.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Website URL
                </Label>
                <Input
                  id="website"
                  {...form.register("website")}
                  placeholder="https://..."
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Logo URL
                </Label>
                <Input
                  id="imageUrl"
                  {...form.register("imageUrl")}
                  placeholder="https://..."
                  className="rounded-lg"
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="submit"
                className="w-full rounded-lg"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingCharity
                    ? "Save Changes"
                    : "Add Partner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
