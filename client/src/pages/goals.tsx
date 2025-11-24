import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGoalSchema, type InsertGoal, type Goal } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Target, Plus, Calendar, TrendingUp } from "lucide-react";
import { format, addDays, addWeeks, addMonths, startOfDay, endOfDay } from "date-fns";

export default function Goals() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const form = useForm<InsertGoal>({
    resolver: zodResolver(insertGoalSchema),
    defaultValues: {
      type: "weekly",
      targetHours: 10,
      title: "",
      startDate: new Date(),
      endDate: addWeeks(new Date(), 1),
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: InsertGoal) => {
      return await apiRequest("POST", "/api/goals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
      toast({
        title: "Goal created successfully",
        description: "Your new study goal has been set.",
      });
      form.reset({
        type: "weekly",
        targetHours: 10,
        title: "",
        startDate: new Date(),
        endDate: addWeeks(new Date(), 1),
      });
      setDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertGoal) => {
    const payload: InsertGoal = {
      ...data,
      targetHours: Number(data.targetHours),
      startDate: data.startDate instanceof Date ? data.startDate : new Date(data.startDate),
      endDate: data.endDate instanceof Date ? data.endDate : new Date(data.endDate),
    };
    createGoalMutation.mutate(payload);
  };

  const handleTypeChange = (type: "daily" | "weekly" | "monthly") => {
    const now = new Date();
    let endDate: Date;
    
    switch (type) {
      case "daily":
        endDate = endOfDay(now);
        break;
      case "weekly":
        endDate = addWeeks(startOfDay(now), 1);
        break;
      case "monthly":
        endDate = addMonths(startOfDay(now), 1);
        break;
    }
    
    form.setValue("type", type);
    form.setValue("startDate", startOfDay(now));
    form.setValue("endDate", endDate);
  };

  const activeGoals = goals?.filter(g => new Date(g.endDate) >= new Date()) || [];
  const completedGoals = goals?.filter(g => new Date(g.endDate) < new Date()) || [];

  return (
    <div className="container max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Study Goals</h1>
          <p className="mt-2 text-muted-foreground">
            Set and track your learning objectives
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-create-goal">
              <Plus className="h-4 w-4" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set a study target to stay motivated and track your progress.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Master Calculus"
                          {...field}
                          data-testid="input-goal-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Type</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          handleTypeChange(value as "daily" | "weekly" | "monthly")
                        }
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-goal-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Hours</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="10"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || val === null || val === undefined) {
                              field.onChange(undefined);
                            } else {
                              const num = Number(val);
                              field.onChange(isNaN(num) ? undefined : num);
                            }
                          }}
                          data-testid="input-target-hours"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    data-testid="button-cancel-goal"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createGoalMutation.isPending}
                    data-testid="button-submit-goal"
                  >
                    {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">Active Goals</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {activeGoals.map((goal) => {
                  const progress = 0; // Will be calculated from sessions
                  const percentage = Math.min(
                    (progress / goal.targetHours) * 100,
                    100
                  );

                  return (
                    <Card key={goal.id} className="hover-elevate" data-testid={`card-goal-${goal.id}`}>
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {format(new Date(goal.startDate), "MMM d")} -{" "}
                              {format(new Date(goal.endDate), "MMM d, yyyy")}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" data-testid={`badge-goal-type-${goal.id}`}>
                            {goal.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Circular Progress */}
                        <div className="flex items-center justify-center">
                          <div className="relative h-32 w-32">
                            <svg className="h-32 w-32 -rotate-90 transform">
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-muted"
                              />
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={`${2 * Math.PI * 56}`}
                                strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
                                className="text-primary transition-all duration-500"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-bold">{percentage.toFixed(0)}%</span>
                              <span className="text-xs text-muted-foreground">complete</span>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold">
                              {progress}h / {goal.targetHours}h
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-semibold">Completed Goals</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {completedGoals.map((goal) => (
                  <Card key={goal.id} className="opacity-75">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                      <CardDescription>
                        {format(new Date(goal.endDate), "MMM d, yyyy")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-4 w-4" />
                        <span>{goal.targetHours} hours target</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {goals && goals.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Target className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">No goals yet</h3>
                <p className="mb-6 text-muted-foreground max-w-md">
                  Set your first study goal to stay motivated and track your learning progress.
                  Goals help you stay focused and achieve more!
                </p>
                <Button onClick={() => setDialogOpen(true)} size="lg" data-testid="button-create-first-goal">
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
