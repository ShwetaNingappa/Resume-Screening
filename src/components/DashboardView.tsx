import { motion } from "motion/react";
import { FileText, Plus, Users, BarChart3, TrendingUp, ChevronRight, Award, AlertCircle, ArrowUpRight } from "lucide-react";
import { Resume, Analysis } from "../types";

interface DashboardViewProps {
  resumes: Resume[];
  analyses: Analysis[];
  onNavigateToTab: (tab: string) => void;
  onSelectAnalysis: (id: string) => void;
}

export default function DashboardView({ resumes, analyses, onNavigateToTab, onSelectAnalysis }: DashboardViewProps) {
  // Compute basic stats
  const totalResumes = resumes.length;
  const totalAnalyses = analyses.length;
  
  const averageAtsScore = analyses.length > 0 
    ? Math.round(analyses.reduce((sum, a) => sum + a.atsScore, 0) / analyses.length) 
    : 0;

  const highestAtsScore = analyses.length > 0
    ? Math.max(...analyses.map(a => a.atsScore))
    : 0;

  // Group by role to find popular roles
  const roleMap: Record<string, number> = {};
  analyses.forEach(a => {
    roleMap[a.targetRole] = (roleMap[a.targetRole] || 0) + 1;
  });
  const popularRoles = Object.entries(roleMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Get recent 5 analyses
  const recentAnalyses = [...analyses]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Welcome back. Monitor your resume optimization progress and insights.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            id="btn-dash-compare"
            onClick={() => onNavigateToTab('compare')}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-sm font-semibold transition shadow-xs"
          >
            Compare Resumes
          </button>
          <button
            id="btn-dash-upload"
            onClick={() => onNavigateToTab('upload')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/10 transition duration-150"
          >
            <Plus className="h-4 w-4" />
            Analyze New Resume
          </button>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-500 block mb-1">REPORTS COMPLETED</span>
            <span className="text-3xl font-bold font-display text-slate-950">{totalAnalyses}</span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-500 block mb-1">AVERAGE ATS SCORE</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold font-display text-slate-950">
                {averageAtsScore}%
              </span>
              {averageAtsScore > 75 && (
                <span className="text-xs text-emerald-600 font-semibold">Excellent</span>
              )}
            </div>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-purple-600">
            <BarChart3 className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-500 block mb-1">PEAK PERFORMANCE</span>
            <span className="text-3xl font-bold font-display text-slate-950">{highestAtsScore}%</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-500 block mb-1">SAVED RESUMES</span>
            <span className="text-3xl font-bold font-display text-slate-950">{totalResumes}</span>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Recent Analyses list */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-display font-bold text-lg text-slate-800">
              Recent Performance Analyses
            </h2>
            <span className="text-xs font-mono text-indigo-600">Real-time reports</span>
          </div>

          {recentAnalyses.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center text-slate-400 mb-4">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">No analysis reports yet</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6 font-sans">
                Upload your resume and select a target job role to generate your first ATS score and skills report.
              </p>
              <button
                id="btn-dash-empty-upload"
                onClick={() => onNavigateToTab('upload')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                Analyze First Resume
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAnalyses.map((analysis) => {
                const associatedResume = resumes.find(r => r.id === analysis.resumeId);
                return (
                  <div
                    key={analysis.id}
                    className="py-4 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition group cursor-pointer"
                    onClick={() => onSelectAnalysis(analysis.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition">
                          {analysis.targetRole}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1 text-xs text-slate-500">
                          <span>{associatedResume?.fileName || 'Parsed Resume'}</span>
                          <span>•</span>
                          <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-baseline justify-end space-x-1">
                          <span className="font-bold text-lg text-slate-900">{analysis.atsScore}</span>
                          <span className="text-xs text-slate-400">/100</span>
                        </div>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          analysis.strengthScore === 'Excellent' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          analysis.strengthScore === 'Good' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          analysis.strengthScore === 'Average' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {analysis.strengthScore}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Extra Insights */}
        <div className="space-y-6">
          {/* Target Role popular insights */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-800">Target Roles Overview</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Distribution of roles analyzed. ATS engines look for highly specific structural keywords customized to each domain.
            </p>

            {popularRoles.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-400">
                Data will appear after analyses.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {popularRoles.map(([role, count]) => (
                  <div key={role} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-600">
                      <span>{role}</span>
                      <span className="text-indigo-600 font-semibold">{count} {count === 1 ? 'analysis' : 'analyses'}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, (count / totalAnalyses) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick learning prompt */}
          <div className="glass-panel-glow p-5 space-y-3 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-24 h-24 rounded-full bg-indigo-600/5 blur-xl pointer-events-none" />
            <Award className="h-6 w-6 text-indigo-600" />
            <h4 className="font-bold text-slate-800 text-md">Need to lift your ATS score?</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Hiring managers prioritize measurable outcomes. Always write experience statements in the **STAR format**: Situation, Task, Action, and **Quantifiable Results** (e.g., "Increased sales by 30%").
            </p>
            <button
              id="btn-dash-tips"
              onClick={() => onNavigateToTab('upload')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-1 transition"
            >
              Analyze new target JD
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
