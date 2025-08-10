import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const resumeAnalyses = pgTable("resume_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resumeText: text("resume_text").notNull(),
  jobDescription: text("job_description"),
  overallScore: integer("overall_score").notNull(),
  feedback: jsonb("feedback").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertResumeAnalysisSchema = createInsertSchema(resumeAnalyses).omit({
  id: true,
  createdAt: true,
});

export const resumeAnalysisRequestSchema = z.object({
  resumeText: z.string().min(50, "Resume text must be at least 50 characters"),
  jobDescription: z.string().optional(),
});

// JavaScript doesn't have TypeScript types, but we can export the schemas for validation
// These would be used with zod for runtime validation:
// export type InsertUser = z.infer<typeof insertUserSchema>;
// export type User = typeof users.$inferSelect;
// export type InsertResumeAnalysis = z.infer<typeof insertResumeAnalysisSchema>;
// export type ResumeAnalysis = typeof resumeAnalyses.$inferSelect;
// export type ResumeAnalysisRequest = z.infer<typeof resumeAnalysisRequestSchema>;

// AI Analysis response structure - converted from interface to JSDoc comments
// This structure is used for the AnalysisFeedback object:
/* 
AnalysisFeedback structure:
{
  grammar: {
    score: number;
    summary: string;
    suggestions: string[];
  };
  ats: {
    score: number;
    summary: string;
    missingKeywords: string[];
    suggestions: string[];
  };
  formatting: {
    score: number;
    summary: string;
    suggestions: string[];
  };
  content: {
    score: number;
    summary: string;
    suggestions: string[];
  };
  skills: {
    score: number;
    summary: string;
    missingSkills: string[];
    suggestions: string[];
  };
  experience: {
    score: number;
    summary: string;
    suggestions: string[];
  };
  improvements: Array<{
    title: string;
    description: string;
    before?: string;
    after?: string;
    category: string;
  }>;
  trendingSkills: Array<{
    skill: string;
    relevance: number;
    category: 'technical' | 'soft';
  }>;
}
*/