// server/index.js
import express3 from "express";

// server/routes.js
import express from "express";
import { createServer } from "http";
import multer from "multer";
import path2 from "path";
import os from "os";

// server/storage.js
import { randomUUID } from "crypto";
var MemStorage = class {
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.resumeAnalyses = /* @__PURE__ */ new Map();
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async createResumeAnalysis(insertAnalysis) {
    const id = randomUUID();
    const analysis = {
      ...insertAnalysis,
      id,
      jobDescription: insertAnalysis.jobDescription ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.resumeAnalyses.set(id, analysis);
    return analysis;
  }
  async getResumeAnalysis(id) {
    return this.resumeAnalyses.get(id);
  }
  async getRecentAnalyses(limit = 10) {
    const analyses = Array.from(this.resumeAnalyses.values());
    return analyses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
  }
};
var storage = new MemStorage();

// server/services/openai.js
import OpenAI from "openai";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "your-api-key-here"
});
async function analyzeResume(resumeText, jobDescription) {
  try {
    const systemPrompt = `You are an expert resume analyst and career coach with deep knowledge of ATS systems, hiring practices, and industry standards. Analyze the provided resume and provide comprehensive feedback.

Your analysis should include:
1. Overall score (0-100) based on ATS compatibility, content quality, and professional presentation
2. Detailed feedback for each category with scores and actionable suggestions
3. Specific improvements with before/after examples where applicable
4. Trending skills recommendations based on current job market demands

${jobDescription ? `Target Job Context: The candidate is applying for a role with this job description: ${jobDescription}. Tailor your analysis to this specific position.` : "Provide general professional analysis without specific job targeting."}

Respond with a JSON object matching this structure exactly:
{
  "overallScore": number (0-100),
  "feedback": {
    "grammar": {
      "score": number (0-100),
      "summary": "brief assessment",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "ats": {
      "score": number (0-100),
      "summary": "brief assessment",
      "missingKeywords": ["keyword1", "keyword2"],
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "formatting": {
      "score": number (0-100),
      "summary": "brief assessment", 
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "content": {
      "score": number (0-100),
      "summary": "brief assessment",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "skills": {
      "score": number (0-100),
      "summary": "brief assessment",
      "missingSkills": ["skill1", "skill2"],
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "experience": {
      "score": number (0-100),
      "summary": "brief assessment",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "improvements": [
      {
        "title": "improvement title",
        "description": "detailed description",
        "before": "current text (optional)",
        "after": "improved text (optional)",
        "category": "grammar|ats|formatting|content|skills|experience"
      }
    ],
    "trendingSkills": [
      {
        "skill": "skill name",
        "relevance": number (0-100),
        "category": "technical|soft"
      }
    ]
  }
}`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Please analyze this resume:

${resumeText}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    if (!result.overallScore || !result.feedback) {
      throw new Error("Invalid response structure from OpenAI");
    }
    return {
      overallScore: Math.max(0, Math.min(100, result.overallScore)),
      feedback: result.feedback
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to analyze resume: ${error.message}`);
  }
}

// server/services/fileProcessor.js
import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
async function extractTextFromFile(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  try {
    const buffer = await fs.readFile(filePath);
    switch (ext) {
      case ".pdf":
        const pdfParse = (await import("pdf-parse")).default;
        const pdfData = await pdfParse(buffer);
        return pdfData.text;
      case ".doc":
      case ".docx":
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      case ".txt":
        return buffer.toString("utf-8");
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  } catch (error) {
    throw new Error(`Failed to process file: ${error.message}`);
  } finally {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn(`Failed to clean up file ${filePath}:`, error);
    }
  }
}

// server/services/demoAnalysis.js
function createDemoAnalysis(resumeText) {
  const wordCount = resumeText.split(/\s+/).length;
  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(resumeText);
  const hasPhone = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(resumeText);
  const hasSkills = /skills?|technologies?|programming|software/i.test(resumeText);
  const hasExperience = /experience|work|job|position|company/i.test(resumeText);
  let baseScore = 60;
  if (wordCount > 200) baseScore += 10;
  if (wordCount > 400) baseScore += 5;
  if (hasEmail) baseScore += 5;
  if (hasPhone) baseScore += 5;
  if (hasSkills) baseScore += 10;
  if (hasExperience) baseScore += 5;
  const overallScore = Math.min(92, baseScore);
  const feedback = {
    grammar: {
      score: Math.min(95, baseScore + 10),
      summary: "Good grammar and writing style with room for minor improvements",
      suggestions: [
        "Consider using more action verbs to start bullet points",
        "Ensure consistent verb tenses throughout the document"
      ]
    },
    ats: {
      score: Math.min(88, baseScore + 5),
      summary: "Resume contains relevant keywords but could be optimized further",
      missingKeywords: ["project management", "data analysis", "team leadership"],
      suggestions: [
        "Include more industry-specific keywords",
        "Add technical skills section with relevant technologies"
      ]
    },
    formatting: {
      score: Math.min(90, baseScore + 8),
      summary: "Clean and professional formatting with good structure",
      suggestions: [
        "Consider using bullet points for better readability",
        "Ensure consistent spacing and alignment"
      ]
    },
    content: {
      score: Math.min(87, baseScore + 3),
      summary: "Strong content with quantifiable achievements",
      suggestions: [
        "Add more specific metrics and numbers to achievements",
        "Include relevant projects or portfolio items"
      ]
    },
    skills: {
      score: Math.min(85, baseScore),
      summary: "Good skills representation with room for expansion",
      missingSkills: ["Cloud Computing", "Machine Learning", "Agile Methodologies"],
      suggestions: [
        "Add trending technical skills relevant to your field",
        "Include both hard and soft skills"
      ]
    },
    experience: {
      score: Math.min(89, baseScore + 7),
      summary: "Well-documented experience with clear progression",
      suggestions: [
        "Use STAR method to describe achievements",
        "Quantify impact with specific numbers and metrics"
      ]
    },
    improvements: [
      {
        title: "Quantify Achievements",
        description: "Add specific numbers and metrics to demonstrate impact",
        before: "Improved team productivity",
        after: "Improved team productivity by 25% through process optimization",
        category: "content"
      },
      {
        title: "Add Technical Skills",
        description: "Include a dedicated technical skills section",
        category: "skills"
      },
      {
        title: "Optimize Keywords",
        description: "Include more industry-specific keywords for ATS compatibility",
        category: "ats"
      },
      {
        title: "Action Verbs",
        description: "Start bullet points with strong action verbs",
        before: "Was responsible for managing projects",
        after: "Managed cross-functional projects delivering results on time",
        category: "grammar"
      },
      {
        title: "Contact Information",
        description: "Ensure all contact information is current and professional",
        category: "formatting"
      }
    ],
    trendingSkills: [
      { skill: "Cloud Computing (AWS/Azure)", relevance: 92, category: "technical" },
      { skill: "Data Analysis", relevance: 88, category: "technical" },
      { skill: "Project Management", relevance: 85, category: "soft" },
      { skill: "Machine Learning", relevance: 82, category: "technical" },
      { skill: "Agile Methodologies", relevance: 80, category: "soft" },
      { skill: "Python Programming", relevance: 78, category: "technical" },
      { skill: "Leadership", relevance: 85, category: "soft" },
      { skill: "Communication", relevance: 90, category: "soft" }
    ]
  };
  return { overallScore, feedback };
}

// shared/schema.js
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var resumeAnalyses = pgTable("resume_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resumeText: text("resume_text").notNull(),
  jobDescription: text("job_description"),
  overallScore: integer("overall_score").notNull(),
  feedback: jsonb("feedback").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertResumeAnalysisSchema = createInsertSchema(resumeAnalyses).omit({
  id: true,
  createdAt: true
});
var resumeAnalysisRequestSchema = z.object({
  resumeText: z.string().min(50, "Resume text must be at least 50 characters"),
  jobDescription: z.string().optional()
});

// server/routes.js
import { z as z2 } from "zod";
var upload = multer({
  dest: os.tmpdir(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx", ".txt"];
    const ext = path2.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed."));
    }
  }
});
async function registerRoutes(app2) {
  app2.post("/api/upload-resume", upload.single("resume"), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          message: "No file uploaded"
        });
      }
      const resumeText = await extractTextFromFile(file.path, file.originalname);
      if (resumeText.length < 50) {
        return res.status(400).json({
          message: "Resume content is too short. Please ensure the file contains meaningful resume content."
        });
      }
      res.json({
        resumeText,
        fileName: file.originalname
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({
        message: error.message || "Failed to process uploaded file"
      });
    }
  });
  app2.post("/api/analyze-resume", async (req, res) => {
    try {
      const validatedData = resumeAnalysisRequestSchema.parse(req.body);
      let analysis;
      let isDemo = false;
      try {
        analysis = await analyzeResume(
          validatedData.resumeText,
          validatedData.jobDescription
        );
      } catch (aiError) {
        console.warn("OpenAI analysis failed, falling back to demo mode:", aiError.message);
        analysis = createDemoAnalysis(validatedData.resumeText);
        isDemo = true;
      }
      const storedAnalysis = await storage.createResumeAnalysis({
        resumeText: validatedData.resumeText,
        jobDescription: validatedData.jobDescription || null,
        overallScore: analysis.overallScore,
        feedback: analysis.feedback
      });
      res.json({
        id: storedAnalysis.id,
        overallScore: analysis.overallScore,
        feedback: analysis.feedback,
        createdAt: storedAnalysis.createdAt,
        isDemo
      });
    } catch (error) {
      console.error("Resume analysis error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: error.errors
        });
      }
      res.status(500).json({
        message: error.message || "Internal server error"
      });
    }
  });
  app2.get("/api/analysis/:id", async (req, res) => {
    try {
      const analysis = await storage.getResumeAnalysis(req.params.id);
      if (!analysis) {
        return res.status(404).json({
          message: "Analysis not found"
        });
      }
      res.json(analysis);
    } catch (error) {
      console.error("Get analysis error:", error);
      res.status(500).json({
        message: "Failed to retrieve analysis"
      });
    }
  });
  app2.get("/api/recent-analyses", async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      const analyses = await storage.getRecentAnalyses(limit);
      res.json(analyses);
    } catch (error) {
      console.error("Get recent analyses error:", error);
      res.status(500).json({
        message: "Failed to retrieve recent analyses"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.js
import express2 from "express";
import fs2 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.js
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.jsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.js
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "localhost", () => {
    log(`serving on port ${port}`);
  });
})();
