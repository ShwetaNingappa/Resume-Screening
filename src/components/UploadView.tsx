import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { Upload, FileText, ChevronRight, HelpCircle, Briefcase, Trash2, Cpu, AlertCircle, FileSpreadsheet } from "lucide-react";
import { Resume, Analysis } from "../types";

interface UploadViewProps {
  onAnalysisComplete: (analysis: Analysis) => void;
  userId: string;
}

const PREDEFINED_ROLES = [
  "Software Engineer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "AI Engineer",
  "DevOps Engineer",
  "Cyber Security Analyst",
  "Cloud Engineer"
];

export default function UploadView({ onAnalysisComplete, userId }: UploadViewProps) {
  const [activeUploadTab, setActiveUploadTab] = useState<'file' | 'text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [selectedRole, setSelectedRole] = useState(PREDEFINED_ROLES[0]);
  const [customRole, setCustomRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Parsing and Analyzing status
  const [status, setStatus] = useState<'idle' | 'parsing' | 'analyzing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (f: File) => {
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (validTypes.includes(f.type) || f.name.endsWith(".pdf") || f.name.endsWith(".docx") || f.name.endsWith(".txt")) {
      setFile(f);
      setErrorMessage("");
    } else {
      setErrorMessage("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerUploadAndAnalysis = async () => {
    const roleToAnalyze = customRole.trim() || selectedRole;
    if (!roleToAnalyze) {
      setErrorMessage("Please select or enter a target role.");
      return;
    }

    if (activeUploadTab === 'file' && !file) {
      setErrorMessage("Please upload a resume file.");
      return;
    }

    if (activeUploadTab === 'text' && !rawText.trim()) {
      setErrorMessage("Please paste your resume text content.");
      return;
    }

    setStatus('parsing');
    setErrorMessage("");
    setStatusMessage("Extracting candidate information using Gemini AI...");

    try {
      let uploadPayload: any = {
        fileName: activeUploadTab === 'file' ? file!.name : "pasted-resume.txt",
        fileType: activeUploadTab === 'file' ? file!.type : "text/plain"
      };

      if (activeUploadTab === 'text') {
        uploadPayload.rawText = rawText;
      } else {
        // Convert file to base64
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file!);
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = error => reject(error);
        });
        uploadPayload.base64Data = base64String;
        
        // Add plain text preview estimation if available
        uploadPayload.rawText = `[BINARY RESUME FILE: ${file!.name}]`;
      }

      // Step 1: Parse the resume
      const parseResponse = await fetch("/api/resumes/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId
        },
        body: JSON.stringify(uploadPayload)
      });

      if (!parseResponse.ok) {
        const errData = await parseResponse.json();
        throw new Error(errData.error || "Failed to extract candidate resume details.");
      }

      const resumeData: Resume = await parseResponse.json();

      // Step 2: Analyze resume against job description / role
      setStatus('analyzing');
      setStatusMessage(`Comparing qualifications with target role: "${roleToAnalyze}"...`);

      const analyzeResponse = await fetch("/api/resumes/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId
        },
        body: JSON.stringify({
          resumeId: resumeData.id,
          targetRole: roleToAnalyze,
          jobDescription: jobDescription.trim() || undefined
        })
      });

      if (!analyzeResponse.ok) {
        const errData = await analyzeResponse.json();
        throw new Error(errData.error || "Failed to analyze resume match score.");
      }

      const analysisResult: Analysis = await analyzeResponse.json();
      
      setStatus('success');
      onAnalysisComplete(analysisResult);
    } catch (e: any) {
      console.error(e);
      setStatus('error');
      setErrorMessage(e.message || "An unexpected error occurred during processing.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          ATS Screener & Analyzer
        </h1>
        <p className="text-sm text-slate-500">
          Upload your resume and enter a target role to generate a comprehensive matching score and learning roadmap.
        </p>
      </div>

      {status === 'parsing' || status === 'analyzing' ? (
        /* Processing Loading Screen */
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center min-h-[350px] space-y-6">
          <div className="relative">
            <div className="h-16 w-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <Cpu className="h-6 w-6 text-indigo-600 absolute top-5 left-5 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-slate-900">Analyzing Qualifications</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto animate-pulse">
              {statusMessage}
            </p>
          </div>

          <div className="w-full max-w-xs bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full bg-indigo-600 rounded-full transition-all duration-700 ${status === 'parsing' ? 'w-1/3' : 'w-3/4'}`} />
          </div>
        </div>
      ) : (
        /* Upload Panel Form */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Job Description and Role Selection */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass-panel p-6 space-y-5">
              <h2 className="font-display font-semibold text-lg text-slate-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                Target Role
              </h2>

              <div className="space-y-4">
                {/* Select predefined role */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-500">SELECT COMMON ROLE</label>
                  <select
                    id="select-role-predefined"
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      setCustomRole("");
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  >
                    {PREDEFINED_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* Enter custom role */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-500">OR ENTER CUSTOM ROLE</label>
                  <input
                    id="input-role-custom"
                    type="text"
                    placeholder="e.g. Lead React Developer"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Job Description Upload */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-slate-500">JOB DESCRIPTION (RECOMMENDED)</label>
                    <span className="text-[10px] text-slate-400">Improves Match Rate</span>
                  </div>
                  <textarea
                    id="textarea-job-desc"
                    rows={6}
                    placeholder="Paste the full job listing description here to extract highly customized missing skills and compliance requirements..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl p-3 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none font-sans leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Resume Upload & Text Copy */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-panel p-6 space-y-6">
              {/* Tabs */}
              <div className="flex border-b border-slate-100">
                <button
                  id="tab-upload-file"
                  onClick={() => setActiveUploadTab('file')}
                  className={`pb-3 text-sm font-semibold border-b-2 transition px-4 ${
                    activeUploadTab === 'file'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Upload File (PDF / DOCX)
                </button>
                <button
                  id="tab-upload-text"
                  onClick={() => setActiveUploadTab('text')}
                  className={`pb-3 text-sm font-semibold border-b-2 transition px-4 ${
                    activeUploadTab === 'text'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Paste Text Content
                </button>
              </div>

              {activeUploadTab === 'file' ? (
                /* File drag and drop target */
                <div className="space-y-4">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-indigo-500 bg-indigo-50/50'
                        : 'border-slate-200 bg-slate-50/30 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                    />

                    <div className="h-12 w-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4 animate-float">
                      <Upload className="h-6 w-6" />
                    </div>

                    <p className="text-sm text-slate-800 font-semibold mb-1">
                      Drag and drop your resume here, or <span className="text-indigo-600 hover:underline">browse files</span>
                    </p>
                    <p className="text-xs text-slate-500 font-sans">
                      Supports PDF, DOCX, or TXT (Max 10MB)
                    </p>
                  </div>

                  {file && (
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800 max-w-xs truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        id="btn-remove-file"
                        onClick={removeFile}
                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        title="Remove file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Text Area copy paste */
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-500">PASTE COPIED RESUME TEXT</label>
                  <textarea
                    id="textarea-resume-text"
                    rows={12}
                    placeholder="Select all text from your current resume (Cmd+A / Ctrl+A) and paste the raw content directly here. Our parsing engine will structure details cleanly..."
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl p-4 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none font-mono leading-relaxed"
                  />
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  id="btn-trigger-screen"
                  onClick={triggerUploadAndAnalysis}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/10 transition-all duration-150 transform hover:-translate-y-0.5"
                >
                  Process & Screen Resume
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
