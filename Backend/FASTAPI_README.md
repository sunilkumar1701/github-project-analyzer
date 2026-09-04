# GitHub Talent Analyzer — FastAPI Backend

AI-powered GitHub developer profile analysis backend built with FastAPI.

## Tech Stack

- **Python 3.11+**
- **FastAPI** — async web framework
- **httpx** — async HTTP client for GitHub REST API and MCP
- **Pydantic** — request/response validation
- **Google Gemini** — AI tool selection and answer generation
- **GitHub Remote MCP Server** — tool execution via JSON-RPC

## Quick Start

### 1. Create Virtual Environment

```bash
cd Backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `GITHUB_API` | GitHub REST API base URL |
| `GITHUB_TOKEN` | GitHub Personal Access Token |
| `GITHUB_MCP_PAT` | GitHub PAT for MCP Server |
| `GEMINI_API_KEY` | Google Gemini API key |

### 4. Run Development Server

```bash
uvicorn app.main:app --reload --port 5000
```

### 5. Run Tests

```bash
pytest tests/ -v
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/api/github/profile/{username}` | Basic profile info |
| `GET` | `/api/github/analysis/{username}` | Profile analysis |
| `GET` | `/api/github/repository-analysis/{username}` | Repository analysis |
| `GET` | `/api/github/technology-stack/{username}` | Technology stack |
| `GET` | `/api/github/activity-analysis/{username}` | Activity analysis |
| `GET` | `/api/github/repository-quality/{username}` | Repository quality |
| `GET` | `/api/github/portfolio-readiness/{username}` | Portfolio readiness |
| `GET` | `/api/github/most-starred-repository/{username}` | Most starred repo |
| `GET` | `/api/github/most-forked-repository/{username}` | Most forked repo |
| `GET` | `/api/github/activity-status/{username}` | Activity status |
| `GET` | `/api/github/developer-score/{username}` | Developer score |
| `POST` | `/api/chat` | AI chat assistant |

## API Documentation

- **Swagger UI**: [http://localhost:5000/docs](http://localhost:5000/docs)
- **ReDoc**: [http://localhost:5000/redoc](http://localhost:5000/redoc)

## Project Structure

```
Backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── core/
│   │   └── config.py        # Pydantic Settings configuration
│   ├── api/routes/           # HTTP route handlers
│   ├── controllers/          # Request/response orchestration
│   ├── services/             # Business logic
│   ├── clients/              # External API clients (GitHub, Gemini, MCP)
│   ├── mcp/                  # MCP tool cache and test client
│   ├── schemas/              # Pydantic request/response models
│   ├── middleware/           # Error handling and logging
│   └── utils/                # Helper utilities
├── tests/                    # pytest test suite
├── requirements.txt
├── .env.example
└── README.md
```

## Deployment (Render)

Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Build command:

```bash
pip install -r requirements.txt
```

## Architecture

```
Routes → Controllers → Services → Clients / External APIs
```

- **Routes**: HTTP routing only
- **Controllers**: Request validation and response orchestration
- **Services**: Business logic and calculations
- **Clients**: External API communication (GitHub, Gemini, MCP)
