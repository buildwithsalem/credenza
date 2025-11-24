import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Clock, BookOpen, Calendar, Award } from "lucide-react";
import type { Session, Insights as InsightsType, SubjectStats } from "@shared/schema";
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Insights() {
  const { data: sessions, isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: insights, isLoading: insightsLoading } = useQuery<InsightsType>({
    queryKey: ["/api/insights"],
  });

  // Calculate daily data for the last 7 days
  const getDailyData = () => {
    if (!sessions) return [];
    const days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return days.map((day) => {
      const daySessions = sessions.filter(
        (s) =>
          format(new Date(s.date), "yyyy-MM-dd") ===
          format(day, "yyyy-MM-dd")
      );
      const totalMinutes = daySessions.reduce((acc, s) => acc + s.duration, 0);
      return {
        date: format(day, "MMM d"),
        hours: Number((totalMinutes / 60).toFixed(1)),
        sessions: daySessions.length,
      };
    });
  };

  // Calculate weekly data for the last 4 weeks
  const getWeeklyData = () => {
    if (!sessions) return [];
    const now = new Date();
    const weeks = eachWeekOfInterval({
      start: subWeeks(now, 3),
      end: now,
    });

    return weeks.map((weekStart, index) => {
      const weekEnd = subDays(eachWeekOfInterval({
        start: weekStart,
        end: now,
      })[1] || now, 0);
      
      const weekSessions = sessions.filter((s) => {
        const sessionDate = new Date(s.date);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });
      
      const totalMinutes = weekSessions.reduce((acc, s) => acc + s.duration, 0);
      return {
        week: `Week ${index + 1}`,
        hours: Number((totalMinutes / 60).toFixed(1)),
        sessions: weekSessions.length,
      };
    });
  };

  // Calculate monthly data
  const getMonthlyData = () => {
    if (!sessions) return [];
    const now = new Date();
    const months = eachMonthOfInterval({
      start: subMonths(now, 5),
      end: now,
    });

    return months.map((month) => {
      const monthSessions = sessions.filter(
        (s) =>
          format(new Date(s.date), "yyyy-MM") === format(month, "yyyy-MM")
      );
      const totalMinutes = monthSessions.reduce((acc, s) => acc + s.duration, 0);
      return {
        month: format(month, "MMM"),
        hours: Number((totalMinutes / 60).toFixed(1)),
        sessions: monthSessions.length,
      };
    });
  };

  // Get subject breakdown
  const getSubjectData = () => {
    if (!sessions) return [];
    const subjectMap = new Map<string, number>();
    
    sessions.forEach((s) => {
      const current = subjectMap.get(s.subject) || 0;
      subjectMap.set(s.subject, current + s.duration / 60);
    });

    return Array.from(subjectMap.entries())
      .map(([subject, hours]) => ({
        subject,
        hours: Number(hours.toFixed(1)),
      }))
      .sort((a, b) => b.hours - a.hours);
  };

  const dailyData = getDailyData();
  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();
  const subjectData = getSubjectData();

  return (
    <div className="container max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Learning Insights</h1>
        <p className="mt-2 text-muted-foreground">
          Discover your study patterns and optimize your learning
        </p>
      </div>

      {/* Key Insights Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Studied</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {insightsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-most-studied">
                  {insights?.mostStudiedSubject || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">favorite subject</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {insightsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-peak-time">
                  {insights?.mostProductiveHour !== undefined
                    ? `${insights.mostProductiveHour}:00`
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">most productive hour</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {insightsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-avg-session">
                  {insights?.averageSessionLength
                    ? `${insights.averageSessionLength}m`
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">average length</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-total-sessions-insights">
                  {sessions?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">all time</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Study Hours Over Time</CardTitle>
            <CardDescription>Track your study time across different periods</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily" className="space-y-4">
              <TabsList>
                <TabsTrigger value="daily" data-testid="tab-daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly" data-testid="tab-weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly" data-testid="tab-monthly">Monthly</TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="space-y-4">
                {sessionsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                      <Bar dataKey="hours" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>

              <TabsContent value="weekly" className="space-y-4">
                {sessionsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="hours"
                        stroke={CHART_COLORS[1]}
                        strokeWidth={2}
                        dot={{ fill: CHART_COLORS[1], r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>

              <TabsContent value="monthly" className="space-y-4">
                {sessionsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                      <Bar dataKey="hours" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Subject Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subject Breakdown</CardTitle>
            <CardDescription>Hours spent on each subject</CardDescription>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : subjectData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.subject}: ${entry.hours}h`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="hours"
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Details</CardTitle>
            <CardDescription>Detailed breakdown by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessionsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))
              ) : subjectData.length > 0 ? (
                subjectData.map((subject, index) => {
                  const sessionCount = sessions?.filter(s => s.subject === subject.subject).length || 0;
                  const avgLength = sessionCount > 0 ? (subject.hours * 60 / sessionCount).toFixed(0) : 0;
                  
                  return (
                    <div
                      key={subject.subject}
                      className="flex items-center justify-between rounded-lg border p-4"
                      data-testid={`subject-detail-${subject.subject}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium">{subject.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            {sessionCount} sessions • {avgLength}m avg
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{subject.hours}h</Badge>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  Start logging sessions to see subject breakdown
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
