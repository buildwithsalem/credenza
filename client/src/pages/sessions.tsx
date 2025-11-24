import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, BookOpen, Calendar } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { Session } from "@shared/schema";

interface SessionsProps {
  onLogSession: () => void;
}

export default function Sessions({ onLogSession }: SessionsProps) {
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const totalHours = sessions?.reduce((acc, s) => acc + s.duration / 60, 0) || 0;

  return (
    <div className="container max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Study Sessions</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage all your study sessions
          </p>
        </div>
        <Button onClick={onLogSession} className="gap-2" data-testid="button-log-session-page">
          <BookOpen className="h-4 w-4" />
          Log Session
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-total-sessions">
                  {sessions?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-total-hours-sessions">
                  {totalHours.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {sessions && sessions.length > 0
                    ? format(new Date(sessions[0].date), "MMM d")
                    : "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">Latest Session</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))
        ) : sessions && sessions.length > 0 ? (
          sessions.map((session) => (
            <Card key={session.id} className="hover-elevate" data-testid={`card-session-${session.id}`}>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="text-sm" data-testid={`badge-subject-${session.id}`}>
                        {session.subject}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(session.date), "EEEE, MMMM d, yyyy")}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{session.duration} minutes</span>
                        <span className="text-muted-foreground">
                          ({(session.duration / 60).toFixed(1)} hours)
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        • {formatDistanceToNow(new Date(session.date), { addSuffix: true })}
                      </span>
                    </div>

                    {session.notes && (
                      <div className="rounded-md bg-muted/50 p-3">
                        <p className="text-sm text-foreground">{session.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">No sessions yet</h3>
              <p className="mb-6 text-muted-foreground max-w-md">
                Start tracking your learning journey by logging your first study session.
                Build momentum and watch your progress grow!
              </p>
              <Button onClick={onLogSession} size="lg" data-testid="button-log-first-session-empty">
                Log Your First Session
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
