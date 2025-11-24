import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Study Sessions Table
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  duration: integer("duration").notNull(), // duration in minutes
  date: timestamp("date").notNull(),
  notes: text("notes"),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
}).extend({
  subject: z.string().min(1, "Subject is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  date: z.coerce.date(),
  notes: z.string().optional(),
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// Goals Table
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'daily', 'weekly', 'monthly'
  targetHours: integer("target_hours").notNull(),
  title: text("title").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
}).extend({
  type: z.enum(["daily", "weekly", "monthly"]),
  targetHours: z.coerce.number().min(1, "Target must be at least 1 hour"),
  title: z.string().min(1, "Title is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

// Statistics Interface (calculated, not stored)
export interface StudyStats {
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
  sessionsThisWeek: number;
  goalsCompleted: number;
}

export interface SubjectStats {
  subject: string;
  totalHours: number;
  sessionCount: number;
  averageSessionLength: number;
}

export interface TimePattern {
  hour: number;
  sessionCount: number;
}

export interface Insights {
  mostStudiedSubject: string;
  mostProductiveHour: number;
  averageSessionLength: number;
  studyPatterns: TimePattern[];
  subjectBreakdown: SubjectStats[];
}
