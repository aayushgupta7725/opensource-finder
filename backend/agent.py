import os
from typing import TypedDict, List, Dict, Any, Annotated
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

# Define the state for the LangGraph
class AgentState(TypedDict):
    profile: Dict[str, str]
    candidate_repos: List[Dict[str, Any]]
    healthy_repos: List[Dict[str, Any]]
    matched_issues: List[Dict[str, Any]]
    final_recommendations: List[Dict[str, Any]]
    status: str

# Initialize the Groq LLM (Ensure GROQ_API_KEY is in .env)
def get_llm():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key == "your_groq_api_key_here":
        raise ValueError("Please provide a valid GROQ_API_KEY in the .env file")
    return ChatGroq(temperature=0, groq_api_key=api_key, model_name="llama3-70b-8192")

# Agents
def discovery_agent(state: AgentState):
    print("Running Discovery Agent...")
    profile = state["profile"]
    
    # In a real app, this would use the GitHub API
    # Mocking for MVP
    state["candidate_repos"] = [
        {"name": "great-expectations", "url": "https://github.com/great-expectations/great_expectations", "language": profile.get("languages", "Python")},
        {"name": "polars", "url": "https://github.com/pola-rs/polars", "language": "Rust/Python"},
        {"name": "sqlmodel", "url": "https://github.com/tiangolo/sqlmodel", "language": "Python"}
    ]
    return {"candidate_repos": state["candidate_repos"]}

def repo_health_agent(state: AgentState):
    print("Running Repo Health Agent...")
    # Mocking Health Check
    healthy = []
    for repo in state.get("candidate_repos", []):
        repo["health_score"] = 90
        repo["active"] = True
        healthy.append(repo)
    
    return {"healthy_repos": healthy}

def issue_matching_agent(state: AgentState):
    print("Running Issue Matching Agent...")
    # Mocking Issue Matching
    healthy = state.get("healthy_repos", [])
    
    if not healthy:
        return {"status": "expand_search"}
        
    issues = [
        {"issue_id": "#6184", "title": "Add CSV export support for custom validation summaries", "repo": "great-expectations/great_expectations", "match_score": 96, "difficulty": "Beginner", "effort": "2-4 hours"}
    ]
    
    return {"matched_issues": issues, "status": "issues_found"}

def onboarding_agent(state: AgentState):
    print("Running Onboarding Agent...")
    # Generate the brief using LLM or mock
    
    final_recs = []
    for issue in state.get("matched_issues", []):
        issue["brief"] = "This is a mock onboarding brief for issue " + issue["title"]
        final_recs.append(issue)
        
    return {"final_recommendations": final_recs, "status": "done"}

def manager_router(state: AgentState):
    print("Manager evaluating state...")
    if state.get("status") == "expand_search":
        return "expand_search"
    if state.get("status") == "issues_found":
        return "onboarding"
    return "end"

# Build Graph
workflow = StateGraph(AgentState)

workflow.add_node("discovery", discovery_agent)
workflow.add_node("repo_health", repo_health_agent)
workflow.add_node("issue_matching", issue_matching_agent)
workflow.add_node("onboarding", onboarding_agent)

workflow.set_entry_point("discovery")
workflow.add_edge("discovery", "repo_health")
workflow.add_edge("repo_health", "issue_matching")

# Routing based on issues found
workflow.add_conditional_edges(
    "issue_matching",
    manager_router,
    {
        "expand_search": "discovery", # loops back
        "onboarding": "onboarding",
        "end": END
    }
)

workflow.add_edge("onboarding", END)

app_graph = workflow.compile()

async def run_workflow(profile_dict):
    initial_state = {
        "profile": profile_dict,
        "candidate_repos": [],
        "healthy_repos": [],
        "matched_issues": [],
        "final_recommendations": [],
        "status": "start"
    }
    
    # Run the graph
    result = app_graph.invoke(initial_state)
    return result
