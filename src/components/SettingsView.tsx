import React from "react";
import { User, Key, CheckCircle2, XCircle, ShieldCheck, Database, RefreshCw } from "lucide-react";

interface SettingsViewProps {
  currentUser: { email: string; name: string; role: 'admin' | 'user' } | null;
  onSwitchRole: (role: 'admin' | 'user') => void;
  onBackToDashboard: () => void;
}

export default function SettingsView({ currentUser, onSwitchRole, onBackToDashboard }: SettingsViewProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Settings & Workspace
          </h1>
          <p className="text-sm text-slate-500">
            Manage your local user profile, workspace credentials, and active environment.
          </p>
        </div>
        <button
          id="btn-settings-back"
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-sm font-semibold transition shadow-xs"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6 space-y-5">
            <h2 className="font-display font-semibold text-slate-900 text-md border-b border-slate-150 pb-2">User Credentials</h2>
            
            {currentUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-mono block mb-1 uppercase">Name</span>
                    <span className="font-semibold text-slate-800">{currentUser.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono block mb-1 uppercase">Email Address</span>
                    <span className="font-semibold text-slate-800">{currentUser.email}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-150">
                  <span className="text-xs font-mono text-slate-500 block uppercase">Testing Framework Role</span>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    Switch between candidate and recruiter views instantly to test different platform capabilities.
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      id="btn-switch-to-user"
                      onClick={() => onSwitchRole('user')}
                      className={`text-xs px-4 py-2 border rounded-xl font-semibold transition ${
                        currentUser.role === 'user'
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
                      }`}
                    >
                      Candidate Role
                    </button>
                    <button
                      id="btn-switch-to-admin"
                      onClick={() => onSwitchRole('admin')}
                      className={`text-xs px-4 py-2 border rounded-xl font-semibold transition ${
                        currentUser.role === 'admin'
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
                      }`}
                    >
                      Recruiter / Admin Role
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security / Secret Info */}
        <div className="space-y-6">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="font-display font-semibold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-150 pb-2">
              <Key className="h-4.5 w-4.5 text-indigo-600" /> Environment Keys
            </h3>
            
            <div className="space-y-3.5">
              {/* API Key Indicators */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Gemini GenAI Key</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Active
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">SQLite database file</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Connected
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed pt-2 border-t border-slate-150">
              API connections use server-side proxies to prevent client-side credential exposure. Manage variables in the Secrets Panel.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
