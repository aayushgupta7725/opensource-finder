# OpenStep — Autonomous Open Source Contributor Copilot

OpenStep is a multi-agent AI copilot that finds the perfect first open source issue for any developer. Describe your skills and availability in plain language, and a LangGraph pipeline of specialized agents searches GitHub in real time, scores repositories for beginner-friendliness, ranks issues by fit, and generates a full contribution brief — ready to clone, implement, and submit.

---

## Features

- **Natural language intake** — no forms, just describe yourself
- **Discovery Agent** — queries GitHub REST API with profile-matched search terms
- **Repo Health Agent** — scores maintainer responsiveness, SLA, and beginner-friendliness using real commit/issue data + Groq LLM reasoning
- **Issue Matching Agent** — fetches real `good-first-issue` labelled issues and ranks them against your skill profile
- **Onboarding Agent** — reads each repo's README and CONTRIBUTING guide, then generates a structured contribution brief with CLI commands, target files, and a ready-to-send maintainer comment
- **Manager Watchdog** — LangGraph conditional router with loop-safe search expansion fallback

---

## Tech Stack

### Frontend
| Technology | Version |
|---|---|
| React | 19 |
| Vite | 8 |
| Tailwind CSS | 3.4 |
| Material Symbols (Google Fonts) | — |
| JetBrains Mono + Inter (Google Fonts) | — |

### Backend
| Technology | Version |
|---|---|
| Python | 3.11+ |
| FastAPI | 0.141 |
| Uvicorn | 0.54 |
| LangGraph | 1.2 |
| LangChain | 1.4 |
| langchain-groq | 1.1 |
| Groq LLM (llama3-70b-8192) | — |
| httpx | 0.28 |
| Pydantic | 2.13 |

### APIs
- **GitHub REST API** — repository search, issues, commits, file contents
- **Groq API** — LLM inference for health scoring, issue ranking, and brief generation

---

## Project Structure

```
opensource-finder/
├── backend/
│   ├── agent.py          # LangGraph pipeline (4 agents + manager router)
│   ├── main.py           # FastAPI app with /api/run-workflow and /api/health
│   ├── .env              # Secret keys (not committed)
│   └── .env.example      # Template for required environment variables
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Full UI — chat feed, sidebar, all agent output components
│   │   ├── index.css     # Tailwind base + global styles
│   │   └── main.jsx      # React entry point
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## Installation & Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- A [Groq API key](https://console.groq.com) (free tier works)
- A [GitHub Personal Access Token](https://github.com/settings/tokens) — only `public_repo` read scope needed (optional but recommended to avoid rate limits)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/opensource-finder.git
cd opensource-finder
```

---

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn langgraph langchain langchain-groq langchain-core httpx python-dotenv pydantic
```

Create your `.env` file from the example:

```bash
cp .env.example .env
```

Open `.env` and fill in your keys:

```env
GROQ_API_KEY=your_groq_api_key_here
GITHUB_TOKEN=your_github_token_here
```

Start the backend server:

```bash
python main.py
```

The API will be available at `http://localhost:8000`. Visit `http://localhost:8000/api/health` to confirm it is running.

---

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

### 4. Using the app

1. Open `http://localhost:5173` in your browser
2. Describe yourself in the chat input, for example:
   > *"I'm a Python developer with Pandas and NumPy, 5 hours a week, interested in data processing."*
3. The agent pipeline will run and return:
   - Healthy repository candidates with health scores and maintainer SLA
   - Top matching issues ranked by fit
   - A full contribution brief for the best issue including CLI setup commands and a ready-to-send GitHub comment

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key for LLM inference |
| `GITHUB_TOKEN` | Recommended | GitHub Personal Access Token — avoids the 60 req/hr unauthenticated rate limit |

---

## Available Scripts

### Backend
| Command | Description |
|---|---|
| `python main.py` | Start the FastAPI development server with hot reload |

### Frontend
| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint |
