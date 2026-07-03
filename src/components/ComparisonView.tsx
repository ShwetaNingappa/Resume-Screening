import React, { useState } from "react";
import { motion } from "motion/react";
import { Users, FileText, CheckSquare, Square, ChevronRight, RefreshCw, Award, ArrowUpRight, AlertCircle, FileCheck2, Trophy } from "lucide-react";
import { Resume, CompareResult, ComparisonReport } from "../types";

interface ComparisonViewProps {
  resumes: Resume[];
  onBackToDashboard: () => void;
}

export default function ComparisonView({ resumes, onBackToDashboard }: ComparisonViewProps) {
  const [selectedResumeIds, setSelectedResumeIds] = useState<string[]>([]);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [jobDescription, setJobDescription] = useState("");
  
  const [isComparing, setIsComparing] = useState(false);
  const [compareReport, setCompareReport] = useState<ComparisonReport | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleToggleSelect = (id: string) => {
    if (selectedResumeIds.includes(id)) {
      setSelectedResumeIds(selectedResumeIds.filter(x => x !== id));
    } else {
      setSelectedResumeIds([...selectedResumeIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedResumeIds.length === resumes.length) {
      setSelectedResumeIds([]);
    } else {
      setSelectedResumeIds(resumes.map(r => r.id));
    }
  };

  const handleRunComparison = async () => {
    if (selectedResumeIds.length < 2) {
      setErrorMessage("Please select at least 2 resumes to compare and rank.");
      return;
    }
    if (!targetRole.trim()) {
      setErrorMessage("Please enter a target role.");
      return;
    }
    if (!jobDescription.trim()) {
      setErrorMessage("Please enter or paste the Job Description. The comparison engine requires it to compute alignment metrics.");
      return;
    }

    setIsComparing(true);
    setErrorMessage("");
    setCompareReport(null);

    try {
      const res = await fetch("/api/resumes/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": resumes[0].userId // Pass user ID
        },
        body: JSON.stringify({
          resumeIds: selectedResumeIds,
          targetRole,
          jobDescription
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to compare and rank candidates.");
      }

      const report: ComparisonReport = await res.json();
      setCompareReport(report);
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "An unexpected error occurred during comparison.");
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Resume Comparative Ranking
          </h1>
          <p className="text-sm text-slate-500">
            Select multiple uploaded resumes, paste your target job listing, and let Gemini rank candidates by alignment.
          </p>
        </div>
        <button
          id="btn-compare-back"
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-sm font-semibold transition self-start shadow-xs"
        >
          Back to Dashboard
        </button>
      </div>

      {isComparing ? (
        /* Comparing state loader */
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center min-h-[350px] space-y-6">
          <div className="relative">
            <div className="h-16 w-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <Trophy className="h-6 w-6 text-indigo-600 absolute top-5 left-5 animate-bounce" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-slate-900 animate-pulse">Running Candidate Ranking</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto font-sans">
              Cross-referencing {selectedResumeIds.length} candidate profiles with job compliance indicators using semantic keyword matching...
            </p>
          </div>
        </div>
      ) : compareReport ? (
        /* Report results leaderboard */
        <div className="space-y-6">
          <div className="glass-panel p-5 bg-indigo-50/50 border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-indigo-600 uppercase font-semibold">LEADERBOARD REPORT GENERATED</span>
              <h2 className="font-display text-xl font-bold text-slate-900">Target Role: {compareReport.targetRole}</h2>
            </div>
            <button
              id="btn-compare-reset"
              onClick={() => {
                setCompareReport(null);
                setSelectedResumeIds([]);
              }}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg transition"
            >
              Start New Comparison
            </button>
          </div>

          {/* Leaders list */}
          <div className="space-y-4">
            {compareReport.resumes
              .sort((a, b) => a.rank - b.rank)
              .map((res) => (
                <div key={res.resumeId} className="glass-panel p-5 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6 hover:border-slate-300 transition">
                  {/* Rank Badge */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600" />
                  
                  <div className="flex items-center space-x-5 pl-2">
                    {/* Rank indicator circle */}
                    <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 block leading-none">RANK</span>
                      <span className="text-lg font-bold font-display text-indigo-600 leading-none mt-1">#{res.rank}</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-md md:text-lg flex items-center gap-2">
                        {res.candidateName}
                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                          res.strengthScore === 'Excellent' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          res.strengthScore === 'Good' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          res.strengthScore === 'Average' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {res.strengthScore}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 font-mono">{res.fileName}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pl-2 md:pl-0 md:text-right">
                    {/* Scores */}
                    <div className="flex gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block mb-0.5">ATS MATCH</span>
                        <span className="text-lg font-bold font-display text-indigo-600">{res.atsScore}%</span>
                      </div>
                      <div className="border-r border-slate-200 my-1" />
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block mb-0.5">JD FIT</span>
                        <span className="text-lg font-bold font-display text-purple-600">{res.jobMatchScore}%</span>
                      </div>
                      <div className="border-r border-slate-200 my-1" />
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block mb-0.5">MATCHED SKILLS</span>
                        <span className="text-lg font-bold font-display text-emerald-600">{res.matchedSkillsCount}</span>
                      </div>
                    </div>

                    {/* Summary Justification */}
                    <div className="w-full md:max-w-xs text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left font-sans">
                      <span className="font-bold text-slate-800 block mb-0.5">AI Justification:</span>
                      {res.summary}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        /* Select Form Panel */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Select resumes sidebar */}
          <div className="md:col-span-1 glass-panel p-6 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-display font-semibold text-slate-900 text-md flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                1. Select Candidates
              </h2>
              {resumes.length > 0 && (
                <button
                  id="btn-compare-select-all"
                  onClick={handleSelectAll}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition"
                >
                  {selectedResumeIds.length === resumes.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>

            {resumes.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No resumes uploaded in database. Go to Upload Resume first.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {resumes.map(r => {
                  const isSelected = selectedResumeIds.includes(r.id);
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleToggleSelect(r.id)}
                      className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition ${
                        isSelected 
                          ? 'border-indigo-300 bg-indigo-50/50 text-indigo-950' 
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <FileText className={`h-4.5 w-4.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <div className="truncate">
                          <p className="text-xs font-semibold leading-snug truncate">{r.parsedData.name || 'Candidate Name'}</p>
                          <p className="text-[10px] text-slate-500 leading-none mt-1 font-mono truncate">{r.fileName}</p>
                        </div>
                      </div>
                      <div>
                        {isSelected ? (
                          <CheckSquare className="h-4.5 w-4.5 text-indigo-600" />
                        ) : (
                          <Square className="h-4.5 w-4.5 text-slate-300 hover:text-slate-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form details section */}
          <div className="md:col-span-2 glass-panel p-6 space-y-6">
            <h2 className="font-display font-semibold text-slate-900 text-md flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileCheck2 className="h-5 w-5 text-indigo-600" />
              2. Enter Screening Scope
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500">TARGET ROLE TITLE</label>
                <input
                  id="input-compare-role"
                  type="text"
                  placeholder="e.g. Senior Machine Learning Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-500">PASTE TARGET JOB DESCRIPTION (REQUIRED)</label>
                  <span className="text-[10px] text-rose-500 font-semibold">Mandatory for Ranking</span>
                </div>
                <textarea
                  id="textarea-compare-jd"
                  rows={10}
                  placeholder="Paste the full employer description detailing responsibilities, required framework experience, and compliance factors to generate comparative matches..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl p-3.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none font-sans leading-relaxed"
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  id="btn-run-compare"
                  onClick={handleRunComparison}
                  disabled={selectedResumeIds.length < 2 || isComparing}
                  className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/10 transition transform hover:-translate-y-0.5"
                >
                  Compare & Rank Candidates ({selectedResumeIds.length} Selected)
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
