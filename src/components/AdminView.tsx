import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Users, FileText, Database, Server, RefreshCw, Trash2, AlertTriangle, Key, Terminal, Code } from "lucide-react";
import { AppStats, SystemLog, User } from "../types";

interface AdminViewProps {
  onBackToDashboard: () => void;
}

export default function AdminView({ onBackToDashboard }: AdminViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'logs' | 'schema' | 'dbops'>('users');
  const [stats, setStats] = useState<AppStats | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [opMessage, setOpMessage] = useState("");

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch("/api/admin/stats", {
        headers: { "X-User-Role": "admin" }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch logs
      const logsRes = await fetch("/api/admin/logs", {
        headers: { "X-User-Role": "admin" }
      });
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }

      // Fetch users
      const usersRes = await fetch("/api/admin/users", {
        headers: { "X-User-Role": "admin" }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResetDatabase = async () => {
    if (!window.confirm("ARE YOU ABSOLUTELY SURE? This will permanently delete all uploaded resumes, comparison histories, and analyses!")) {
      return;
    }
    setIsResetting(true);
    setOpMessage("");

    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "X-User-Role": "admin" }
      });
      if (!res.ok) throw new Error("Failed to reset database.");
      
      const data = await res.json();
      setOpMessage(data.message);
      await fetchAdminData();
    } catch (e: any) {
      setOpMessage(`Error: ${e.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const POSTGRESQL_DDL_SCHEMA = `-- PostgreSQL Schema for AI Resume Screening & ATS Analyzer

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resumes Table (parsed structures stored as JSONB)
CREATE TABLE IF NOT EXISTS Resumes (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES Users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    parsed_data JSONB NOT NULL,
    raw_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analyses Table (comprehensive score details)
CREATE TABLE IF NOT EXISTS Analyses (
    id VARCHAR(50) PRIMARY KEY,
    resume_id VARCHAR(50) REFERENCES Resumes(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES Users(id) ON DELETE CASCADE,
    target_role VARCHAR(150) NOT NULL,
    target_job_description TEXT,
    ats_score INTEGER NOT NULL,
    job_match_score INTEGER NOT NULL,
    skill_match_pct INTEGER NOT NULL,
    strength_score VARCHAR(50) NOT NULL,
    readiness_score VARCHAR(50) NOT NULL,
    readiness_explanation TEXT,
    matched_skills TEXT[] NOT NULL,
    missing_skills JSONB NOT NULL,
    missing_keywords TEXT[] NOT NULL,
    improvement_suggestions JSONB NOT NULL,
    learning_roadmap JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comparison Reports Table
CREATE TABLE IF NOT EXISTS Reports (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES Users(id) ON DELETE CASCADE,
    target_role VARCHAR(150) NOT NULL,
    target_job_description TEXT NOT NULL,
    resumes_ranking JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

  return (
    <div className="space-y-8">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-indigo-600" />
            Platform Control Deck
          </h1>
          <p className="text-sm text-slate-500">
            System stats, real-time security logging, and relational PostgreSQL DDL schemas.
          </p>
        </div>
        <button
          id="btn-admin-back"
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-sm font-semibold transition shadow-xs"
        >
          Back to Dashboard
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Retrieving system diagnostics...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="glass-panel p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">TOTAL USERS</span>
                  <span className="text-2xl font-bold font-display text-slate-900">{stats.totalUsers}</span>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <div className="glass-panel p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">RESUMES IN DB</span>
                  <span className="text-2xl font-bold font-display text-slate-900">{stats.totalResumes}</span>
                </div>
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                  <FileText className="h-5 w-5" />
                </div>
              </div>

              <div className="glass-panel p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">COMPLETED SCREENINGS</span>
                  <span className="text-2xl font-bold font-display text-slate-900">{stats.totalAnalyses}</span>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-purple-600">
                  <Database className="h-5 w-5" />
                </div>
              </div>

              <div className="glass-panel p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">GEMINI API CALLS</span>
                  <span className="text-2xl font-bold font-display text-slate-900">{stats.apiUsageCount}</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
                  <Server className="h-5 w-5" />
                </div>
              </div>
            </div>
          )}

          {/* Sub Navigation */}
          <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
            <button
              id="subtab-admin-users"
              onClick={() => setActiveSubTab('users')}
              className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition px-4 whitespace-nowrap ${
                activeSubTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Platform Users ({users.length})
            </button>
            <button
              id="subtab-admin-logs"
              onClick={() => setActiveSubTab('logs')}
              className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition px-4 whitespace-nowrap ${
                activeSubTab === 'logs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Audit & Error Logs ({logs.length})
            </button>
            <button
              id="subtab-admin-schema"
              onClick={() => setActiveSubTab('schema')}
              className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition px-4 whitespace-nowrap ${
                activeSubTab === 'schema' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              PostgreSQL Schema DDL
            </button>
            <button
              id="subtab-admin-dbops"
              onClick={() => setActiveSubTab('dbops')}
              className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition px-4 whitespace-nowrap ${
                activeSubTab === 'dbops' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              System Operations
            </button>
          </div>

          {/* Sub tab panels */}
          <div className="min-h-[250px]">
            
            {/* PLATFORM USERS */}
            {activeSubTab === 'users' && (
              <div className="glass-panel p-6 space-y-4">
                <h3 className="font-display font-semibold text-slate-900 text-md border-b border-slate-150 pb-2">Registered platform users</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 font-sans">
                    <thead>
                      <tr className="border-b border-slate-200 font-mono text-slate-500 uppercase">
                        <th className="py-3 px-4">User ID</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Joined At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-mono text-slate-400">{u.id}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{u.name}</td>
                          <td className="py-3 px-4 text-slate-600">{u.email}</td>
                          <td className="py-3 px-4 font-mono">
                            <span className={`px-2 py-0.5 rounded text-[10px] border ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-150' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* AUDIT LOGS */}
            {activeSubTab === 'logs' && (
              <div className="glass-panel p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-display font-semibold text-slate-900 text-md flex items-center gap-2">
                    <Terminal className="h-4.5 w-4.5 text-indigo-600" />
                    Security Audit Trail
                  </h3>
                  <button
                    id="btn-admin-refresh-logs"
                    onClick={fetchAdminData}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-xs text-slate-700 rounded-lg transition shadow-xs font-semibold"
                  >
                    <RefreshCw className="h-3 w-3" /> Refresh Logs
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl font-mono text-xs text-slate-300 max-h-[350px] overflow-y-auto space-y-2.5 shadow-inner">
                  {logs.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No audit logs captured.</p>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className="flex items-start gap-3 leading-relaxed">
                        <span className="text-slate-500 select-none shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className={`font-bold shrink-0 ${
                          log.level === 'error' ? 'text-rose-400' :
                          log.level === 'warn' ? 'text-amber-400' :
                          'text-indigo-400'
                        }`}>
                          {log.level.toUpperCase()}
                        </span>
                        <span>{log.message}</span>
                        {log.details && (
                          <span className="text-slate-500 block truncate max-w-sm">({log.details})</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SQL SCHEMA */}
            {activeSubTab === 'schema' && (
              <div className="glass-panel p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-display font-semibold text-slate-900 text-md flex items-center gap-2">
                    <Code className="h-4.5 w-4.5 text-indigo-600" />
                    Production PostgreSQL Relational Schema
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">Fully structured tables</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The system's underlying relational database schema matches this formal PostgreSQL definition. Text parses are indexed using standard JSONB schemas for efficient querying.
                </p>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[11px] leading-relaxed text-indigo-400 overflow-x-auto max-h-[350px] shadow-inner">
                  <pre className="whitespace-pre">{POSTGRESQL_DDL_SCHEMA}</pre>
                </div>
              </div>
            )}

            {/* DBOPS */}
            {activeSubTab === 'dbops' && (
              <div className="glass-panel p-6 space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-slate-900 text-md border-b border-slate-150 pb-2">Destructive Platform Diagnostics</h3>
                  <p className="text-xs text-slate-500 mt-1">Caution: All actions here alter the real active filesystem state inside the sandbox container environment.</p>
                </div>

                <div className="p-4 border border-rose-100 bg-rose-50/50 rounded-xl space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-rose-700 text-sm">Hard Factory Reset</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                        Resets the file database back to standard default seeded users (admin & test user) and clears all uploaded candidate documents. This action is final and cannot be undone.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      id="btn-admin-db-reset"
                      onClick={handleResetDatabase}
                      disabled={isResetting}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                      {isResetting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      Purge & Reset All Database Tables
                    </button>
                    {opMessage && (
                      <span className="text-xs font-mono text-indigo-600 font-semibold">{opMessage}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
