import fs from 'fs';
import path from 'path';
import { User, Resume, Analysis, ComparisonReport, SystemLog, AppStats } from '../types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  resumes: Resume[];
  analyses: Analysis[];
  comparisonReports: ComparisonReport[];
  logs: SystemLog[];
  settings: {
    theme: string;
    apiCalls: number;
  };
}

const DEFAULT_DB: DatabaseSchema = {
  users: [
    // Pre-seed an admin user and a test user
    {
      id: 'admin-id',
      email: 'shwetaningappa2004@gmail.com',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString()
    },
    {
      id: 'test-user-id',
      email: 'candidate@example.com',
      name: 'John Doe',
      role: 'user',
      createdAt: new Date().toISOString()
    }
  ],
  resumes: [],
  analyses: [],
  comparisonReports: [],
  logs: [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Database initialized successfully.'
    }
  ],
  settings: {
    theme: 'dark',
    apiCalls: 0
  }
};

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {
    this.ensureDbExists();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private ensureDbExists() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
    }
  }

  private readDb(): DatabaseSchema {
    try {
      this.ensureDbExists();
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading database file, resetting to default', e);
      return DEFAULT_DB;
    }
  }

  private writeDb(db: DatabaseSchema) {
    try {
      this.ensureDbExists();
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing to database file', e);
    }
  }

  // --- LOGGING ---
  public log(level: 'info' | 'warn' | 'error', message: string, details?: string) {
    const db = this.readDb();
    const newLog: SystemLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      details
    };
    db.logs.unshift(newLog);
    // Limit to 1000 logs
    if (db.logs.length > 1000) {
      db.logs = db.logs.slice(0, 1000);
    }
    this.writeDb(db);
  }

  public getLogs(): SystemLog[] {
    return this.readDb().logs;
  }

  // --- USERS ---
  public getUsers(): User[] {
    return this.readDb().users;
  }

  public getUserByEmail(email: string): User | undefined {
    const db = this.readDb();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    const db = this.readDb();
    return db.users.find(u => u.id === id);
  }

  public createUser(name: string, email: string, role: 'admin' | 'user' = 'user'): User {
    const db = this.readDb();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return existing;
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name,
      email,
      role,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    this.writeDb(db);
    this.log('info', `User registered: ${email} (${newUser.id})`);
    return newUser;
  }

  // --- RESUMES ---
  public getResumes(userId?: string): Resume[] {
    const db = this.readDb();
    if (userId) {
      return db.resumes.filter(r => r.userId === userId);
    }
    return db.resumes;
  }

  public getResumeById(id: string): Resume | undefined {
    return this.readDb().resumes.find(r => r.id === id);
  }

  public createResume(userId: string, fileName: string, fileType: string, parsedData: any, rawText: string): Resume {
    const db = this.readDb();
    const newResume: Resume = {
      id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId,
      fileName,
      fileType,
      parsedData,
      rawText,
      createdAt: new Date().toISOString()
    };
    db.resumes.push(newResume);
    this.writeDb(db);
    this.log('info', `Resume uploaded: ${fileName} by user ${userId}`);
    return newResume;
  }

  // --- ANALYSES ---
  public getAnalyses(userId?: string): Analysis[] {
    const db = this.readDb();
    if (userId) {
      return db.analyses.filter(a => a.userId === userId);
    }
    return db.analyses;
  }

  public getAnalysisById(id: string): Analysis | undefined {
    return this.readDb().analyses.find(a => a.id === id);
  }

  public createAnalysis(analysis: Omit<Analysis, 'id' | 'createdAt'>): Analysis {
    const db = this.readDb();
    const newAnalysis: Analysis = {
      ...analysis,
      id: `anl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString()
    };
    db.analyses.push(newAnalysis);
    this.writeDb(db);
    this.log('info', `Analysis completed for role ${analysis.targetRole} (Score: ${analysis.atsScore})`);
    return newAnalysis;
  }

  // --- COMPARISON REPORTS ---
  public getComparisonReports(userId?: string): ComparisonReport[] {
    const db = this.readDb();
    if (userId) {
      return db.comparisonReports.filter(c => c.userId === userId);
    }
    return db.comparisonReports;
  }

  public getComparisonReportById(id: string): ComparisonReport | undefined {
    return this.readDb().comparisonReports.find(c => c.id === id);
  }

  public createComparisonReport(report: Omit<ComparisonReport, 'id' | 'createdAt'>): ComparisonReport {
    const db = this.readDb();
    const newReport: ComparisonReport = {
      ...report,
      id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString()
    };
    db.comparisonReports.push(newReport);
    this.writeDb(db);
    this.log('info', `Comparison report created for role ${report.targetRole} with ${report.resumes.length} resumes`);
    return newReport;
  }

  // --- STATS ---
  public incrementApiCount() {
    const db = this.readDb();
    db.settings.apiCalls = (db.settings.apiCalls || 0) + 1;
    this.writeDb(db);
  }

  public getStats(): AppStats {
    const db = this.readDb();
    
    // Calculate popular roles
    const roleCounts: Record<string, number> = {};
    db.analyses.forEach(a => {
      roleCounts[a.targetRole] = (roleCounts[a.targetRole] || 0) + 1;
    });
    const popularRoles = Object.entries(roleCounts)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate average ATS score
    const totalAts = db.analyses.reduce((sum, a) => sum + a.atsScore, 0);
    const averageAtsScore = db.analyses.length > 0 ? Math.round(totalAts / db.analyses.length) : 0;

    // Calculate errors count from logs
    const errorCount = db.logs.filter(l => l.level === 'error').length;

    return {
      totalUsers: db.users.length,
      totalResumes: db.resumes.length,
      totalAnalyses: db.analyses.length,
      popularRoles,
      averageAtsScore,
      apiUsageCount: db.settings.apiCalls || 0,
      errorCount
    };
  }

  // --- SEED OR RESET ---
  public resetDatabase() {
    this.writeDb(DEFAULT_DB);
    this.log('info', 'Database reset successfully.');
  }
}
