import os
import re
import json
import base64
import asyncio
import httpx
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv

load_dotenv()

# ── LLM ───────────────────────────────────────────────────────────────────────
def get_llm() -> ChatGroq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key == "your_groq_api_key_here":
        raise ValueError("Please set a valid GROQ_API_KEY in the .env file")
    return ChatGroq(temperature=0, groq_api_key=api_key, model_name="llama3-70b-8192")

# ── GitHub sync helper ────────────────────────────────────────────────────────
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
GH_HEADERS = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    **({"Authorization": f"Bearer {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}),
}

def gh_get(url: str, params: dict = None):
    """Synchronous GitHub API call — safe to call from LangGraph sync nodes."""
    with httpx.Client(timeout=15) as client:
        r = client.get(url, headers=GH_HEADERS, params=params)
        r.raise_for_status()
        return r.json()

# ── State ─────────────────────────────────────────────────────────────────────
class AgentState(TypedDict):
    profile:               Dict[str, str]
    candidate_repos:       List[Dict[str, Any]]
    healthy_repos:         List[Dict[str, Any]]
    matched_issues:        List[Dict[str, Any]]
    final_recommendations: List[Dict[str, Any]]
    pipeline_log:          List[str]
    search_expanded:       bool
    status:                str


# ─────────────────────────────────────────────────────────────────────────────
# NODE 1 — Discovery Agent  (sync def — required by LangGraph sync invoke)
# ─────────────────────────────────────────────────────────────────────────────
def discovery_agent(state: AgentState) -> dict:
    print("▶ Discovery Agent running…")
    profile  = state["profile"]
    log      = list(state.get("pipeline_log", []))
    expanded = state.get("search_expanded", False)

    language = profile.get("languages", "Python").split(",")[0].strip()
    keywords = (profile.get("keywords") or profile.get("interest") or "").strip()
    topic    = keywords.lower().replace(" ", "-") if keywords else "open-source"

    if expanded:
        queries = [
            f"language:{language} stars:>100 good-first-issues:>1 is:public",
            f"language:{language} {profile.get('interest', '')} stars:>50 is:public",
        ]
    else:
        queries = [
            f"language:{language} topic:{topic} stars:>500 is:public",
            f"language:{language} {keywords} good-first-issues:>3 stars:>200 is:public",
        ]

    repos: Dict[str, Any] = {}
    for q in queries:
        try:
            data = gh_get(
                "https://api.github.com/search/repositories",
                params={"q": q, "sort": "updated", "per_page": 10},
            )
            for r in data.get("items", []):
                if r["full_name"] not in repos:
                    repos[r["full_name"]] = {
                        "name":        r["full_name"],
                        "url":         r["html_url"],
                        "description": r.get("description") or "",
                        "language":    r.get("language") or language,
                        "stars":       r.get("stargazers_count", 0),
                        "forks":       r.get("forks_count", 0),
                        "open_issues": r.get("open_issues_count", 0),
                        "updated_at":  r.get("updated_at", ""),
                        "topics":      r.get("topics", []),
                    }
        except Exception as e:
            print(f"  GitHub search error: {e}")

    candidates = list(repos.values())[:15]
    log.append(f"Discovery Agent: found {len(candidates)} candidate repos")
    print(f"  → {len(candidates)} candidates")
    return {"candidate_repos": candidates, "pipeline_log": log}


# ─────────────────────────────────────────────────────────────────────────────
# NODE 2 — Repo Health Agent  (sync def)
# ─────────────────────────────────────────────────────────────────────────────
def _score_from_github_data(repo: dict, recent_commits: int, good_first_count: int,
                             has_contributing: bool, last_commit_date: str) -> dict:
    """
    Derive a unique health score and SLA from real GitHub data.
    Used as the primary source — LLM result overrides this when it parses cleanly.
    """
    stars = repo.get("stars", 0)
    open_issues = repo.get("open_issues", 0)

    # Score components (out of 100)
    star_score = min(30, int(stars / 1000 * 10))           # up to 30 pts
    commit_score = min(25, recent_commits * 5)              # up to 25 pts (5 per commit)
    gfi_score = min(20, good_first_count * 4)               # up to 20 pts
    contrib_score = 10 if has_contributing else 0            # 10 pts
    issue_score = min(15, max(0, 15 - int(open_issues / 50))) # 15 pts, penalise huge backlogs
    score = star_score + commit_score + gfi_score + contrib_score + issue_score

    # SLA estimate from commit recency
    sla = "unknown"
    if last_commit_date:
        try:
            from datetime import datetime, timezone
            last = datetime.fromisoformat(last_commit_date.replace("Z", "+00:00"))
            days_ago = (datetime.now(timezone.utc) - last).days
            if days_ago <= 1:
                sla = "< 24 hours"
            elif days_ago <= 3:
                sla = "~1-3 days"
            elif days_ago <= 7:
                sla = "~1 week"
            elif days_ago <= 30:
                sla = "~2-4 weeks"
            else:
                sla = "> 1 month"
        except Exception:
            pass

    # Verdict from score
    if score >= 85:
        verdict = "certified"
    elif score >= 70:
        verdict = "high_velocity"
    else:
        verdict = "welcoming"

    # Reason built from facts
    parts = []
    if good_first_count > 0:
        parts.append(f"{good_first_count} good-first-issue{'s' if good_first_count > 1 else ''} available")
    if recent_commits >= 3:
        parts.append("actively maintained")
    if has_contributing:
        parts.append("has CONTRIBUTING guide")
    if stars >= 1000:
        parts.append(f"{stars:,} stars")
    reason = ", ".join(parts) if parts else "active open-source project"

    return {
        "health_score":      max(0, min(100, score)),
        "maintainer_sla":    sla,
        "beginner_friendly": good_first_count > 0 or has_contributing,
        "reason":            reason.capitalize() + ".",
        "verdict":           verdict,
    }


def repo_health_agent(state: AgentState) -> dict:
    print("▶ Repo Health Agent running…")
    candidates = state.get("candidate_repos", [])
    log        = list(state.get("pipeline_log", []))
    llm        = get_llm()
    healthy    = []

    for repo in candidates[:15]:
        name = repo["name"]

        # ── Fetch real GitHub data first ──────────────────────────────────────
        issues_data     = []
        commits_data    = []
        has_contributing = False
        last_commit_date = repo.get("updated_at", "")

        try:
            issues_data = gh_get(
                f"https://api.github.com/repos/{name}/issues",
                params={"state": "open", "per_page": 10, "sort": "updated"},
            )
        except Exception as e:
            print(f"  Issues fetch failed for {name}: {e}")

        try:
            commits_data = gh_get(
                f"https://api.github.com/repos/{name}/commits",
                params={"per_page": 5},
            )
            if isinstance(commits_data, list) and commits_data:
                last_commit_date = (
                    commits_data[0]
                    .get("commit", {})
                    .get("author", {})
                    .get("date", last_commit_date)
                )
        except Exception as e:
            print(f"  Commits fetch failed for {name}: {e}")

        try:
            gh_get(f"https://api.github.com/repos/{name}/contents/CONTRIBUTING.md")
            has_contributing = True
        except Exception:
            pass

        good_first_count = sum(
            1 for i in (issues_data if isinstance(issues_data, list) else [])
            if isinstance(i, dict) and any(
                lbl.get("name", "").lower() in ("good first issue", "good-first-issue", "beginner")
                for lbl in i.get("labels", [])
            )
        )
        recent_commits = len(commits_data) if isinstance(commits_data, list) else 0

        # ── Compute score from real data (always unique per repo) ─────────────
        computed = _score_from_github_data(
            repo, recent_commits, good_first_count, has_contributing, last_commit_date
        )

        # ── Try LLM for richer qualitative fields; fall back to computed ──────
        try:
            prompt = f"""You are a repository health evaluator for open-source contributors.

Repository: {name}
Description: {repo.get('description', 'N/A')}
Language: {repo.get('language')}
Stars: {repo.get('stars')}
Open issues: {repo.get('open_issues')}
Recent commits (last 5): {recent_commits}
Good-first-issue count: {good_first_count}
Has CONTRIBUTING.md: {has_contributing}
Last commit: {last_commit_date}

Rate this repository for a beginner contributor. Return ONLY valid JSON, no markdown:
{{
  "health_score": <integer 0-100>,
  "maintainer_sla": "<e.g. '< 6 hours' | '~1-2 days' | '~1 week' | '> 2 weeks'>",
  "beginner_friendly": <true|false>,
  "reason": "<one concrete sentence using actual repo facts>",
  "verdict": "<certified | high_velocity | welcoming | skip>"
}}"""
            resp  = llm.invoke([HumanMessage(content=prompt)])
            raw   = resp.content.strip()
            m     = re.search(r'\{.*\}', raw, re.DOTALL)
            llm_health = json.loads(m.group()) if m else {}

            # Validate — reject if LLM returned default-looking garbage
            llm_score = llm_health.get("health_score")
            llm_sla   = llm_health.get("maintainer_sla", "")
            valid_score = isinstance(llm_score, int) and 0 <= llm_score <= 100
            valid_sla   = isinstance(llm_sla, str) and llm_sla.strip() not in ("", "unknown", "N/A")

            health = {
                "health_score":      llm_score if valid_score else computed["health_score"],
                "maintainer_sla":    llm_sla   if valid_sla   else computed["maintainer_sla"],
                "beginner_friendly": llm_health.get("beginner_friendly", computed["beginner_friendly"]),
                "reason":            llm_health.get("reason",  "").strip() or computed["reason"],
                "verdict":           llm_health.get("verdict", computed["verdict"]),
            }
        except Exception as e:
            print(f"  LLM health scoring failed for {name}: {e} — using computed score")
            health = computed

        score = health["health_score"]
        if score >= 60:
            repo.update(health)
            healthy.append(repo)
        else:
            print(f"  Pruned {name} (score={score})")

    log.append(f"Repo Health Agent: {len(candidates) - len(healthy)} pruned, {len(healthy)} certified active")
    print(f"  → {len(healthy)} healthy repos")
    return {"healthy_repos": healthy, "pipeline_log": log}


# ─────────────────────────────────────────────────────────────────────────────
# NODE 3 — Issue Matching Agent  (sync def)
# ─────────────────────────────────────────────────────────────────────────────
def issue_matching_agent(state: AgentState) -> dict:
    print("▶ Issue Matching Agent running…")
    healthy = state.get("healthy_repos", [])
    profile = state["profile"]
    log     = list(state.get("pipeline_log", []))
    llm     = get_llm()

    if not healthy:
        log.append("Issue Matcher: no healthy repos — triggering search expansion")
        return {"matched_issues": [], "status": "expand_search", "pipeline_log": log}

    all_issues: List[Dict[str, Any]] = []

    # Try good-first-issue label first
    for repo in healthy[:4]:
        name = repo["name"]
        try:
            data = gh_get(f"https://api.github.com/repos/{name}/issues",
                          params={"state": "open", "labels": "good first issue",
                                  "per_page": 8, "sort": "updated"})
            for iss in (data if isinstance(data, list) else []):
                if "pull_request" in iss:
                    continue
                all_issues.append({
                    "repo":     name,
                    "repo_url": repo["url"],
                    "issue_id": f"#{iss['number']}",
                    "title":    iss["title"],
                    "body":     (iss.get("body") or "")[:400],
                    "url":      iss["html_url"],
                    "labels":   [l["name"] for l in iss.get("labels", [])],
                    "comments": iss.get("comments", 0),
                })
        except Exception as e:
            print(f"  Issue fetch failed for {name}: {e}")

    # Fallback — any open issues
    if not all_issues:
        for repo in healthy[:2]:
            name = repo["name"]
            try:
                data = gh_get(f"https://api.github.com/repos/{name}/issues",
                              params={"state": "open", "per_page": 6, "sort": "updated"})
                for iss in (data if isinstance(data, list) else []):
                    if "pull_request" in iss:
                        continue
                    all_issues.append({
                        "repo":     name,
                        "repo_url": repo["url"],
                        "issue_id": f"#{iss['number']}",
                        "title":    iss["title"],
                        "body":     (iss.get("body") or "")[:400],
                        "url":      iss["html_url"],
                        "labels":   [l["name"] for l in iss.get("labels", [])],
                        "comments": iss.get("comments", 0),
                    })
            except Exception:
                pass

    if not all_issues:
        log.append("Issue Matcher: no issues found — triggering search expansion")
        return {"matched_issues": [], "status": "expand_search", "pipeline_log": log}

    issues_summary = "\n".join(
        f"{i+1}. [{iss['repo']} {iss['issue_id']}] {iss['title']} — labels: {', '.join(iss['labels']) or 'none'}"
        for i, iss in enumerate(all_issues[:12])
    )

    prompt = f"""You are an expert open-source contribution advisor.

User profile:
- Languages: {profile.get('languages')}
- Skills: {profile.get('skills')}
- Interest area: {profile.get('interest')}
- Experience level: {profile.get('experience')}
- Available time: {profile.get('time')} per week

Open issues to evaluate:
{issues_summary}

Score every issue and return ONLY a valid JSON array (no markdown, no extra text):
[
  {{
    "index": 1,
    "match_score": 92,
    "difficulty": "Beginner",
    "effort": "2-4 hours",
    "stack_alignment": "95% (Python + Pandas)",
    "blast_radius": "Low (Isolated)",
    "reason": "one sentence why this fits the user"
  }}
]
Include ALL {min(len(all_issues), 12)} issues. Sort by match_score descending."""

    try:
        resp   = llm.invoke([HumanMessage(content=prompt)])
        raw    = resp.content.strip()
        m      = re.search(r'\[.*\]', raw, re.DOTALL)
        scores = json.loads(m.group()) if m else []
    except Exception as e:
        print(f"  LLM scoring error: {e}")
        scores = [{"index": i+1, "match_score": 70, "difficulty": "Beginner",
                   "effort": "3-5 hours", "stack_alignment": "Good match",
                   "blast_radius": "Low", "reason": "Matches your profile"}
                  for i in range(len(all_issues))]

    score_map = {s["index"]: s for s in scores if "index" in s}
    matched = []
    for i, issue in enumerate(all_issues[:12]):
        s = score_map.get(i + 1, {})
        issue.update({
            "match_score":     s.get("match_score", 65),
            "difficulty":      s.get("difficulty", "Beginner"),
            "effort":          s.get("effort", "unknown"),
            "stack_alignment": s.get("stack_alignment", ""),
            "blast_radius":    s.get("blast_radius", "Low"),
            "reason":          s.get("reason", ""),
        })
        matched.append(issue)

    matched.sort(key=lambda x: x["match_score"], reverse=True)
    matched = matched[:5]

    log.append(f"Issue Matcher: scored {len(all_issues)} issues, top 5 selected (best: {matched[0]['match_score']}%)")
    print(f"  → {len(matched)} matched issues")
    return {"matched_issues": matched, "status": "issues_found", "pipeline_log": log}


# ─────────────────────────────────────────────────────────────────────────────
# NODE 4 — Onboarding Agent  (sync def)
# ─────────────────────────────────────────────────────────────────────────────
def onboarding_agent(state: AgentState) -> dict:
    print("▶ Onboarding Agent running…")
    issues  = state.get("matched_issues", [])
    profile = state["profile"]
    log     = list(state.get("pipeline_log", []))
    llm     = get_llm()

    if not issues:
        return {"final_recommendations": [], "status": "done", "pipeline_log": log}

    final_recs = []
    for issue in issues:
        repo_name = issue["repo"]
        readme_text = contributing_text = ""

        for fname in ["README.md", "readme.md"]:
            try:
                data = gh_get(f"https://api.github.com/repos/{repo_name}/contents/{fname}")
                readme_text = base64.b64decode(data["content"]).decode("utf-8", errors="ignore")[:2000]
                break
            except Exception:
                pass

        for fname in ["CONTRIBUTING.md", "contributing.md", "docs/contributing.md"]:
            try:
                data = gh_get(f"https://api.github.com/repos/{repo_name}/contents/{fname}")
                contributing_text = base64.b64decode(data["content"]).decode("utf-8", errors="ignore")[:1500]
                break
            except Exception:
                pass

        repo_url = issue.get("repo_url", f"https://github.com/{repo_name}")
        repo_short = repo_name.split("/")[-1]

        prompt = f"""You are an expert open-source contribution guide generator.

User profile:
- Languages: {profile.get('languages')}
- Skills: {profile.get('skills')}
- Interest: {profile.get('interest')}
- Experience: {profile.get('experience')}
- Time available: {profile.get('time')} per week

Issue:
- Repository: {repo_name}
- Issue ID: {issue['issue_id']}
- Title: {issue['title']}
- Body: {issue.get('body', 'N/A')}
- Match score: {issue['match_score']}%
- Estimated effort: {issue['effort']}

Repository context:
README (excerpt): {readme_text[:800] or 'Not available'}
CONTRIBUTING (excerpt): {contributing_text[:600] or 'Not available'}

Return ONLY valid JSON (no markdown fences, no extra text):
{{
  "deliverable": "one sentence describing exactly what code change is needed",
  "loc_estimate": "e.g. ~30-50 lines",
  "production_lines": "e.g. ~15 lines",
  "test_lines": "e.g. ~20 lines",
  "prerequisites": ["skill or tool 1", "skill or tool 2", "skill or tool 3"],
  "target_files": [
    {{"path": "path/to/file.py", "note": "what to change"}},
    {{"path": "tests/test_file.py", "note": "add tests"}}
  ],
  "setup_commands": [
    "git clone {repo_url}",
    "cd {repo_short}",
    "pip install -e ."
  ],
  "intro_comment": "a ready-to-send GitHub comment to the maintainer expressing interest",
  "implementation_hint": "2-3 sentences on how to approach the implementation"
}}"""

        try:
            resp  = llm.invoke([HumanMessage(content=prompt)])
            raw   = resp.content.strip()
            m     = re.search(r'\{.*\}', raw, re.DOTALL)
            brief = json.loads(m.group()) if m else {}
        except Exception as e:
            print(f"  Brief generation failed for {repo_name}: {e}")
            brief = {
                "deliverable":        issue["title"],
                "loc_estimate":       issue.get("effort", "unknown"),
                "production_lines":   "~20 lines",
                "test_lines":         "~15 lines",
                "prerequisites":      [profile.get("languages", "Python"), "git"],
                "target_files":       [{"path": "See issue description", "note": ""}],
                "setup_commands":     [f"git clone {repo_url}", f"cd {repo_short}", "pip install -e ."],
                "intro_comment":      f"Hi! I'd love to work on {issue['issue_id']}. Could you please assign it to me?",
                "implementation_hint": "Follow the existing patterns in the codebase.",
            }

        issue["brief"] = brief
        final_recs.append(issue)

    log.append(f"Onboarding Agent: generated briefs for {len(final_recs)} issues")
    print(f"  → Briefs generated")
    return {"final_recommendations": final_recs, "status": "done", "pipeline_log": log}


# ─────────────────────────────────────────────────────────────────────────────
# MANAGER ROUTER + expand node
# ─────────────────────────────────────────────────────────────────────────────
def manager_router(state: AgentState) -> str:
    print(f"▶ Manager Router: status={state.get('status')}, expanded={state.get('search_expanded')}")
    if state.get("status") == "expand_search":
        return "end" if state.get("search_expanded") else "expand_search"
    if state.get("status") == "issues_found":
        return "onboarding"
    return "end"


def mark_expanded(state: AgentState) -> dict:
    log = list(state.get("pipeline_log", []))
    log.append("Manager: expanding search scope and retrying Discovery Agent")
    return {"search_expanded": True, "pipeline_log": log}


# ─────────────────────────────────────────────────────────────────────────────
# BUILD LANGGRAPH  (all nodes are sync — compatible with .invoke())
# ─────────────────────────────────────────────────────────────────────────────
workflow = StateGraph(AgentState)
workflow.add_node("discovery",      discovery_agent)
workflow.add_node("repo_health",    repo_health_agent)
workflow.add_node("issue_matching", issue_matching_agent)
workflow.add_node("onboarding",     onboarding_agent)
workflow.add_node("expand",         mark_expanded)

workflow.set_entry_point("discovery")
workflow.add_edge("discovery",   "repo_health")
workflow.add_edge("repo_health", "issue_matching")
workflow.add_conditional_edges(
    "issue_matching",
    manager_router,
    {"expand_search": "expand", "onboarding": "onboarding", "end": END},
)
workflow.add_edge("expand",     "discovery")
workflow.add_edge("onboarding", END)

app_graph = workflow.compile()


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC ENTRY POINT
# Runs the sync LangGraph in a thread so it doesn't block FastAPI's event loop.
# ─────────────────────────────────────────────────────────────────────────────
async def run_workflow(profile_dict: dict) -> dict:
    initial_state: AgentState = {
        "profile":               profile_dict,
        "candidate_repos":       [],
        "healthy_repos":         [],
        "matched_issues":        [],
        "final_recommendations": [],
        "pipeline_log":          [],
        "search_expanded":       False,
        "status":                "start",
    }
    loop   = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, lambda: app_graph.invoke(initial_state))
    return result
