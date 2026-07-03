import { motion } from "motion/react";
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Zap, Award, BarChart3, Users, HelpCircle, FileText } from "lucide-react";

interface LandingPageProps {
  onEnter: (role: 'admin' | 'user' | null) => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-between py-12 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between mb-8 z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl shadow-inner">
            <Cpu className="h-6 w-6 text-indigo-600" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">
            ATS<span className="text-indigo-600">Screen</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            id="btn-nav-admin"
            onClick={() => onEnter('admin')} 
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg transition"
          >
            Recruiter/Admin Demo
          </button>
          <button 
            id="btn-nav-portal"
            onClick={() => onEnter('user')} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md shadow-indigo-600/10 transition duration-150"
          >
            Candidate Portal
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl mx-auto text-center z-10 flex-grow flex flex-col justify-center my-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full mb-6 text-xs text-indigo-700 font-semibold shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span className="font-medium">Powered by Gemini 3.5 Flash</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            ATS-Optimize Your Resume.<br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              Secure More Interviews.
            </span>
          </h1>

          <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            An advanced production-ready AI resume analyzer and screening engine. Instantly extract skills, match role descriptions, identify gaps, and rewrite sections for recruitment compliance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              id="btn-landing-get-started"
              onClick={() => onEnter('user')}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-4 rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              Get Started for Free
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              id="btn-landing-admin-demo"
              onClick={() => onEnter('admin')}
              className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-medium px-8 py-4 rounded-xl transition shadow-xs"
            >
              Recruiter Demo
            </button>
          </div>
        </motion.div>

        {/* Feature Highlights Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20"
        >
          <div className="glass-panel p-6 text-left">
            <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 mb-2">ATS Screening Score</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-sans">
              Analyze your layout, keywords, and structural hierarchy against industry standard applicant tracking rules out of 100.
            </p>
          </div>

          <div className="glass-panel p-6 text-left">
            <div className="h-10 w-10 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 mb-2">AI-Powered Rewriting</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-sans">
              Instantly polish bullet points, summaries, and experience using high-impact verbs and matching role keywords.
            </p>
          </div>

          <div className="glass-panel p-6 text-left">
            <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 mb-2">Structured Roadmap</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-sans">
              Identify skill gaps and generate a personalized 4-month learning roadmap complete with recommended free study resources.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-200 z-10 text-xs text-slate-500 font-mono">
        <p>© 2026 ATSScreen. Built on server-side Google GenAI.</p>
        <div className="flex space-x-6 mt-4 sm:mt-0">
          <span>Enterprise Compliant</span>
          <span>No API Keys Exposed</span>
          <span>Zero Mock Data</span>
        </div>
      </div>
    </div>
  );
}
