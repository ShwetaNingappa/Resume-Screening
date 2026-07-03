/**
 * Types for AI Resume Screening & ATS Analyzer
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface ProjectItem {
  title: string;
  technologies: string[];
  description: string;
  link?: string;
}

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: string[];
  achievements: string[];
  links: string[];
  languages: string[];
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  parsedData: ParsedResume;
  rawText: string;
  createdAt: string;
}

export interface SkillGapItem {
  skill: string;
  category: 'Critical' | 'Important' | 'Optional';
  type: 'technology' | 'framework' | 'tool' | 'certification';
}

export interface RoadmapMilestone {
  timeline: string;
  topic: string;
  actionItems: string[];
  resources: string[];
}

export interface BeforeAfterExample {
  before: string;
  after: string;
  explanation: string;
}

export interface ImprovementSuggestion {
  category: 'Formatting' | 'Keywords' | 'Impact' | 'Technical Depth';
  issue: string;
  suggestion: string;
  examples: BeforeAfterExample[];
}

export interface RewriteSection {
  original: string;
  rewritten: string;
  explanation: string;
}

export interface InterviewQuestion {
  question: string;
  category: 'HR' | 'Technical' | 'Project' | 'Role-Specific';
  idealAnswerOutline: string[];
}

export interface Analysis {
  id: string;
  resumeId: string;
  userId: string;
  targetRole: string;
  targetJobDescription?: string;
  atsScore: number;
  jobMatchScore: number;
  skillMatchPct: number;
  strengthScore: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
  readinessScore: 'High Readiness' | 'Moderate Readiness' | 'Low Readiness';
  readinessExplanation: string;
  matchedSkills: string[];
  missingSkills: SkillGapItem[];
  missingKeywords: string[];
  improvementSuggestions: ImprovementSuggestion[];
  learningRoadmap: RoadmapMilestone[];
  createdAt: string;
}

export interface CompareResult {
  resumeId: string;
  fileName: string;
  candidateName: string;
  atsScore: number;
  jobMatchScore: number;
  matchedSkillsCount: number;
  missingSkillsCount: number;
  strengthScore: string;
  rank: number;
  summary: string;
}

export interface ComparisonReport {
  id: string;
  userId: string;
  targetRole: string;
  targetJobDescription: string;
  resumes: CompareResult[];
  createdAt: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: string;
}

export interface AppStats {
  totalUsers: number;
  totalResumes: number;
  totalAnalyses: number;
  popularRoles: { role: string; count: number }[];
  averageAtsScore: number;
  apiUsageCount: number;
  errorCount: number;
}
