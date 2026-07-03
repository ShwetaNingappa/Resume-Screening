import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  FileText, LayoutDashboard, UploadCloud, Users, Settings, LogOut, ShieldAlert, Cpu, Award,
  Sparkles, RefreshCw, ChevronLeft, Menu, X, PlusCircle, AlertCircle
} from "lucide-react";

import { User, Resume, Analysis } from "./types";
import LandingPage from "./components/LandingPage";
import DashboardView from "./components/DashboardView";
import UploadView from "./components/UploadView";
import ReportView from "./components/ReportView";
import ComparisonView from "./components/ComparisonView";
import AdminView from "./components/AdminView";
import SettingsView from "./components/SettingsView";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // App initialization & loading states
  const [appLoading, setAppLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);

  // Restore session from localStorage on load
  useEffect(() => {
    const savedUser = localStorage.getItem("ats_user_session");
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser) as User;
        setCurrentUser(userObj);
      } catch (e) {
        console.error("Stale session data", e);
      }
    }
    setAppLoading(false);
  }, []);

  // Fetch resumes and analyses when currentUser changes
  const refreshAppData = async () => {
    if (!currentUser) return;
    setFetchingData(true);
    try {
      // Fetch resumes
      const resumeRes = await fetch("/api/resumes", {
        headers: { "X-User-Id": currentUser.id }
      });
      if (resumeRes.ok) {
        const resumesData = await resumeRes.json();
        setResumes(resumesData);
      }

      // Fetch analyses
      const analysisRes = await fetch("/api/analyses", {
        headers: { "X-User-Id": currentUser.id }
      });
      if (analysisRes.ok) {
        const analysesData = await analysisRes.json();
        setAnalyses(analysesData);
      }
    } catch (e) {
      console.error("Error retrieving user records", e);
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    refreshAppData();
  }, [currentUser]);

  // Login handler
  const handleEnterPlatform = async (role: 'admin' | 'user' | null) => {
    setAppLoading(true);
    const testEmail = role === 'admin' ? "shwetaningappa2004@gmail.com" : "candidate@example.com";
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail })
      });

      if (response.ok) {
        const user: User = await response.json();
        setCurrentUser(user);
        localStorage.setItem("ats_user_session", JSON.stringify(user));
        setActiveTab("dashboard");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAppLoading(false);
    }
  };

  // Switch role test shortcut
  const handleSwitchRole = async (targetRole: 'admin' | 'user') => {
    const email = targetRole === 'admin' ? "shwetaningappa2004@gmail.com" : "candidate@example.com";
    setAppLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const user: User = await response.json();
        setCurrentUser(user);
        localStorage.setItem("ats_user_session", JSON.stringify(user));
        setActiveTab("dashboard");
        setSelectedAnalysis(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAppLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("ats_user_session");
    setSelectedAnalysis(null);
    setResumes([]);
    setAnalyses([]);
  };

  const handleAnalysisComplete = (newAnalysis: Analysis) => {
    // Re-fetch database copies to align dashboard
    refreshAppData();
    setSelectedAnalysis(newAnalysis);
    setActiveTab("report");
  };

  const handleSelectAnalysisFromId = (id: string) => {
    const analysis = analyses.find(a => a.id === id);
    if (analysis) {
      setSelectedAnalysis(analysis);
      setActiveTab("report");
    }
  };

  if (appLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-mono text-xs">Waking up secure full-stack containers...</p>
      </div>
    );
  }

  // Render landing if not logged in
  if (!currentUser) {
    return <LandingPage onEnter={handleEnterPlatform} />;
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-800 overflow-x-hidden">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className={`fixed inset-y-0 left-0 bg-white border-r border-slate-200/80 w-64 z-40 transition-transform duration-300 md:translate-x-0 md:static shrink-0 flex flex-col justify-between print:hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Upper nav items */}
        <div className="p-5 space-y-8">
          {/* Logo and toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                <Cpu className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-slate-900">
                ATS<span className="text-indigo-600">Screen</span>
              </span>
            </div>
            
            {/* Small screen close trigger */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            <button
              id="sidebar-nav-dash"
              onClick={() => {
                setActiveTab("dashboard");
                setSelectedAnalysis(null);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold font-mono tracking-wide transition ${
                activeTab === "dashboard"
                  ? "bg-indigo-50 text-indigo-600 border border-indigo-100/50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>DASHBOARD</span>
            </button>

            <button
              id="sidebar-nav-upload"
              onClick={() => {
                setActiveTab("upload");
                setSelectedAnalysis(null);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold font-mono tracking-wide transition ${
                activeTab === "upload"
                  ? "bg-indigo-50 text-indigo-600 border border-indigo-100/50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <UploadCloud className="h-4.5 w-4.5" />
              <span>ATS SCREENER</span>
            </button>

            <button
              id="sidebar-nav-compare"
              onClick={() => {
                setActiveTab("compare");
                setSelectedAnalysis(null);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold font-mono tracking-wide transition ${
                activeTab === "compare"
                  ? "bg-indigo-50 text-indigo-600 border border-indigo-100/50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              <span>COMPARATIVE RANKER</span>
            </button>

            <button
              id="sidebar-nav-settings"
              onClick={() => {
                setActiveTab("settings");
                setSelectedAnalysis(null);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold font-mono tracking-wide transition ${
                activeTab === "settings"
                  ? "bg-indigo-50 text-indigo-600 border border-indigo-100/50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <Settings className="h-4.5 w-4.5" />
              <span>WORKSPACE SETTINGS</span>
            </button>

            {/* Admin only control link */}
            {currentUser.role === 'admin' && (
              <button
                id="sidebar-nav-admin"
                onClick={() => {
                  setActiveTab("admin");
                  setSelectedAnalysis(null);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold font-mono tracking-wide transition ${
                  activeTab === "admin"
                    ? "bg-indigo-50 text-indigo-600 border border-indigo-100/50"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                }`}
              >
                <ShieldAlert className="h-4.5 w-4.5" />
                <span>PLATFORM ADMIN</span>
              </button>
            )}
          </nav>
        </div>

        {/* User profile footer section */}
        <div className="p-4 border-t border-slate-200/80 space-y-3.5">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="truncate">
              <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">{currentUser.name}</h4>
              <span className="text-[10px] text-slate-500 font-mono block truncate mt-0.5">{currentUser.email}</span>
            </div>
          </div>

          <button
            id="sidebar-logout"
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-2.5 py-2 text-xs font-semibold font-mono text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50/5 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>EXIT WORKSPACE</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT BODY */}
      <div className="flex-grow flex flex-col min-h-screen relative overflow-x-hidden">
        
        {/* Global top nav for mobil screen */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white md:hidden print:hidden">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-display font-bold text-md text-slate-900">ATS Screen</span>
          </div>

          <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 border border-indigo-100/50 px-2 py-0.5 rounded uppercase">
            {currentUser.role} view
          </span>
        </header>

        {/* Primary Page Canvas */}
        <main className="flex-grow p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-6">
          {fetchingData && (
            <div className="fixed top-4 right-4 bg-white border border-indigo-200 shadow-md px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-indigo-600 z-50 animate-pulse font-mono">
              <RefreshCw className="h-3 w-3 animate-spin" /> Synchronizing data...
            </div>
          )}

          {/* ACTIVE ROUTING */}
          {activeTab === "dashboard" && (
            <DashboardView
              resumes={resumes}
              analyses={analyses}
              onNavigateToTab={(tab) => {
                setActiveTab(tab);
                setSelectedAnalysis(null);
              }}
              onSelectAnalysis={handleSelectAnalysisFromId}
            />
          )}

          {activeTab === "upload" && (
            <UploadView
              userId={currentUser.id}
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}

          {activeTab === "report" && selectedAnalysis ? (
            <ReportView
              analysis={selectedAnalysis}
              resumes={resumes}
              onBackToDashboard={() => {
                setActiveTab("dashboard");
                setSelectedAnalysis(null);
              }}
            />
          ) : activeTab === "report" ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500">No active report selected.</p>
              <button onClick={() => setActiveTab("dashboard")} className="text-xs text-indigo-400 mt-2 hover:underline">
                Return to Dashboard
              </button>
            </div>
          ) : null}

          {activeTab === "compare" && (
            <ComparisonView
              resumes={resumes}
              onBackToDashboard={() => setActiveTab("dashboard")}
            />
          )}

          {activeTab === "admin" && currentUser.role === 'admin' && (
            <AdminView
              onBackToDashboard={() => setActiveTab("dashboard")}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              currentUser={currentUser}
              onSwitchRole={handleSwitchRole}
              onBackToDashboard={() => setActiveTab("dashboard")}
            />
          )}
        </main>
      </div>

    </div>
  );
}
