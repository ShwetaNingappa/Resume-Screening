import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import { DatabaseService } from "./src/db/db-service";
import {
  parseResumeWithGemini,
  analyzeResumeWithGemini,
  rewriteResumeSection,
  generateCoverLetter,
  generateInterviewQuestions,
  compareResumesWithGemini
} from "./src/lib/gemini";

const dbService = DatabaseService.getInstance();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Helper middleware for logging requests
  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
  });

  // --- API ROUTES ---

  // Auth: Register
  app.post("/api/auth/register", (req, res) => {
    const { name, email, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    try {
      const user = dbService.createUser(name, email, role || "user");
      res.json(user);
    } catch (error: any) {
      dbService.log("error", `Registration failed: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  // Auth: Login
  app.post("/api/auth/login", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    try {
      const user = dbService.getUserByEmail(email);
      if (!user) {
        // If not found, let's auto-register to keep user experience seamless
        const name = email.split('@')[0];
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        const autoUser = dbService.createUser(formattedName, email, "user");
        return res.json(autoUser);
      }
      res.json(user);
    } catch (error: any) {
      dbService.log("error", `Login failed: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  // Auth: Me
  app.get("/api/auth/me", (req, res) => {
    const email = req.headers["x-user-email"] as string;
    if (!email) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const user = dbService.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Resume Upload & Parse
  app.post("/api/resumes/upload", async (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const { fileName, fileType, rawText, base64Data } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "User unauthorized" });
    }
    if (!fileName || (!rawText && !base64Data)) {
      return res.status(400).json({ error: "File name and content are required" });
    }

    try {
      dbService.log("info", `Parsing resume: ${fileName} for user ${userId}`);
      const parsedData = await parseResumeWithGemini(rawText || "", fileType, base64Data);
      const resume = dbService.createResume(userId, fileName, fileType || "text/plain", parsedData, rawText || "");
      res.json(resume);
    } catch (error: any) {
      dbService.log("error", `Resume upload/parse failed: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  // Get Resumes
  app.get("/api/resumes", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const resumes = dbService.getResumes(userId);
      res.json(resumes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single resume details
  app.get("/api/resumes/:id", (req, res) => {
    try {
      const resume = dbService.getResumeById(req.params.id);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }
      res.json(resume);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create Analysis
  app.post("/api/resumes/analyze", async (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const { resumeId, targetRole, jobDescription } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!resumeId || !targetRole) {
      return res.status(400).json({ error: "Resume ID and target role are required" });
    }

    try {
      const resume = dbService.getResumeById(resumeId);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }

      dbService.log("info", `Starting ATS analysis for resume ${resumeId} on target role: ${targetRole}`);
      const analysisData = await analyzeResumeWithGemini(resume.parsedData, targetRole, jobDescription);
      
      const analysis = dbService.createAnalysis({
        ...analysisData,
        resumeId,
        userId
      });

      res.json(analysis);
    } catch (error: any) {
      dbService.log("error", `Analysis failed: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  // Get Analyses
  app.get("/api/analyses", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const analyses = dbService.getAnalyses(userId);
      res.json(analyses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single Analysis
  app.get("/api/analyses/:id", (req, res) => {
    try {
      const analysis = dbService.getAnalysisById(req.params.id);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis report not found" });
      }
      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Compare/Rank Resumes
  app.post("/api/resumes/compare", async (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    const { resumeIds, targetRole, jobDescription } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!resumeIds || !Array.isArray(resumeIds) || resumeIds.length === 0 || !targetRole || !jobDescription) {
      return res.status(400).json({ error: "resumeIds, targetRole, and jobDescription are required" });
    }

    try {
      const resumesToCompare = resumeIds.map(id => {
        const r = dbService.getResumeById(id);
        if (!r) throw new Error(`Resume with ID ${id} not found`);
        return {
          id: r.id,
          fileName: r.fileName,
          parsedData: r.parsedData
        };
      });

      dbService.log("info", `Comparing ${resumesToCompare.length} resumes for role: ${targetRole}`);
      const rankedResults = await compareResumesWithGemini(resumesToCompare, targetRole, jobDescription);
      
      const report = dbService.createComparisonReport({
        userId,
        targetRole,
        targetJobDescription: jobDescription,
        resumes: rankedResults
      });

      res.json(report);
    } catch (error: any) {
      dbService.log("error", `Resume comparison failed: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  // Get comparison reports
  app.get("/api/comparison-reports", (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const reports = dbService.getComparisonReports(userId);
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/comparison-reports/:id", (req, res) => {
    try {
      const report = dbService.getComparisonReportById(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Comparison report not found" });
      }
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Resume Rewriter
  app.post("/api/resumes/rewrite", async (req, res) => {
    const { sectionType, originalText, targetRole, jobDescription } = req.body;
    if (!sectionType || !originalText || !targetRole) {
      return res.status(400).json({ error: "sectionType, originalText, and targetRole are required" });
    }
    try {
      const rewritten = await rewriteResumeSection({ sectionType, originalText, targetRole, jobDescription });
      res.json(rewritten);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Cover Letter Generator
  app.post("/api/cover-letter/generate", async (req, res) => {
    const { resumeId, targetRole, jobDescription } = req.body;
    if (!resumeId || !targetRole) {
      return res.status(400).json({ error: "resumeId and targetRole are required" });
    }
    try {
      const resume = dbService.getResumeById(resumeId);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }
      const coverLetter = await generateCoverLetter(resume.parsedData, targetRole, jobDescription);
      res.json(coverLetter);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Interview Questions Generator
  app.post("/api/interview-prep/generate", async (req, res) => {
    const { resumeId, targetRole, jobDescription } = req.body;
    if (!resumeId || !targetRole) {
      return res.status(400).json({ error: "resumeId and targetRole are required" });
    }
    try {
      const resume = dbService.getResumeById(resumeId);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }
      const questions = await generateInterviewQuestions(resume.parsedData, targetRole, jobDescription);
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Analytics & Stats
  app.get("/api/admin/stats", (req, res) => {
    const role = req.headers["x-user-role"] as string;
    if (role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access only" });
    }
    try {
      const stats = dbService.getStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: System Logs
  app.get("/api/admin/logs", (req, res) => {
    const role = req.headers["x-user-role"] as string;
    if (role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access only" });
    }
    try {
      const logs = dbService.getLogs();
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: User list
  app.get("/api/admin/users", (req, res) => {
    const role = req.headers["x-user-role"] as string;
    if (role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access only" });
    }
    try {
      const users = dbService.getUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Reset database
  app.post("/api/admin/reset", (req, res) => {
    const role = req.headers["x-user-role"] as string;
    if (role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access only" });
    }
    try {
      dbService.resetDatabase();
      res.json({ message: "Database reset to factory defaults." });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- VITE DEV OR PRODUCTION ASSETS SERVING ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`Mounted production static file serving on ${distPath}`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express full-stack server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical server startup crash:", error);
});
