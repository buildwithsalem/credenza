import {
  type Session,
  type InsertSession,
  type Goal,
  type InsertGoal,
  type StudyStats,
  type Insights,
  type SubjectStats,
  type TimePattern,
} from "@shared/schema";
import { randomUUID } from "crypto";
import {
  differenceInDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  isSameDay,
  eachDayOfInterval,
} from "date-fns";

export interface IStorage {
  // Sessions
  getAllSessions(): Promise<Session[]>;
  getRecentSessions(limit: number): Promise<Session[]>;
  getSessionById(id: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;

  // Goals
  getAllGoals(): Promise<Goal[]>;
  getActiveGoals(): Promise<Goal[]>;
  getGoalById(id: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;

  // Statistics and Insights
  getStatistics(): Promise<StudyStats>;
  getInsights(): Promise<Insights>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, Session>;
  private goals: Map<string, Goal>;

  constructor() {
    this.sessions = new Map();
    this.goals = new Map();
  }

  // Sessions Methods
  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getRecentSessions(limit: number = 5): Promise<Session[]> {
    const allSessions = await this.getAllSessions();
    return allSessions.slice(0, limit);
  }

  async getSessionById(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = { ...insertSession, id };
    this.sessions.set(id, session);
    return session;
  }

  // Goals Methods
  async getAllGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values()).sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }

  async getActiveGoals(): Promise<Goal[]> {
    const now = new Date();
    return Array.from(this.goals.values())
      .filter((goal) => new Date(goal.endDate) >= now)
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  }

  async getGoalById(id: string): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = { ...insertGoal, id };
    this.goals.set(id, goal);
    return goal;
  }

  // Statistics Methods
  async getStatistics(): Promise<StudyStats> {
    const sessions = await this.getAllSessions();

    // Calculate total hours
    const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
    const totalHours = totalMinutes / 60;

    // Calculate current streak and longest streak
    const { currentStreak, longestStreak } = this.calculateStreaks(sessions);

    // Calculate sessions this week
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const sessionsThisWeek = sessions.filter((s) =>
      isWithinInterval(new Date(s.date), { start: weekStart, end: weekEnd })
    ).length;

    // Calculate goals completed
    const goals = await this.getAllGoals();
    const goalsCompleted = goals.filter((goal) => {
      const goalSessions = sessions.filter((s) =>
        isWithinInterval(new Date(s.date), {
          start: new Date(goal.startDate),
          end: new Date(goal.endDate),
        })
      );
      const totalGoalMinutes = goalSessions.reduce((acc, s) => acc + s.duration, 0);
      const totalGoalHours = totalGoalMinutes / 60;
      return totalGoalHours >= goal.targetHours;
    }).length;

    return {
      totalHours,
      currentStreak,
      longestStreak,
      sessionsThisWeek,
      goalsCompleted,
    };
  }

  private calculateStreaks(sessions: Session[]): {
    currentStreak: number;
    longestStreak: number;
  } {
    if (sessions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Get unique study days, sorted descending
    const studyDays = Array.from(
      new Set(
        sessions.map((s) => startOfDay(new Date(s.date)).getTime())
      )
    )
      .sort((a, b) => b - a)
      .map((time) => new Date(time));

    if (studyDays.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Calculate current streak
    let currentStreak = 0;
    const today = startOfDay(new Date());
    const yesterday = startOfDay(new Date(today.getTime() - 24 * 60 * 60 * 1000));

    // Check if there's a session today or yesterday to start the streak
    if (
      isSameDay(studyDays[0], today) ||
      isSameDay(studyDays[0], yesterday)
    ) {
      currentStreak = 1;
      for (let i = 1; i < studyDays.length; i++) {
        const daysDiff = differenceInDays(studyDays[i - 1], studyDays[i]);
        if (daysDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < studyDays.length; i++) {
      const daysDiff = differenceInDays(studyDays[i - 1], studyDays[i]);
      if (daysDiff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    return { currentStreak, longestStreak };
  }

  // Insights Methods
  async getInsights(): Promise<Insights> {
    const sessions = await this.getAllSessions();

    if (sessions.length === 0) {
      return {
        mostStudiedSubject: "",
        mostProductiveHour: 0,
        averageSessionLength: 0,
        studyPatterns: [],
        subjectBreakdown: [],
      };
    }

    // Most studied subject
    const subjectMap = new Map<string, number>();
    sessions.forEach((s) => {
      const current = subjectMap.get(s.subject) || 0;
      subjectMap.set(s.subject, current + s.duration);
    });

    const mostStudiedSubject =
      Array.from(subjectMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

    // Most productive hour (hour of day with most sessions)
    const hourMap = new Map<number, number>();
    sessions.forEach((s) => {
      const hour = new Date(s.date).getHours();
      const current = hourMap.get(hour) || 0;
      hourMap.set(hour, current + 1);
    });

    const mostProductiveHour =
      Array.from(hourMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 0;

    // Average session length
    const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
    const averageSessionLength = Math.round(totalMinutes / sessions.length);

    // Study patterns by hour
    const studyPatterns: TimePattern[] = Array.from(hourMap.entries())
      .map(([hour, sessionCount]) => ({ hour, sessionCount }))
      .sort((a, b) => a.hour - b.hour);

    // Subject breakdown
    const subjectBreakdown: SubjectStats[] = Array.from(subjectMap.entries())
      .map(([subject, totalMinutes]) => {
        const subjectSessions = sessions.filter((s) => s.subject === subject);
        return {
          subject,
          totalHours: totalMinutes / 60,
          sessionCount: subjectSessions.length,
          averageSessionLength: totalMinutes / subjectSessions.length,
        };
      })
      .sort((a, b) => b.totalHours - a.totalHours);

    return {
      mostStudiedSubject,
      mostProductiveHour,
      averageSessionLength,
      studyPatterns,
      subjectBreakdown,
    };
  }
}

export const storage = new MemStorage();
