import { randomUUID } from "crypto";

export class MemStorage {
  constructor() {
    this.users = new Map();
    this.resumeAnalyses = new Map();
  }

  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
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
      createdAt: new Date(),
    };
    this.resumeAnalyses.set(id, analysis);
    return analysis;
  }

  async getResumeAnalysis(id) {
    return this.resumeAnalyses.get(id);
  }

  async getRecentAnalyses(limit = 10) {
    const analyses = Array.from(this.resumeAnalyses.values());
    return analyses
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();