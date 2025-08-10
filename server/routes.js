import express from "express";
import { createServer } from "http";
import multer from "multer";
import path from "path";
import os from "os";
import { storage } from "./storage.js";
import { analyzeResume } from "./services/openai.js";
import { extractTextFromFile } from "./services/fileProcessor.js";
import { createDemoAnalysis } from "./services/demoAnalysis.js";
import { resumeAnalysisRequestSchema } from "../shared/schema.js";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  dest: os.tmpdir(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

export async function registerRoutes(app) {
  // File upload endpoint
  app.post("/api/upload-resume", upload.single('resume'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          message: "No file uploaded"
        });
      }

      // Extract text from uploaded file
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

  // Resume analysis endpoint (with fallback to demo)
  app.post("/api/analyze-resume", async (req, res) => {
    try {
      // Validate request body
      const validatedData = resumeAnalysisRequestSchema.parse(req.body);
      
      let analysis;
      let isDemo = false;
      
      try {
        // Try OpenAI analysis first
        analysis = await analyzeResume(
          validatedData.resumeText,
          validatedData.jobDescription
        );
      } catch (aiError) {
        console.warn("OpenAI analysis failed, falling back to demo mode:", aiError.message);
        
        // Fallback to demo analysis
        analysis = createDemoAnalysis(validatedData.resumeText);
        isDemo = true;
      }
      
      // Store analysis result
      const storedAnalysis = await storage.createResumeAnalysis({
        resumeText: validatedData.resumeText,
        jobDescription: validatedData.jobDescription || null,
        overallScore: analysis.overallScore,
        feedback: analysis.feedback,
      });
      
      res.json({
        id: storedAnalysis.id,
        overallScore: analysis.overallScore,
        feedback: analysis.feedback,
        createdAt: storedAnalysis.createdAt,
        isDemo: isDemo
      });
    } catch (error) {
      console.error("Resume analysis error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: error.errors,
        });
      }
      
      res.status(500).json({
        message: error.message || "Internal server error",
      });
    }
  });
  
  // Get analysis by ID
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const analysis = await storage.getResumeAnalysis(req.params.id);
      
      if (!analysis) {
        return res.status(404).json({
          message: "Analysis not found",
        });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error("Get analysis error:", error);
      res.status(500).json({
        message: "Failed to retrieve analysis",
      });
    }
  });
  
  // Get recent analyses
  app.get("/api/recent-analyses", async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      const analyses = await storage.getRecentAnalyses(limit);
      
      res.json(analyses);
    } catch (error) {
      console.error("Get recent analyses error:", error);
      res.status(500).json({
        message: "Failed to retrieve recent analyses",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}