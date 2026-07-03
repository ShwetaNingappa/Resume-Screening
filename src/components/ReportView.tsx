import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FileText, Award, Calendar, ExternalLink, Mail, Phone, Code, Sparkles, AlertCircle, CheckCircle2,
  XCircle, ArrowRight, BookOpen, RefreshCw, Copy, Check, Download, BrainCircuit, UserCheck, MessageSquare,
  HelpCircle, ChevronRight, Play, Edit3
} from "lucide-react";
import { Analysis, Resume, InterviewQuestion } from "../types";

interface ReportViewProps {
  analysis: Analysis;
  resumes: Resume[];
  onBackToDashboard: () => void;
}

export default function ReportView({ analysis, resumes, onBackToDashboard }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'improvements' | 'roadmap' | 'rewriter' | 'coverletter' | 'interview'>('summary');
  
  // Associated resume details
  const associatedResume = resumes.find(r => r.id === analysis.resumeId);
  const candidate = associatedResume?.parsedData;

  // State for rewriter tab
  const [rewriteSection, setRewriteSection] = useState<'summary' | 'experience' | 'projects' | 'skills'>('experience');
  const [originalText, setOriginalText] = useState("");
  const [rewrittenText, setRewrittenText] = useState("");
  const [rewriteExplanation, setRewriteExplanation] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);

  // State for cover letter tab
  const [coverLetter, setCoverLetter] = useState("");
  const [coverLetterTips, setCoverLetterTips] = useState<string[]>([]);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [isCopiedLetter, setIsCopiedLetter] = useState(false);

  // State for interview tab
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(null);

  // General text copying state
  const [copiedTextType, setCopiedTextType] = useState<string | null>(null);

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextType(type);
    setTimeout(() => setCopiedTextType(null), 2000);
  };

  // Trigger AI rewrite on server
  const triggerRewrite = async () => {
    if (!originalText.trim()) return;
    setIsRewriting(true);
    setRewrittenText("");
    setRewriteExplanation("");

    try {
      const res = await fetch("/api/resumes/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionType: rewriteSection,
          originalText,
          targetRole: analysis.targetRole,
          jobDescription: analysis.targetJobDescription
        })
      });

      if (!res.ok) throw new Error("Failed to rewrite resume text.");
      const data = await res.json();
      setRewrittenText(data.rewrittenText);
      setRewriteExplanation(data.explanation);
    } catch (e: any) {
      console.error(e);
      setRewrittenText("Error occurred. Please check network and retry.");
    } finally {
      setIsRewriting(false);
    }
  };

  // Trigger Cover Letter generation
  const triggerCoverLetterGeneration = async () => {
    setIsGeneratingCoverLetter(true);
    try {
      const res = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: analysis.resumeId,
          targetRole: analysis.targetRole,
          jobDescription: analysis.targetJobDescription
        })
      });

      if (!res.ok) throw new Error("Failed to generate cover letter.");
      const data = await res.json();
      setCoverLetter(data.coverLetter);
      setCoverLetterTips(data.tips);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  // Trigger Interview Questions generation
  const triggerInterviewQuestionsGeneration = async () => {
    setIsGeneratingQuestions(true);
    try {
      const res = await fetch("/api/interview-prep/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: analysis.resumeId,
          targetRole: analysis.targetRole,
          jobDescription: analysis.targetJobDescription
        })
      });

      if (!res.ok) throw new Error("Failed to generate interview questions.");
      const data = await res.json();
      setInterviewQuestions(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:bg-white print:text-black">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-200 print:border-slate-300">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="text-xs font-mono bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded border border-indigo-100 print:border print:border-black print:text-black">
              ATS COMPLIANCE SCREENING REPORT
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 print:text-black">
            Target Role: {analysis.targetRole}
          </h1>
          <p className="text-sm text-slate-500 print:text-slate-600">
            Candidate: <span className="text-slate-800 font-semibold print:text-black">{candidate?.name || 'Parsed Candidate'}</span> • Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <button
            id="btn-report-back"
            onClick={onBackToDashboard}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-sm font-semibold transition shadow-xs"
          >
            Back to Dashboard
          </button>
          <button
            id="btn-report-print"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/10 transition"
          >
            <Download className="h-4 w-4" />
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Candidate Contact Card */}
      {candidate && (
        <div className="glass-panel p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-slate-600 print:border-slate-300 print:text-black">
          <div className="flex items-center gap-2.5">
            <Mail className="h-4 w-4 text-indigo-600 shrink-0 print:text-black" />
            <span className="truncate">{candidate.email || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="h-4 w-4 text-indigo-600 shrink-0 print:text-black" />
            <span>{candidate.phone || "N/A"}</span>
          </div>
          {candidate.links && candidate.links.length > 0 && (
            <div className="flex items-center gap-2.5 sm:col-span-2">
              <ExternalLink className="h-4 w-4 text-indigo-600 shrink-0 print:text-black" />
              <span className="truncate">{candidate.links[0]}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Score Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Gauges card */}
        <div className="md:col-span-2 glass-panel p-6 flex flex-col justify-between print:border-slate-300">
          <h2 className="font-display font-semibold text-slate-800 text-md mb-6 print:text-black">Compatibility Analytics</h2>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            {/* ATS SCORE */}
            <div className="space-y-3">
              <div className="relative inline-flex items-center justify-center">
                {/* SVG circular gauge */}
                <svg className="w-24 h-24">
                  <circle className="text-slate-100" strokeWidth="6" stroke="currentColor" fill="transparent" r="38" cx="48" cy="48" />
                  <circle className="text-indigo-600" strokeWidth="6" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * (1 - analysis.atsScore / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="38" cx="48" cy="48" />
                </svg>
                <span className="absolute text-xl font-bold text-slate-900 print:text-black font-display">{analysis.atsScore}%</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-700 print:text-black">ATS Score</span>
                <span className="text-[10px] text-slate-500">Formatting & keywords</span>
              </div>
            </div>

            {/* JOB MATCH */}
            <div className="space-y-3">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24">
                  <circle className="text-slate-100" strokeWidth="6" stroke="currentColor" fill="transparent" r="38" cx="48" cy="48" />
                  <circle className="text-purple-600" strokeWidth="6" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * (1 - analysis.jobMatchScore / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="38" cx="48" cy="48" />
                </svg>
                <span className="absolute text-xl font-bold text-slate-900 print:text-black font-display">{analysis.jobMatchScore}%</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-700 print:text-black">Job Match</span>
                <span className="text-[10px] text-slate-500">Experience matching</span>
              </div>
            </div>

            {/* SKILLS MATCH */}
            <div className="space-y-3">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24">
                  <circle className="text-slate-100" strokeWidth="6" stroke="currentColor" fill="transparent" r="38" cx="48" cy="48" />
                  <circle className="text-emerald-600" strokeWidth="6" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * (1 - analysis.skillMatchPct / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="38" cx="48" cy="48" />
                </svg>
                <span className="absolute text-xl font-bold text-slate-900 print:text-black font-display">{analysis.skillMatchPct}%</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-700 print:text-black">Skills Match</span>
                <span className="text-[10px] text-slate-500">Tech & soft skills overlap</span>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Metrics card */}
        <div className="glass-panel p-6 flex flex-col justify-between space-y-4 print:border-slate-300">
          <div>
            <h2 className="font-display font-semibold text-slate-800 text-md mb-4 print:text-black">Qualitative Evaluation</h2>
            
            <div className="space-y-4">
              {/* Strength score */}
              <div>
                <span className="text-[10px] font-mono text-slate-500 block mb-1">RESUME STRENGTH</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-bold px-2 py-0.5 rounded border ${
                    analysis.strengthScore === 'Excellent' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                    analysis.strengthScore === 'Good' ? 'bg-blue-50 text-blue-700 border-blue-150' :
                    analysis.strengthScore === 'Average' ? 'bg-amber-50 text-amber-700 border-amber-150' :
                    'bg-rose-50 text-rose-700 border-rose-150'
                  }`}>
                    {analysis.strengthScore}
                  </span>
                </div>
              </div>

              {/* Interview readiness */}
              <div>
                <span className="text-[10px] font-mono text-slate-500 block mb-1">INTERVIEW READINESS</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-bold px-2 py-0.5 rounded border ${
                    analysis.readinessScore === 'High Readiness' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                    analysis.readinessScore === 'Moderate Readiness' ? 'bg-blue-50 text-blue-700 border-blue-150' :
                    'bg-rose-50 text-rose-700 border-rose-150'
                  }`}>
                    {analysis.readinessScore}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] leading-relaxed text-slate-600 bg-slate-50 border border-slate-200 p-3.5 rounded-xl print:border-slate-300 print:text-slate-700 font-sans">
            <span className="font-bold text-slate-800 block mb-1">Readiness Justification:</span>
            {analysis.readinessExplanation}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 print:hidden overflow-x-auto gap-2">
        <button
          id="tab-report-summary"
          onClick={() => setActiveTab('summary')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition px-4 whitespace-nowrap ${
            activeTab === 'summary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Analysis Summary
        </button>
        <button
          id="tab-report-improvements"
          onClick={() => setActiveTab('improvements')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition px-4 whitespace-nowrap ${
            activeTab === 'improvements' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          ATS Suggestions
        </button>
        <button
          id="tab-report-roadmap"
          onClick={() => setActiveTab('roadmap')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition px-4 whitespace-nowrap ${
            activeTab === 'roadmap' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Learning Roadmap
        </button>
        <button
          id="tab-report-rewriter"
          onClick={() => setActiveTab('rewriter')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition px-4 whitespace-nowrap ${
            activeTab === 'rewriter' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          AI Resume Rewriter
        </button>
        <button
          id="tab-report-coverletter"
          onClick={() => setActiveTab('coverletter')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition px-4 whitespace-nowrap ${
            activeTab === 'coverletter' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          AI Cover Letter
        </button>
        <button
          id="tab-report-interview"
          onClick={() => setActiveTab('interview')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition px-4 whitespace-nowrap ${
            activeTab === 'interview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Interview Prep
        </button>
      </div>

      {/* TAB CONTENT PANEL */}
      <div className="min-h-[250px] print:block">
        
        {/* SUMMARY TAB */}
        {(activeTab === 'summary' || window.matchMedia('print').matches) && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Matched vs Missing Skills */}
              <div className="glass-panel p-6 space-y-4 print:border-slate-300">
                <h3 className="font-display font-semibold text-slate-800 text-md border-b border-slate-150 pb-2 print:text-black">
                  Skills Cross-Referencing
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Matched */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> MATCHED SKILLS
                    </span>
                    {analysis.matchedSkills.length === 0 ? (
                      <p className="text-xs text-slate-500">No matching skills identified.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.matchedSkills.map(skill => (
                          <span key={skill} className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-mono">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Missing */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-rose-600 font-bold flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" /> MISSING SKILLS
                    </span>
                    {analysis.missingSkills.length === 0 ? (
                      <p className="text-xs text-emerald-600 font-semibold">Perfect overlap! No missing skills.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.missingSkills.map(gap => (
                          <span key={gap.skill} className="text-[11px] bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded font-mono">
                            {gap.skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills Gap Analysis */}
              <div className="glass-panel p-6 space-y-4 print:border-slate-300">
                <h3 className="font-display font-semibold text-slate-800 text-md border-b border-slate-150 pb-2 print:text-black">
                  Skill Gap Categorization
                </h3>

                {analysis.missingSkills.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">All core requirements met!</p>
                ) : (
                  <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                    {analysis.missingSkills.map(gap => (
                      <div key={gap.skill} className="flex items-center justify-between text-xs p-2 bg-slate-50 border border-slate-200 rounded">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-700 font-semibold">{gap.skill}</span>
                          <span className="text-[9px] uppercase font-mono px-1 border border-slate-200 text-slate-500 rounded">
                            {gap.type}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          gap.category === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-150' :
                          gap.category === 'Important' ? 'bg-amber-50 text-amber-700 border-amber-150' :
                          'bg-blue-50 text-blue-700 border-blue-150'
                        }`}>
                          {gap.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Missing Keywords list */}
            {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
              <div className="glass-panel p-6 space-y-3 print:border-slate-300">
                <h3 className="font-display font-semibold text-slate-800 text-md print:text-black">Missing ATS Keywords & Industry Terms</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ATS scanners perform keyword matching against specific terminology. Including these exact terms in your resume descriptions boosts your score.
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map(keyword => (
                    <span key={keyword} className="text-xs font-mono bg-indigo-50 text-indigo-700 border border-indigo-150 px-2.5 py-1 rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* IMPROVEMENTS SUGGESTIONS TAB */}
        {activeTab === 'improvements' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-800">Resume Presentation & Quality Tips</h3>
                <p className="text-xs text-slate-500">Optimize formatting, metrics, and technical depth for screening compliance.</p>
              </div>
            </div>

            <div className="space-y-4">
              {analysis.improvementSuggestions.map((suggestion, idx) => (
                <div key={idx} className="glass-panel p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-600 font-bold block uppercase mb-1">{suggestion.category} ISSUE</span>
                      <h4 className="font-semibold text-slate-900 text-md">{suggestion.issue}</h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 p-3.5 rounded">
                    <span className="font-bold text-slate-800 block mb-0.5">Suggestion:</span>
                    {suggestion.suggestion}
                  </p>

                  {suggestion.examples && suggestion.examples.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-lg text-xs">
                        <span className="font-bold text-rose-600 block mb-1">❌ BEFORE STATEMENT:</span>
                        <p className="text-slate-600 italic">"{suggestion.examples[0].before}"</p>
                      </div>
                      <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs">
                        <span className="font-bold text-emerald-600 block mb-1">✓ ATS-OPTIMIZED STATEMENT:</span>
                        <p className="text-slate-800 font-sans">"{suggestion.examples[0].after}"</p>
                        <span className="block mt-2 text-[10px] text-slate-500 font-mono">
                          Why: {suggestion.examples[0].explanation}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEARNING ROADMAP TAB */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">4-Month Technical Learning Roadmap</h3>
              <p className="text-xs text-slate-500">Accelerated milestone path to cover your critical and important skills gaps.</p>
            </div>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
              {analysis.learningRoadmap.map((milestone, idx) => (
                <div key={idx} className="relative pl-8 space-y-2">
                  {/* Timeline dot */}
                  <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-4 border-white shadow-md shadow-indigo-600/20 z-10" />
                  
                  <div className="glass-panel p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-xs font-mono font-bold text-indigo-600">{milestone.timeline}</span>
                      <h4 className="font-semibold text-slate-900 font-display text-sm md:text-md">{milestone.topic}</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Action items */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-slate-500 block">ACTION TASKS</span>
                        <ul className="space-y-1">
                          {milestone.actionItems.map((item, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5 font-sans">
                              <span className="text-indigo-600 shrink-0 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Resources */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-slate-500 block">RESOURCES / SUGGESTED TOPICS</span>
                        <div className="flex flex-wrap gap-1.5">
                          {milestone.resources.map((res, i) => (
                            <span key={i} className="text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded">
                              {res}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI RESUME REWRITER TAB */}
        {activeTab === 'rewriter' && (
          <div className="glass-panel p-6 space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-indigo-600" />
                AI Resume Rewriter
              </h3>
              <p className="text-xs text-slate-500">Rewrite resume paragraphs or bullets into highly readable, metrics-driven, ATS-compliant blocks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input column */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-500">SELECT SECTION</label>
                  <div className="flex gap-2">
                    {(['summary', 'experience', 'projects', 'skills'] as const).map(sec => (
                      <button
                        key={sec}
                        onClick={() => setRewriteSection(sec)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-semibold capitalize transition ${
                          rewriteSection === sec
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
                        }`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-500">ORIGINAL RESUME TEXT</label>
                  <textarea
                    rows={8}
                    placeholder="Paste a bullet point or description here (e.g., 'Responsible for writing code and deploying the server...')"
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl p-3.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-sans leading-relaxed"
                  />
                </div>

                <button
                  id="btn-trigger-rewrite"
                  onClick={triggerRewrite}
                  disabled={isRewriting || !originalText.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 text-white font-semibold rounded-xl text-sm transition"
                >
                  {isRewriting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Rewriting section...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Optimize Section with AI
                    </>
                  )}
                </button>
              </div>

              {/* Output column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-500">ATS-OPTIMIZED REWRITE</label>
                  {rewrittenText && (
                    <button
                      id="btn-copy-rewritten"
                      onClick={() => handleCopyText(rewrittenText, 'rewritten')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-1 transition"
                    >
                      {copiedTextType === 'rewritten' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedTextType === 'rewritten' ? 'Copied' : 'Copy Section'}
                    </button>
                  )}
                </div>

                <div className="w-full min-h-[180px] bg-white border border-slate-200 shadow-xs rounded-xl p-4 text-xs leading-relaxed overflow-y-auto">
                  {isRewriting ? (
                    <div className="space-y-2 animate-pulse py-4 text-slate-400">
                      <div className="h-2 bg-slate-100 rounded w-full" />
                      <div className="h-2 bg-slate-100 rounded w-5/6" />
                      <div className="h-2 bg-slate-100 rounded w-2/3" />
                    </div>
                  ) : rewrittenText ? (
                    <p className="text-slate-800 font-sans whitespace-pre-wrap">{rewrittenText}</p>
                  ) : (
                    <p className="text-slate-400 italic font-sans py-4 text-center">Optimized result will display here.</p>
                  )}
                </div>

                {rewriteExplanation && (
                  <div className="p-3.5 bg-indigo-50 border border-indigo-100 text-[10px] leading-relaxed text-slate-600 rounded-xl font-sans">
                    <span className="font-bold text-indigo-600 block mb-1">AI STRATEGY:</span>
                    {rewriteExplanation}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* COV LETTER TAB */}
        {activeTab === 'coverletter' && (
          <div className="glass-panel p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-indigo-600" />
                  AI Professional Cover Letter
                </h3>
                <p className="text-xs text-slate-500">Generate a tailored, high-converting cover letter mapping your skills to this role.</p>
              </div>

              {!coverLetter && !isGeneratingCoverLetter && (
                <button
                  id="btn-trigger-cover"
                  onClick={triggerCoverLetterGeneration}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Generate Cover Letter
                </button>
              )}
            </div>

            {isGeneratingCoverLetter ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Structuring persuasive narrative paragraphs...</p>
              </div>
            ) : coverLetter ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">GENERATED TEXT</span>
                    <button
                      id="btn-copy-cover"
                      onClick={() => handleCopyText(coverLetter, 'cover')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-1 transition"
                    >
                      {copiedTextType === 'cover' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedTextType === 'cover' ? 'Copied' : 'Copy to Clipboard'}
                    </button>
                  </div>
                  <textarea
                    rows={18}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl p-4 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-sans leading-relaxed shadow-xs"
                  />
                </div>

                <div className="space-y-4">
                  <span className="text-xs font-mono text-slate-500 block">AI COVER LETTER TIPS</span>
                  <div className="glass-panel p-4 space-y-3 bg-slate-50/50 border-slate-200">
                    {coverLetterTips.map((tip, idx) => (
                      <div key={idx} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed font-sans">
                        <span className="text-indigo-600 font-bold shrink-0 mt-0.5">•</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-slate-200 bg-slate-50/30 rounded-xl">
                <p className="text-xs text-slate-500">Ready to draft. Click the generate button above to create cover letter text.</p>
              </div>
            )}
          </div>
        )}

        {/* INTERVIEW PREP TAB */}
        {activeTab === 'interview' && (
          <div className="glass-panel p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                  AI Interview Coach
                </h3>
                <p className="text-xs text-slate-500">Generate personalized interview questions based on your background and target role.</p>
              </div>

              {interviewQuestions.length === 0 && !isGeneratingQuestions && (
                <button
                  id="btn-trigger-interview"
                  onClick={triggerInterviewQuestionsGeneration}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition animate-fade-in"
                >
                  Generate Practice Questions
                </button>
              )}
            </div>

            {isGeneratingQuestions ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Crafting personalized technical and behavioral questions...</p>
              </div>
            ) : interviewQuestions.length > 0 ? (
              <div className="space-y-4">
                {interviewQuestions.map((q, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <button
                      id={`btn-question-${idx}`}
                      onClick={() => setExpandedQuestionIdx(expandedQuestionIdx === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/60 transition text-left"
                    >
                      <div className="flex items-center space-x-3 pr-2">
                        <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                          q.category === 'Technical' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                          q.category === 'HR' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                          q.category === 'Project' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {q.category}
                        </span>
                        <h4 className="font-semibold text-slate-800 text-xs sm:text-sm">{q.question}</h4>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-slate-500 shrink-0 transition-transform ${expandedQuestionIdx === idx ? 'rotate-90' : ''}`} />
                    </button>

                    {expandedQuestionIdx === idx && (
                      <div className="p-4 bg-white border-t border-slate-100 text-xs leading-relaxed space-y-2">
                        <span className="font-bold text-indigo-600 font-mono text-[10px] block">IDEAL ANSWER STRUCTURE:</span>
                        <ul className="space-y-1.5 pl-3 list-disc text-slate-600 font-sans">
                          {q.idealAnswerOutline.map((bullet, i) => (
                            <li key={i}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-slate-200 bg-slate-50/30 rounded-xl">
                <p className="text-xs text-slate-500">Practice behavioral and custom technical reviews. Press the generate button above.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
