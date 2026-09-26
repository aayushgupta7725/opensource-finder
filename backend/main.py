from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from agent import run_workflow

app = FastAPI(title="OpenSource Finder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserProfile(BaseModel):
    languages: str
    skills: str
    interest: str
    experience: str
    time: str
    keywords: Optional[str] = ""

class AgentRequest(BaseModel):
    profile: UserProfile

@app.post("/api/run-workflow")
async def execute_workflow(request: AgentRequest):
    try:
        # Run the LangGraph agent workflow
        result = await run_workflow(request.profile.dict())
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
