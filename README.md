# 🚀 GitHub Talent Analyzer

# AI-Powered Developer Intelligence Platform

Analyze GitHub profiles with interactive analytics, developer scoring, repository quality insights, activity trends, and AI-assisted GitHub exploration.

### Built for Recruiters • Hiring Managers • Developers • Freelancers • Students

> Microsoft Edge Add-on ⏳ Currently Under Review

---

# 🌐 Live Backend API

https://github-talent-analyzer-api.onrender.com

---

# 📌 Overview

GitHub Talent Analyzer transforms any GitHub profile into a recruiter-friendly analytics dashboard.

Instead of manually inspecting repositories, stars, activity, commits, and portfolio quality, the extension automatically evaluates developers and generates visual insights.

The project combines:

* GitHub REST API
* GitHub Remote MCP Server
* Gemini 2.5 Flash
* React + Vite
* Node.js + Express

---

# ✨ Key Features

* Developer Score
* Profile Analysis
* Repository Analysis
* Technology Stack Visualization
* Activity Analytics
* Repository Quality Score
* Portfolio Readiness Score
* Most Starred Repository
* Most Forked Repository
* Activity Status & Streak
* PDF Report Download
* Share Profile
* AI GitHub Assistant
* One-click Reanalyze

---

# 📸 Screenshots

## Dashboard

---
<img width="667" height="826" alt="Dashboard page" src="https://github.com/user-attachments/assets/9e05c3fa-0352-475f-8073-bb1ff679aa18" />


## AI Assistant

---
<img width="648" height="829" alt="AI Chatbot" src="https://github.com/user-attachments/assets/03add6cb-4043-46da-9839-fe6f93c52c81" />


## PDF Export

---
<img width="1918" height="990" alt="image" src="https://github.com/user-attachments/assets/5b41aa01-342f-4ec3-886c-8766ed32d680" />


# 🏗 High-Level Architecture

```text
                    GitHub Talent Analyzer
                           (Extension)

                  ┌──────────────────────┐
                  │                      │
                  ▼                      ▼

            Analytics Dashboard      AI Assistant

                  │                      │
                  ▼                      ▼

                Backend API       Intelligent Router

                  │                      │
                  ▼                      ▼

            GitHub REST API      Dashboard Context
                                         │
                                         ▼
                                GitHub Remote MCP
                                         │
                                         ▼
                                Available Tool Cache
                                         │
                                         ▼
                               Gemini Tool Selection
                                         │
                                         ▼
                                  Tool Execution
                                         │
                                         ▼
                                 Structured Results
                                         │
                                         ▼
                               Gemini Answer Formatter
                                         │
                                         ▼
                                   Final Response
```

---

# 🌐 Remote GitHub MCP Integration

This project uses the official GitHub Remote MCP Server.

Official Repository:

https://github.com/github/github-mcp-server

---

## Server Startup Flow

```text
Connect Remote GitHub MCP Server
            │
            ▼
        tools/list
            │
            ▼
Fetch Available Tools
            │
            ▼
Cache Tools In Memory
            │
            ▼
Ready To Serve Requests
```

---

## AI Assistant Workflow

```text
User Question
      │
      ▼
Determine Source
      │
      ├──────── Dashboard Context
      │              │
      │              ▼
      │       Context-based Answer
      │
      ▼
GitHub MCP Route
      │
      ▼
Gemini Tool Selection
      │
      ▼
Tool Validation
      │
      ▼
Remote GitHub MCP Server
      │
      ▼
Structured Result
      │
      ▼
Gemini Response Formatter
      │
      ▼
Human Readable Answer
```

---

# 📊 MODULE 0 : Developer Profile & Score

Displays:

* Username
* Location
* Website
* Developer Score

### Factors

| Factor              | Included |
| ------------------- | -------- |
| Followers           | ✅        |
| Public Repositories | ✅        |
| Stars               | ✅        |
| Forks               | ✅        |
| Activity Status     | ✅        |
| Portfolio Quality   | ✅        |

### Levels

* Beginner
* Intermediate
* Advanced
* Expert

---

# 👤 MODULE 1 : Profile Analysis

Provides:

* Followers Count
* Following Count
* Public Repository Count
* Recent Active Repository

---

# 📁 MODULE 2 : Repository Analysis

Calculates:

* Total Repositories
* Total Stars
* Total Forks
* Top Repository

### Priority

1. Highest Stars
2. Highest Forks
3. Most Recently Updated

---

# 💻 MODULE 3 : Technology Stack Analysis

Identifies technologies used by the developer.

Displays:

* Top Languages
* Percentage Usage
* Language Distribution

Visualization:

* Pie Chart

---

# 📈 MODULE 4 : Activity Analysis

Tracks developer consistency over the last 12 months.

Metrics:

```json
{
 "month":"Feb",
 "commits":2,
 "pullRequests":0,
 "repositoriesCreated":1
}
```

Visualization:

* Area Chart

---

# 📚 MODULE 5 : Repository Quality

### Score Formula

README → 30%

Description → 30%

Topics → 20%

Documentation → 20%

Rule:

README word count > 100 → Full Documentation Score

Maximum Score:

```text
100%
```

---

# 🎯 MODULE 6 : Portfolio Readiness

Evaluation Factors

| Factor              | Weight |
| ------------------- | ------ |
| Bio                 | 15     |
| Profile Photo       | 15     |
| Website             | 15     |
| Pinned Repositories | 20     |
| README Quality      | 20     |
| Public Repositories | 15     |

Maximum Score

```text
100%
```

---

# ⭐ MODULE 7 : Most Starred Repository

Displays:

* Repository Link
* Star Count
* Main Language

Priority

1. Highest Stars
2. Most Recently Updated

---

# 🍴 MODULE 8 : Most Forked Repository

Displays:

* Repository Link
* Fork Count
* Main Language

Priority

1. Highest Forks
2. Most Recently Updated

---

# 🔥 MODULE 9 : Activity Status

### Status

| Commits (Last 30 Days) | Result        |
| ---------------------- | ------------- |
| ≥20                    | Highly Active |
| 10-19                  | Moderate      |
| 1-9                    | Low           |
| 0                      | Inactive      |

Also Calculates:

* Last Active
* Activity Streak

---

# ⚡ MODULE 10 : Bottom Actions

### Reanalyze

Fetch latest GitHub insights.

### Download

Generate PDF report.

### Share

Share profile insights.

### AI Chatbot

Ask GitHub-related questions using MCP tools.

---

# 🤖 AI Assistant

Model:

Gemini 2.5 Flash (Free Tier)

Current Limit:

```text
10 Chats / Day
```

---

## Architecture

The chatbot is NOT a general-purpose LLM assistant.

Gemini is only used for:

### Tool Selection

Examples:

* search_repositories
* search_users
* get_me
* pull_requests
* issues

### Response Formatting

Convert structured tool output into human-readable responses.

---

# ⚠ Limitations

Because responses depend on MCP tools and Gemini:

* Answers may occasionally be inaccurate.
* Hallucinations are possible.
* Irrelevant responses may occur.
* Best suited for GitHub-related questions.

---

# 🛠 Tech Stack

## Frontend

* React
* Vite
* JavaScript
* CSS
* Axios
* Recharts
* jsPDF
* html2canvas
* Lucide React
* React Icons

---

## Backend

* Node.js
* Express.js
* Axios

---

## AI

* Gemini 2.5 Flash

---

## APIs

### GitHub REST API

Used for:

* Profiles
* Repositories
* Commits
* Pull Requests
* README Analysis

---

### GitHub Remote MCP Server

Used for:

* Repository Search
* User Search
* Pull Requests
* Issues
* Commits
* Files

---

# 🌍 Official Resources

## Backend API

https://github-talent-analyzer-api.onrender.com

---

## Google Gemini AI Studio

https://aistudio.google.com/app/apikey

---

## GitHub MCP Server

https://github.com/github/github-mcp-server

---

## Microsoft Edge Partner Dashboard

https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview

---

## GitHub REST API Documentation

https://docs.github.com/en/rest

---

# 🚀 Local Setup

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/github-talent-analyzer.git
```

---

## Backend

```bash
cd Backend

npm install

npm run dev
```

Runs on:

```text
http://localhost:5000
```

---

## Frontend

```bash
cd Frontend

npm install

npm run dev
```

Runs on:

```text
http://localhost:5173
```

---

# 🔐 Environment Variables

```env
PORT=5000

GITHUB_API=https://api.github.com

GITHUB_TOKEN=YOUR_GITHUB_PAT

GITHUB_MCP_PAT=YOUR_GITHUB_PAT

GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

---

# 🛡 Production Features

✅ Modular Architecture

✅ Context-Based AI Routing

✅ Remote MCP Tool Cache

✅ Centralized Error Handling

✅ Async Middleware

✅ Axios Interceptors

✅ Request Timeout Handling

✅ Environment Variables

✅ Dashboard + MCP Hybrid AI

✅ Production-ready Backend Structure

---

# 📦 Publication Status

### Microsoft Edge Add-on

Status

```text
Submitted
```

Current State

```text
Under Review
```

---

# 🚀 Future Roadmap

* Compare Developers
* Team Analytics
* Resume Generator
* Authentication
* Saved Reports
* Database Support
* Cloud Sync
* Recruiter Dashboard
* Developer Ranking

---

# 👨‍💻 Author

## Sunil Kumar P

MERN Stack Developer

Interested In:

* Web Development
* AI Integrations
* Cloud Computing

---

# ⭐ Support

If you found this project useful, please consider giving it a star ⭐

---

Built with ❤️ using React, Node.js, GitHub REST API, GitHub Remote MCP Server and Gemini AI.
