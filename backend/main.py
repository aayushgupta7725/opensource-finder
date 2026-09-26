import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from agent import run_workflow

app = FastAPI(title="OpenStep API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserProfile(BaseModel):
    languages: str = Field(..., description="Primary programming language(s)")
    skills: str    = Field(..., description="Specific skills/frameworks")
    interest: str  = Field(..., description="Area of interest (e.g. Data/ML)")
    experience: str = Field(..., description="Experience level (Beginner/Intermediate/Advanced)")
    time: str      = Field(..., description="Available time per week (e.g. 5 hours)")
    keywords: Optional[str] = Field("", description="Optional extra keywords")


class AgentRequest(BaseModel):
    profile: UserProfile


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    groq_key_set   = bool(os.getenv("GROQ_API_KEY") and os.getenv("GROQ_API_KEY") != "your_groq_api_key_here")
    github_key_set = bool(os.getenv("GITHUB_TOKEN"))
    return {
        "status":         "ok",
        "groq_configured":   groq_key_set,
        "github_configured": github_key_set,
    }


# ── Main workflow endpoint ────────────────────────────────────────────────────
@app.post("/api/run-workflow")
async def execute_workflow(request: AgentRequest):
    # Validate keys before starting
    if not os.getenv("GROQ_API_KEY") or os.getenv("GROQ_API_KEY") == "your_groq_api_key_here":
        raise HTTPException(
            status_code=400,
            detail="GROQ_API_KEY is not configured. Add it to backend/.env and restart the server."
        )

    try:
        result = await run_workflow(request.profile.dict())

        final_recs   = result.get("final_recommendations", [])
        healthy_repos = result.get("healthy_repos", [])
        candidates   = result.get("candidate_repos", [])
        pipeline_log = result.get("pipeline_log", [])

        return {
            "status": "success",
            "data": {
                "final_recommendations": final_recs,
                "healthy_repos":         healthy_repos,
                "candidate_repos":       candidates,
                "pipeline_log":          pipeline_log,
                "counts": {
                    "candidates":    len(candidates),
                    "healthy":       len(healthy_repos),
                    "pruned":        max(0, len(candidates) - len(healthy_repos)),
                    "matched_issues": len(final_recs),
                },
            },
        }

    except ValueError as e:
        # Config errors (missing API key etc.)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workflow error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
