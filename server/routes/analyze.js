import express from "express";
import multer from "multer";
import { analyzeResume } from "../lib/ai-service.js";
import { extractTextFromPDF } from "../lib/pdf-parser.js";
import { validateResumeData } from "../lib/validation.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text files are allowed'));
    }
  }
});

// POST /api/analyze/resume
router.post("/resume", upload.single('resume'), async (req, res) => {
  try {
    let resumeText = '';
    
    if (req.file) {
      // Handle file upload
      if (req.file.mimetype === 'application/pdf') {
        resumeText = await extractTextFromPDF(req.file.path);
      } else {
        const fs = await import('fs');
        resumeText = fs.readFileSync(req.file.path, 'utf-8');
      }
    } else if (req.body.text) {
      // Handle direct text input
      resumeText = req.body.text;
    } else {
      return res.status(400).json({
        success: false,
        error: "No resume content provided"
      });
    }

    // Validate input
    const validation = validateResumeData(resumeText);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Get job description if provided
    const jobDescription = req.body.jobDescription || '';

    // Analyze the resume
    const analysis = await analyzeResume(resumeText, jobDescription);

    // Clean up uploaded file
    if (req.file) {
      const fs = await import('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.warn('Could not delete temporary file:', err);
      }
    }

    res.json({
      success: true,
      data: {
        id: Date.now().toString(),
        overallScore: analysis.overallScore,
        feedback: analysis.feedback,
        createdAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Resume analysis error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      const fs = await import('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupErr) {
        console.warn('Could not delete temporary file on error:', cleanupErr);
      }
    }

    res.status(500).json({
      success: false,
      error: "Failed to analyze resume. Please try again."
    });
  }
});

// GET /api/analyze/health
router.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    service: "Resume Analysis API",
    timestamp: new Date().toISOString()
  });
});

export default router;