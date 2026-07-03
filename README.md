# AI Resume Screening & ATS Analyzer

A production-ready, full-stack resume scanning, keyword analysis, and applicant screening platform. Built using **React + Vite**, **Express**, **TypeScript**, and powered by server-side **Google Gemini 3.5 Flash** to evaluate documents against Applicant Tracking System (ATS) compliance guidelines and industry role requirements.

## Core Capabilities & Features

### 1. Resume Parsing & Normalization
* Multimodal structure extraction maps resume elements directly to standardized structures (`ParsedResume`) using server-side Gemini.
* Automatically normalizes extracted technical proficiencies (e.g. `Python Programming` to `Python`, `Machine Learning Models` to `Machine Learning`).

### 2. Comprehensive Compatibility Scoring
* **ATS Score**: Evaluates resume layout hierarchy, keyword presence, and formatting compliance out of 100.
* **Job Match Score**: Quantifies alignment with primary and secondary target role competencies.
* **Skill Match Percentage**: Visualizes direct intersection of candidate skillsets against employer expectations.

### 3. Gap Analysis & Roadmap Guidance
* **Skills Gap Categorization**: Groups missing proficiencies into `Critical`, `Important`, and `Optional` priority lists.
* **4-Month Learning Timeline**: Provides concrete milestones, actionable tasks, and high-quality study keywords.

### 4. Interactive Writing Utilities
* **AI Cover Letter Writer**: Drafts customized, high-converting copy matching candidate experience directly to job descriptions with clipboard support.
* **AI Resume Section Rewriter**: Instantly polishes summaries, bullet points, and project descriptions in real-time, integrating missing keywords and action verbs.
* **Interview Practice Coach**: Formulates realistic custom interview prompts (HR, Technical, Projects, Role-Specific) paired with ideal response outlines.

### 5. Multi-Candidate Benchmarking
* Select multiple candidate files, input a target job listing, and view a visual leaderboard rankings report complete with summary AI justifications.

---

## Technical Architecture

```
                                  +-------------------+
                                  |    React Client   |
                                  |   Vite SPA (HMR)  |
                                  +---------+---------+
                                            |
                                            | JSON Payload (base64 documents)
                                            v
+-------------------+             +-------------------+             +-----------------------+
|  SQLite Storage   | <=========> |   Express Server  | <=========> | Google GenAI (Gemini) |
| (data/db.json)    |   Relational|    (Port 3000)    |   Secure    |  (gemini-3.5-flash)   |
+-------------------+   Queries   +-------------------+   API Call  +-----------------------+
```

### Relational Schema Definition (PostgreSQL DDL)

The backend local datastore structures map directly to these relational database tables:

```sql
-- Users Table
CREATE TABLE Users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resumes Table
CREATE TABLE Resumes (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES Users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    parsed_data JSONB NOT NULL,
    raw_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analyses Table
CREATE TABLE Analyses (
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
```

---

## API Documentation

### Authentication Endpoints
* `POST /api/auth/register`: Create profile
* `POST /api/auth/login`: Authenticate profile
* `GET /api/auth/me`: Fetch active session metadata (uses `X-User-Email` header)

### Analysis & Resumes Endpoints
* `POST /api/resumes/upload`: Parse and store resume (Accepts JSON base64 files or raw text)
* `GET /api/resumes`: Fetch candidate resumes
* `POST /api/resumes/analyze`: Run compliance scans and matching metrics
* `GET /api/analyses`: Fetch completed reports
* `POST /api/resumes/compare`: Benchmark and rank multiple resumes against a target job description

### Writing Utilities Endpoints
* `POST /api/resumes/rewrite`: ATS-optimize specific paragraphs
* `POST /api/cover-letter/generate`: Build bespoke letter documents
* `POST /api/interview-prep/generate`: Build specialized behavioral and technical question lists

### Admin Dashboard Control Endpoints
* `GET /api/admin/stats`: Get global analytics counts
* `GET /api/admin/logs`: Access security audit trace logs
* `POST /api/admin/reset`: Purge database tables and re-seed system

---

## Getting Started

### Prerequisites
* Node.js v20 or higher
* Docker & Docker Compose (Optional for containerization)

### Local Development
1. Copy environmental templates:
   ```bash
   cp .env.example .env
   ```
2. In the `.env` file, supply your Google AI Studio secret key under `GEMINI_API_KEY`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Fire up the full-stack development workspace on port `3000`:
   ```bash
   npm run dev
   ```

### Production Build & Container Execution
1. Compile front-end bundles and transpile backend files:
   ```bash
   npm run build
   ```
2. Start the compiled production artifact using:
   ```bash
   npm start
   ```

### Docker Compose Container Setup
Run the complete application inside isolated Docker layers:
```bash
docker-compose up --build
```
This boots the app on `http://localhost:3000` and creates a persistent volume map inside `./data/` preserving all local SQL file database records.
