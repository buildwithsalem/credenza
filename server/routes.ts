import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema, insertGoalSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session Routes
  app.get("/api/sessions", async (_req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/recent", async (_req, res) => {
    try {
      const sessions = await storage.getRecentSessions(5);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent sessions" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const result = insertSessionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: fromZodError(result.error).message,
        });
      }

      const session = await storage.createSession(result.data);
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Goal Routes
  app.get("/api/goals", async (_req, res) => {
    try {
      const goals = await storage.getAllGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.get("/api/goals/active", async (_req, res) => {
    try {
      const goals = await storage.getActiveGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const result = insertGoalSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: fromZodError(result.error).message,
        });
      }

      const goal = await storage.createGoal(result.data);
      res.status(201).json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to create goal" });
    }
  });

  // Statistics Routes
  app.get("/api/statistics", async (_req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Insights Routes
  app.get("/api/insights", async (_req, res) => {
    try {
      const insights = await storage.getInsights();
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
