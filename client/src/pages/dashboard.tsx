import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Clock, Target, TrendingUp, BookOpen, Calendar, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { format, formatDistanceToNow } from "date-fns";
import type { Session, StudyStats, Goal } from "@shared/schema";

interface DashboardProps {
  onLogSession: () => void;
}

export default function Dashboard({ onLogSession }: DashboardProps) {
  const { data: stats, isLoading: statsLoading } = useQuery<StudyStats>({
    queryKey: ["/api/statistics"],
  });

  const { data: recentSessions, isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions/recent"],
  });

  const { data: activeGoals, isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals/active"],
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-80 w-full overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2073')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="container relative flex h-full flex-col justify-end px-6 pb-12">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Welcome back, Student
            </h1>
            <p className="text-lg text-muted-foreground">
              {stats && stats.currentStreak > 0 ? (
                <>
                  You're on a <span className="font-semibold text-foreground">{stats.currentStreak} day</span> study streak! Keep it going.
                </>
              ) : (
                "Ready to start your learning journey today?"
              )}
            </p>
            <Button
              size="lg"
              className="gap-2"
              onClick={onLogSession}
              data-testid="button-quick-log"
            >
              <BookOpen className="h-5 w-5" />
              Quick Log Session
            </Button>
          </div>
        </div>
      </div>

      <div className="container px-6 py-8">
        {/* Stats Grid */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold" data-testid="text-total-hours">
                    {stats?.totalHours.toFixed(1) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">hours studied</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold" data-testid="text-current-streak">
                    {stats?.currentStreak || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats && stats.longestStreak > 0 && `Longest: ${stats.longestStreak} days`}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Goals Completed</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold" data-testid="text-goals-completed">
                    {stats?.goalsCompleted || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">this period</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold" data-testid="text-sessions-week">
                    {stats?.sessionsThisWeek || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">sessions logged</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area - 2 Column Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Sessions - Left Column (2/3) */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recent Sessions</h2>
              <Link href="/sessions">
                <Button variant="ghost" className="gap-2" data-testid="link-view-all-sessions">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {sessionsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : recentSessions && recentSessions.length > 0 ? (
                recentSessions.map((session) => (
                  <Card key={session.id} className="hover-elevate" data-testid={`card-session-${session.id}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" data-testid={`badge-subject-${session.id}`}>
                              {session.subject}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(session.date), "MMM d, yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{session.duration} minutes</span>
                            <span className="text-muted-foreground">
                              • {formatDistanceToNow(new Date(session.date), { addSuffix: true })}
                            </span>
                          </div>
                          {session.notes && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {session.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">No sessions yet</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Start logging your study sessions to track your progress
                    </p>
                    <Button onClick={onLogSession} data-testid="button-log-first-session">
                      Log Your First Session
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column (1/3) - Goals & Insights */}
          <div className="space-y-6">
            {/* Active Goals */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Active Goals</h3>
                <Link href="/goals">
                  <Button variant="ghost" size="sm" data-testid="link-manage-goals">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {goalsLoading ? (
                  <Card>
                    <CardContent className="p-4">
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ) : activeGoals && activeGoals.length > 0 ? (
                  activeGoals.slice(0, 3).map((goal) => (
                    <Card key={goal.id} data-testid={`card-goal-${goal.id}`}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{goal.title}</p>
                              <Badge variant="outline" className="mt-1">
                                {goal.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progress</span>
                              <span>0 / {goal.targetHours}h</span>
                            </div>
                            <Progress value={0} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Target className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No active goals</p>
                      <Link href="/goals">
                        <Button variant="link" size="sm" className="mt-2" data-testid="link-set-goal">
                          Set a goal
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Quick Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Insight</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {stats && stats.sessionsThisWeek > 0
                      ? "Great work this week! Consistency is key to mastering new skills."
                      : "Start your week strong by logging your first study session!"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
