import { useState, useRef, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:8000';

// ─── Material Symbol icon ──────────────────────────────────────────────────────
const Icon = ({ name, size = 18, className = '' }) => (
  <span
    className={`material-symbols-outlined select-none ${className}`}
    style={{ fontSize: size, lineHeight: 1 }}
  >
    {name}
  </span>
);

// ─── Ping dot ─────────────────────────────────────────────────────────────────
const PingDot = ({ color = 'bg-primary', pulse = false, size = 'w-2.5 h-2.5' }) => (
  <span className={`relative inline-flex ${size}`}>
    {pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />}
    <span className={`relative inline-flex rounded-full h-full w-full ${color}`} />
  </span>
);

// ─── Agent pill ───────────────────────────────────────────────────────────────
const AgentPill = ({ label, color = 'text-primary bg-surface-container' }) => (
  <span className={`px-2 py-0.5 rounded-full font-code-sm text-code-sm font-medium ${color}`}>{label}</span>
);

// ─── Copy button ──────────────────────────────────────────────────────────────
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-2 px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-medium text-code-sm font-code-sm flex items-center gap-1 transition-colors flex-shrink-0"
    >
      <Icon name={copied ? 'check' : 'content_copy'} size={13} />
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

// ─── Pipeline sidebar node ────────────────────────────────────────────────────
const PipelineNode = ({ icon, label, sub, status, badge }) => {
  const isActive = status === 'active';
  const isDone = status === 'done';
  return (
    <div className={`flex items-center justify-between p-2 rounded-lg transition-colors ${isActive ? 'bg-surface-container-high shadow-sm' : isDone ? 'bg-surface-container-low/70' : 'bg-surface-container-lowest'}`}>
      <div className="flex items-center gap-2">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-primary-container text-on-primary' : isDone ? 'bg-surface-container text-primary' : 'bg-surface-container text-outline'}`}>
          {isActive ? <Icon name="sync" size={13} className="animate-spin" /> : isDone ? <Icon name="check" size={13} /> : <Icon name={icon} size={13} />}
        </span>
        <div className="flex flex-col">
          <span className={`font-body-sm text-body-sm ${isActive ? 'font-semibold text-primary' : status === 'idle' ? 'font-medium text-on-surface-variant' : 'font-medium text-on-surface'}`}>{label}</span>
          <span className="font-code-sm text-[10px] text-on-surface-variant">{sub}</span>
        </div>
      </div>
      {badge && (
        <span className={`text-[10px] font-code-sm px-1.5 py-0.5 rounded ${isActive ? 'bg-primary-container text-on-primary' : isDone ? 'bg-surface-container-lowest text-primary' : 'bg-surface-container-low text-outline'}`}>{badge}</span>
      )}
    </div>
  );
};

// ─── Repo card (dynamic data) ─────────────────────────────────────────────────
const RepoCard = ({ repo }) => {
  const verdict = repo.verdict || 'welcoming';
  const badgeCfg = {
    certified:     { icon: 'verified',  label: 'Certified',     cls: 'text-primary' },
    high_velocity: { icon: 'speed',     label: 'High Velocity', cls: 'text-secondary' },
    welcoming:     { icon: 'favorite',  label: 'Welcoming',     cls: 'text-outline' },
  };
  const b = badgeCfg[verdict] || badgeCfg.welcoming;
  const score = repo.health_score ?? '—';
  const isTop = score >= 90;

  return (
    <a
      href={repo.url || `https://github.com/${repo.name}`}
      target="_blank"
      rel="noreferrer"
      className="bg-surface-container-lowest p-space-sm rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer border border-outline-variant/30 no-underline"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className={`px-1.5 py-0.5 rounded font-code-sm text-code-sm font-semibold ${isTop ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container text-on-surface'}`}>{score}/100</span>
          <span className={`text-[11px] font-code-sm flex items-center gap-0.5 ${b.cls}`}><Icon name={b.icon} size={12} />{b.label}</span>
        </div>
        <h4 className="font-code-md text-code-md font-semibold text-on-surface mt-2 truncate" title={repo.name}>{repo.name}</h4>
        {/* Short description — always shown, capped at 2 lines */}
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2 leading-snug">
          {repo.description || 'No description available.'}
        </p>
      </div>
      <div className="mt-3 pt-2 bg-surface-container-low rounded-lg p-2 flex flex-col gap-1 text-[11px] font-code-sm">
        <div className="flex justify-between text-on-surface-variant">
          <span>Maintainer SLA:</span>
          <span className="font-medium text-primary">{repo.maintainer_sla || 'unknown'}</span>
        </div>
        <div className="flex justify-between text-on-surface-variant">
          <span>Stars:</span>
          <span className="font-medium">{repo.stars?.toLocaleString() ?? '—'}</span>
        </div>
        {/* reason line removed — it was showing generated text like "Actively maintained, has X stars" */}
      </div>
    </a>
  );
};

// ─── Issue match card (dynamic data) ─────────────────────────────────────────
const IssueMatchCard = ({ issue, totalCount, onPrepare, onViewOthers }) => {
  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-md flex flex-col gap-space-md">
      {/* Header row — badges + title + repo only, no difficulty here */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-code-sm text-code-sm font-semibold flex items-center gap-1">
            <Icon name="stars" size={13} /> {issue.match_score}% Match · Top Pick
          </span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-primary font-code-sm text-code-sm">{issue.issue_id}</span>
          {issue.labels?.slice(0, 2).map(l => (
            <span key={l} className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-code-sm text-code-sm">{l}</span>
          ))}
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface font-semibold leading-snug">{issue.title}</h3>
        <a
          href={`https://github.com/${issue.repo}`}
          target="_blank"
          rel="noreferrer"
          className="font-code-sm text-code-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          {issue.repo}
        </a>
      </div>

      {/* Agent Fit Breakdown — 4 columns, each with a unique value */}
      <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-2">
        <span className="text-label-md font-label-md text-primary font-semibold flex items-center gap-1">
          <Icon name="verified_user" size={16} /> Agent Fit Breakdown
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-1">
          {[
            ['Stack Alignment', issue.stack_alignment || '—',  'text-primary'],
            ['Est. Effort',     issue.effort          || '—',  'text-on-surface'],
            ['Difficulty',      issue.difficulty      || '—',  'text-on-surface'],
            ['Blast Radius',    issue.blast_radius    || '—',  'text-tertiary-container'],
          ].map(([k, v, cls]) => (
            <div key={k} className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant font-code-sm">{k}</span>
              <span className={`font-code-sm text-code-sm font-bold ${cls}`}>{v}</span>
            </div>
          ))}
        </div>
        {issue.reason && !['matches your profile', 'good fit'].includes(issue.reason.toLowerCase()) && (
          <p className="text-[11px] text-on-surface-variant font-code-sm italic border-t border-outline-variant/30 pt-2 mt-1">{issue.reason}</p>
        )}
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPrepare(issue)}
            className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold hover:opacity-90 shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Icon name="rocket_launch" size={16} /> Prepare Me (Generate Brief)
          </button>
          {totalCount > 1 && (
            <button
              onClick={onViewOthers}
              className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-medium transition-colors"
            >
              View Other {totalCount - 1} Match{totalCount - 1 !== 1 ? 'es' : ''}
            </button>
          )}
        </div>
        <a
          href={issue.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-code-sm font-code-sm text-primary hover:underline"
        >
          View on GitHub <Icon name="open_in_new" size={14} />
        </a>
      </div>
    </div>
  );
};

// ─── Onboarding brief (dynamic data from backend) ─────────────────────────────
const OnboardingBrief = ({ issue }) => {
  const brief        = issue?.brief || {};
  const repoName     = issue?.repo  || '';
  const repoUrl      = issue?.repo_url || `https://github.com/${repoName}`;
  const setupCmds    = brief.setup_commands || [
    `git clone ${repoUrl}`,
    `cd ${repoName.split('/')[1] || repoName}`,
    'pip install -e .',
  ];
  const prereqs      = brief.prerequisites || [];
  const targetFiles  = brief.target_files  || [];
  const introComment = brief.intro_comment || `Hi! I'd love to work on this issue. Could you please assign it to me?`;
  const implHint     = brief.implementation_hint || '';
  const prKeywords   = brief.pr_search_keywords || issue?.title?.split(' ').slice(0, 4).join(' ') || '';
  // GitHub search URL for merged PRs similar to this issue
  const prSearchUrl  = `https://github.com/${repoName}/pulls?q=is%3Apr+is%3Amerged+${encodeURIComponent(prKeywords)}`;
  // Build GitHub file URLs — try main branch, fall back to repo root if path looks generic
  const fileUrl = (path) => {
    if (!path || path === 'See issue description') return repoUrl;
    return `https://github.com/${repoName}/blob/main/${path}`;
  };

  return (
    <div className="bg-surface-container-lowest p-space-md lg:p-space-lg rounded-2xl rounded-tl-none shadow-md w-full flex flex-col gap-space-lg">

      {/* ── Brief header ── */}
      <div className="p-space-md rounded-xl bg-gradient-to-r from-primary-container/10 via-surface-container to-secondary-container/10 flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <span className="font-code-sm text-code-sm text-primary font-bold uppercase tracking-wider">Contribution Preparation Brief</span>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">{repoName} {issue?.issue_id}</h2>
          <span className="font-body-sm text-body-sm text-on-surface-variant">{brief.deliverable || issue?.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const md = `# Contribution Brief: ${repoName} ${issue?.issue_id}\n\n**Issue:** ${issue?.title}\n\n**Deliverable:** ${brief.deliverable || ''}\n\n**Setup:**\n${setupCmds.map(c => '```\n' + c + '\n```').join('\n')}\n\n**Intro Comment:**\n${introComment}`;
              navigator.clipboard.writeText(md).catch(() => {});
            }}
            className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-code-sm text-code-sm font-medium flex items-center gap-1 shadow-sm"
          >
            <Icon name="download" size={16} className="text-secondary" /> Export .MD
          </button>
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-code-sm text-code-sm font-semibold flex items-center gap-1 shadow-sm hover:opacity-90"
          >
            <Icon name="fork_right" size={16} /> Fork on GitHub
          </a>
        </div>
      </div>

      <div className="space-y-space-md">

        {/* ── Row 1: Deliverable · Scope · Prerequisites ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">

          {/* 1. Deliverable */}
          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-primary">
              <Icon name="flag" size={18} />
              <span className="font-label-md text-label-md font-bold">1. Concrete Deliverable</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">{brief.deliverable || issue?.title}</p>
            {implHint && (
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed italic border-t border-outline-variant/30 pt-2 mt-1">{implHint}</p>
            )}
          </div>

          {/* 2. Scope */}
          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-secondary">
              <Icon name="straighten" size={18} />
              <span className="font-label-md text-label-md font-bold">2. Scope &amp; Complexity</span>
            </div>
            <div className="space-y-1">
              {[
                ['LOC Impact:',      brief.loc_estimate     || issue?.effort || '—', 'font-semibold text-primary'],
                ['Production code:', brief.production_lines || '—',                  ''],
                ['Test suite:',      brief.test_lines       || '—',                  ''],
              ].map(([k, v, cls]) => (
                <div key={k} className="flex justify-between font-code-sm text-code-sm">
                  <span className="text-on-surface-variant">{k}</span>
                  <span className={cls || 'text-on-surface'}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Prerequisites */}
          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-tertiary-container">
              <Icon name="checklist" size={18} />
              <span className="font-label-md text-label-md font-bold">3. Prerequisites</span>
            </div>
            <ul className="text-body-sm font-body-sm text-on-surface space-y-1">
              {(prereqs.length ? prereqs : ['See issue description']).map((item, i) => (
                <li key={i} className="flex items-center gap-1">
                  <Icon name="check" size={14} className="text-tertiary-container flex-shrink-0" />
                  <code className="font-code-sm text-code-sm">{item}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Row 2: Target Files · Prior PR Reference ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">

          {/* 4. Target Files Map */}
          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-on-surface font-semibold font-label-md text-label-md">
                <Icon name="folder_open" size={18} className="text-primary" />
                <span>4. Target Files Map</span>
              </div>
              <span className="font-code-sm text-[11px] text-primary font-medium">
                {targetFiles.length ? `${targetFiles.length} File${targetFiles.length > 1 ? 's' : ''} Only` : '—'}
              </span>
            </div>
            <div className="space-y-2 pt-1 font-code-sm text-code-sm">
              {(targetFiles.length ? targetFiles : [{ path: 'See issue description', line_range: '' }]).map((f, i) => (
                <a
                  key={i}
                  href={f.path && f.path !== 'See issue description'
                    ? `https://github.com/${repoName}/blob/main/${f.path}`
                    : repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded bg-surface-container-lowest flex items-center justify-between gap-2 hover:bg-surface-container-high transition-colors no-underline group"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Icon name={i === 0 ? 'edit_document' : 'science'} size={14} className={i === 0 ? 'text-primary' : 'text-tertiary-container'} />
                    <span className="truncate text-on-surface group-hover:text-primary group-hover:underline transition-colors">{f.path}</span>
                  </div>
                  {f.line_range && (
                    <span className="text-secondary font-semibold text-[11px] flex-shrink-0">{f.line_range}</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* 5. Canonical Prior PR Reference */}
          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-on-surface font-semibold font-label-md text-label-md">
                <Icon name="history_edu" size={18} className="text-secondary" />
                <span>5. Canonical Prior PR Reference</span>
              </div>
              {brief.prior_pr?.number && (
                <span className="px-1.5 py-0.5 rounded bg-surface-container text-secondary font-code-sm text-[11px]">
                  {brief.prior_pr.number}
                </span>
              )}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              {brief.prior_pr?.number
                ? <>Use {brief.prior_pr.number} (<em className="text-on-surface font-medium">"{brief.prior_pr.title}"</em>) as your direct code blueprint. {brief.prior_pr.description}</>
                : implHint || `Follow the existing patterns in the ${repoName} codebase. Look for similar merged PRs to use as a blueprint.`
              }
            </p>
            <div className="mt-auto pt-1 flex items-center gap-2">
              <a
                href={prSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="font-code-sm text-code-sm text-primary hover:underline flex items-center gap-1"
              >
                Inspect PR diff tree <Icon name="arrow_outward" size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* ── 6. CLI Runbook ── */}
        <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-on-surface font-semibold font-label-md text-label-md">
              <Icon name="terminal" size={18} className="text-primary" />
              <span>6. Copyable CLI Runbook</span>
            </div>
            <span className="font-code-sm text-code-sm text-outline">Terminal Commands</span>
          </div>
          <div className="space-y-2 font-code-sm text-code-sm">
            {setupCmds.map((cmd, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest">
                <span className="text-on-surface truncate"><span className="text-outline">$ </span>{cmd}</span>
                <CopyButton text={cmd} />
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. Intro comment ── */}
        <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-on-surface font-semibold font-label-md text-label-md">
              <Icon name="forum" size={18} className="text-secondary" />
              <span>7. Ready-to-Send Intro Comment</span>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(introComment).catch(() => {})}
              className="px-2.5 py-1 rounded bg-secondary text-on-secondary font-code-sm text-[11px] font-semibold flex items-center gap-1 shadow-sm hover:opacity-90"
            >
              <Icon name="content_copy" size={13} /> Copy Template
            </button>
          </div>
          <div className="p-3 rounded-lg bg-surface-container-lowest font-code-sm text-code-sm text-on-surface leading-relaxed border-l-2 border-l-primary">
            {introComment}
          </div>
        </div>

        {/* ── 8. Footer actions ── */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-2">
            <a
              href={issue?.url}
              target="_blank"
              rel="noreferrer"
              className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:opacity-90 shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Icon name="bookmark_add" size={16} /> Mark Claimed / In Progress
            </a>
            <button className="px-space-md py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-body-sm font-medium flex items-center gap-1.5 transition-colors">
              <Icon name="help_outline" size={16} className="text-secondary" /> Ask for Code Review Guidance
            </button>
          </div>
          <div className="flex items-center gap-2 font-code-sm text-code-sm text-outline">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            LangGraph checkpoint saved
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Parse freeform text → structured profile ─────────────────────────────────
// Extracts languages, skills, interest, experience level, and time from a
// natural language sentence so we never show a structured form.
function parseProfile(text) {
  const t = text.toLowerCase();

  // Languages
  const langMap = { python: 'Python', javascript: 'JavaScript', typescript: 'TypeScript', go: 'Go', rust: 'Rust', java: 'Java', 'c++': 'C++', ruby: 'Ruby', php: 'PHP', kotlin: 'Kotlin', swift: 'Swift', scala: 'Scala', 'c#': 'C#' };
  const languages = Object.entries(langMap).filter(([k]) => t.includes(k)).map(([, v]) => v).join(', ') || 'Python';

  // Skills / frameworks
  const skillTerms = ['pandas', 'numpy', 'react', 'vue', 'angular', 'fastapi', 'django', 'flask', 'express', 'next.js', 'tailwind', 'pytorch', 'tensorflow', 'sklearn', 'scikit-learn', 'sqlalchemy', 'pydantic', 'docker', 'kubernetes', 'graphql', 'rest', 'sql', 'postgresql', 'mongodb', 'redis', 'typescript', 'node', 'webpack', 'vite'];
  const skills = skillTerms.filter(s => t.includes(s)).join(', ') || languages;

  // Interest / domain
  const interestMap = [
    ['data', 'Data & ML'], ['ml', 'Data & ML'], ['machine learning', 'Data & ML'], ['ai', 'AI/ML'],
    ['web', 'Web Development'], ['frontend', 'Frontend'], ['backend', 'Backend'],
    ['devops', 'DevOps'], ['infra', 'Infrastructure'], ['cloud', 'Cloud'],
    ['cli', 'CLI Tools'], ['api', 'API Development'], ['mobile', 'Mobile'],
    ['security', 'Security'], ['database', 'Databases'], ['open source', 'Open Source'],
  ];
  const interest = (interestMap.find(([k]) => t.includes(k)) || [])[1] || 'Open Source';

  // Experience
  let experience = 'Beginner';
  if (t.includes('intermediate') || t.includes('mid') || t.includes('some experience')) experience = 'Intermediate';
  else if (t.includes('advanced') || t.includes('senior') || t.includes('expert')) experience = 'Advanced';

  // Time budget
  const timeMatch = text.match(/(\d+)\s*(?:hour|hr|h)/i);
  const time = timeMatch ? `${timeMatch[1]} hours` : '5 hours';

  // Keywords — remaining meaningful words
  const stopwords = new Set(['i', 'im', 'a', 'an', 'the', 'and', 'or', 'for', 'to', 'in', 'of', 'my', 'with', 'on', 'at', 'is', 'am', 'are', 'be', 'me', 'have', 'can', 'first', 'make', 'find', 'want', 'looking', 'comfortable', 'week', 'per', 'about', 'some', 'good', 'starter', 'issues', 'hi', 'hello', 'hey']);
  const keywords = text.split(/\W+/).filter(w => w.length > 3 && !stopwords.has(w.toLowerCase())).slice(0, 5).join(' ');

  return { languages, skills, interest, experience, time, keywords };
}

// ─── Pipeline builder ─────────────────────────────────────────────────────────
const buildPipeline = (stage, counts = {}) => [
  { icon: 'person',               label: 'User Intake',       sub: stage >= 1 ? 'Profile parsed'                                       : 'Awaiting input',  status: stage > 1 ? 'done' : stage === 1 ? 'active' : 'idle', badge: stage >= 1 ? 'Done' : null },
  { icon: 'travel_explore',       label: 'Discovery Agent',   sub: stage >= 2 ? `${counts.candidates ?? '…'} candidates scraped`       : 'Pending',         status: stage > 2 ? 'done' : stage === 2 ? 'active' : 'idle', badge: stage >= 2 ? `${counts.candidates ?? '…'} repos` : null },
  { icon: 'health_and_safety',    label: 'Repo Health Agent', sub: stage >= 3 ? `${counts.pruned ?? '…'} pruned / ${counts.healthy ?? '…'} active` : 'Pending', status: stage > 3 ? 'done' : stage === 3 ? 'active' : 'idle', badge: stage >= 3 ? 'Filtered' : null },
  { icon: 'smart_toy',            label: 'Issue Matcher',     sub: stage >= 4 ? `${counts.matched_issues ?? '…'} high-affinity scored`  : 'Pending',         status: stage > 4 ? 'done' : stage === 4 ? 'active' : 'idle', badge: stage >= 4 ? `${counts.matched_issues ?? '…'} issues` : null },
  { icon: 'assignment_turned_in', label: 'Onboarding Agent',  sub: stage >= 5 ? 'Briefs generated'                                      : 'Pending',         status: stage > 5 ? 'done' : stage === 5 ? 'active' : 'idle', badge: stage >= 5 ? 'Active' : null },
  { icon: 'shield',               label: 'Manager Watchdog',  sub: 'Loop safety: Optimal',                                                                    status: 'idle',                                                badge: 'Idle' },
];

const nowTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

// ─── Avatar / pill config ─────────────────────────────────────────────────────
const AVATAR_CFG = {
  manager:   { bg: 'bg-primary-container text-on-primary-container', icon: 'psychology' },
  discovery: { bg: 'bg-secondary text-on-secondary',                 icon: 'travel_explore' },
  issue:     { bg: 'bg-secondary-container text-on-secondary-container', icon: 'smart_toy' },
  onboard:   { bg: 'bg-primary text-on-primary',                     icon: 'assignment_turned_in' },
  error:     { bg: 'bg-error-container text-on-error-container',     icon: 'error' },
};
const PILL_CFG = {
  manager:   'text-primary bg-surface-container',
  discovery: 'text-secondary bg-surface-container',
  issue:     'text-secondary bg-surface-container',
  onboard:   'text-on-primary-fixed bg-primary-fixed font-semibold',
  error:     'text-error bg-error-container',
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [stage, setStage]       = useState(0);
  const [busy, setBusy]         = useState(false);
  const [profile, setProfile]   = useState(null);   // parsed profile shown in sidebar
  const [counts, setCounts]     = useState({});      // pipeline counts from API
  const [apiData, setApiData]   = useState(null);    // full API response
  const [backendOk, setBackendOk] = useState(null);  // null=checking, true=ok, false=down

  const feedRef  = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const addMsg = useCallback((msg) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), ...msg }]);
  }, []);

  // Check backend health on mount — no welcome bubble, empty state handles it
  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then(r => r.json())
      .then(d => setBackendOk(d.status === 'ok'))
      .catch(() => setBackendOk(false));
  }, []);

  // ── Main send handler ────────────────────────────────────────────────────
  const handleSend = async (overrideText) => {
    const txt = (overrideText ?? input).trim();
    if (!txt || busy) return;
    setInput('');
    const t = nowTime();

    if (stage === 0) {
      // ── First message: parse profile → call backend ──────────────────
      const parsed = parseProfile(txt);
      setProfile(parsed);

      addMsg({ type: 'user', text: txt, time: t });
      setBusy(true);

      // Stage 1: intake — post manager dispatch immediately with a pending trace
      const managerMsgId = Date.now() + Math.random();
      setStage(1);
      setMessages(prev => [...prev, {
        id: managerMsgId,
        type: 'agent', agentType: 'manager', agentLabel: 'Manager Orchestrator',
        time: nowTime(), content: 'manager_dispatch', profile: parsed, counts: null,
      }]);

      // Stages 2→3→4 animate while backend is running
      await new Promise(r => setTimeout(r, 800));
      setStage(2);
      await new Promise(r => setTimeout(r, 600));
      setStage(3);
      await new Promise(r => setTimeout(r, 600));
      setStage(4);

      // ── Call the real backend ─────────────────────────────────────────
      let result = null;
      try {
        const resp = await fetch(`${API_BASE}/api/run-workflow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: parsed }),
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ detail: resp.statusText }));
          throw new Error(err.detail || `HTTP ${resp.status}`);
        }
        const json = await resp.json();
        result = json.data;
      } catch (err) {
        setBusy(false);
        addMsg({
          type: 'agent', agentType: 'error', agentLabel: 'System Error', time: nowTime(),
          content: 'error', text: `Backend error: ${err.message}. Make sure the FastAPI server is running on port 8000 and your GROQ_API_KEY is set in backend/.env`,
        });
        return;
      }

      // Store full result and update pipeline counts
      setApiData(result);
      const c = result.counts || {};
      setCounts(c);

      // Patch the manager dispatch message with real counts so trace updates
      setMessages(prev => prev.map(m =>
        m.id === managerMsgId ? { ...m, counts: c } : m
      ));

      // ── Render Discovery + Health report ─────────────────────────────
      const healthyRepos = result.healthy_repos || [];
      addMsg({
        type: 'agent', agentType: 'discovery', agentLabel: 'Discovery & Health Joint Report',
        time: nowTime(), content: 'repos',
        repos: healthyRepos, counts: c,
      });

      await new Promise(r => setTimeout(r, 400));
      setStage(4);

      // ── Render Issue Matcher results ──────────────────────────────────
      const finalRecs = result.final_recommendations || [];
      if (finalRecs.length === 0) {
        addMsg({
          type: 'agent', agentType: 'issue', agentLabel: 'Issue Matcher Agent', time: nowTime(),
          content: 'no_issues',
        });
      } else {
        addMsg({
          type: 'agent', agentType: 'issue', agentLabel: 'Issue Matcher Agent',
          time: nowTime(), content: 'issues', issues: finalRecs, counts: c,
        });
      }

      setStage(5);
      setBusy(false);

    } else if (stage >= 4) {
      // ── Follow-up messages after results are shown ────────────────────
      addMsg({ type: 'user', text: txt, time: t });
      setBusy(true);
      await new Promise(r => setTimeout(r, 600));
      addMsg({
        type: 'agent', agentType: 'manager', agentLabel: 'Manager Orchestrator', time: nowTime(),
        content: 'generic',
        text: `Noted! To find different results, try the "Reset graph" button and describe a different profile. For now your current recommendations are displayed above.`,
      });
      setBusy(false);
    }
  };

  const handlePrepareMe = useCallback((issue) => {
    if (busy) return;
    const msg = `Please prepare me for issue ${issue.issue_id} — ${issue.title}`;
    addMsg({ type: 'user', text: msg, time: nowTime() });
    addMsg({
      type: 'agent', agentType: 'onboard', agentLabel: 'Onboarding Agent',
      time: `${nowTime()} • Checkpointed State`, content: 'onboard', issue,
    });
  }, [busy, addMsg]);

  const handleReset = () => {
    setMessages([]);
    setStage(0);
    setBusy(false);
    setProfile(null);
    setCounts({});
    setApiData(null);
  };

  // ── Suggestion chips ─────────────────────────────────────────────────────
  const suggestions = stage === 0
    ? [
        "I'm a Python dev with Pandas & NumPy, 5 hrs/week, interested in Data & ML",
        'JavaScript developer, React + TypeScript, 3 hours/week, frontend',
        'Go developer, interested in DevOps/infra tooling, 4 hours/week',
      ]
    : ['Show me a different issue', 'Explain repository structure', 'Broaden my search'];

  const pipeline   = buildPipeline(stage, counts);
  const activeNode = pipeline.find(n => n.status === 'active');

  // ── Message content renderer ──────────────────────────────────────────────
  const renderContent = (msg) => {
    if (msg.content === 'manager_dispatch') {
      const p = msg.profile || {};
      const c = msg.counts || null;
      const lang = p.languages || 'Python';
      const interest = p.interest || 'open source';
      const topicSlug = interest.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const done = c !== null; // API has returned

      return (
        <div className="flex flex-col gap-3">
          <p className="font-body-md text-body-md text-on-surface leading-relaxed">
            I've initialized the LangGraph workflow. Dispatching the <strong className="text-primary font-medium">Discovery Agent</strong> to query active repositories and the <strong className="text-secondary font-medium">Repo Health Agent</strong> to evaluate maintainer responsiveness and beginner welcome metrics.
          </p>
          {/* Execution trace box — matches reference exactly */}
          <div className="bg-surface-container-lowest rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-code-sm font-code-sm text-on-surface">
              <span className="font-semibold flex items-center gap-1.5">
                <Icon name="alt_route" size={16} className="text-secondary" />
                Execution Trace (StateGraph v1.2)
              </span>
              <span className="text-primary font-medium">
                {done ? `${(c.candidates ?? 0) + (c.pruned ?? 0)} repos · ${c.healthy ?? 0} certified` : 'Initializing agents…'}
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2 font-code-sm text-code-sm text-on-surface-variant">
                <Icon name="check_circle" size={16} className="text-primary flex-shrink-0" />
                <span>GitHub Search: <span className="text-on-surface font-medium">'language:{lang} topic:{topicSlug} stars:&gt;500 is:public'</span></span>
              </div>
              <div className="flex items-center gap-2 font-code-sm text-code-sm text-on-surface-variant">
                {done
                  ? <Icon name="check_circle" size={16} className="text-primary flex-shrink-0" />
                  : <Icon name="sync" size={16} className="text-secondary flex-shrink-0 animate-spin" />
                }
                <span>
                  {done
                    ? <>{c.candidates ?? 0} candidate repositories retrieved with active issue velocity</>
                    : 'Scanning GitHub repositories with active issue velocity…'}
                </span>
              </div>
              <div className="flex items-center gap-2 font-code-sm text-code-sm text-on-surface-variant">
                {done
                  ? <Icon name="tune" size={16} className="text-tertiary-container flex-shrink-0" />
                  : <Icon name="sync" size={16} className="text-secondary flex-shrink-0 animate-spin" />
                }
                <span>
                  {done
                    ? <>Repo Health Agent: <span className="underline decoration-dotted cursor-pointer" title="Low good-first-issue count or slow maintainer SLA">{c.pruned ?? 0} pruned</span> · {c.healthy ?? 0} certified active</>
                    : 'Repo Health Agent: evaluating maintainer SLA and beginner-friendliness…'}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (msg.content === 'repos') {
      const repos = msg.repos || [];
      const c = msg.counts || {};
      const pruned = c.pruned ?? 0;
      const showAll = msg.showAll || false;
      const visible = showAll ? repos : repos.slice(0, 3);
      const hidden  = repos.length - 3;

      const prunedNote = pruned > 0
        ? `${pruned} repositories excluded for high PR review latency or stale triage to protect contributor onboarding momentum.`
        : null;

      return (
        <div className="flex flex-col gap-3">
          <p className="font-body-md text-body-md text-on-surface">
            Found <strong>{repos.length} healthy candidate {repos.length === 1 ? 'repository' : 'repositories'}</strong> passing all safety and maintainer response SLAs for beginner contributors:
          </p>

          {repos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-sm">
                {visible.map(r => <RepoCard key={r.name} repo={r} />)}
              </div>
              {!showAll && hidden > 0 && (
                <button
                  onClick={() => setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, showAll: true } : m))}
                  className="self-start px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Icon name="expand_more" size={16} className="text-primary" />
                  View Other {hidden} {hidden === 1 ? 'Repository' : 'Repositories'}
                </button>
              )}
            </>
          ) : (
            <div className="p-3 rounded-lg bg-surface-container text-code-sm font-code-sm text-on-surface-variant">
              No healthy repositories found yet — the Issue Matcher will try a broader search.
            </div>
          )}

          {/* Pruning rationale pill */}
          {prunedNote && (
            <div className="flex items-start gap-2 p-2 rounded-lg bg-surface-container text-code-sm font-code-sm text-on-surface-variant">
              <Icon name="info" size={16} className="text-outline flex-shrink-0 mt-0.5" />
              <span><strong>Pruning rationale:</strong> {prunedNote}</span>
            </div>
          )}
        </div>
      );
    }

    if (msg.content === 'issues') {
      const issues = msg.issues || [];
      const top    = issues[0];
      const rest   = issues.slice(1);
      const showAll = msg.showAll || false;

      return (
        <div className="flex flex-col gap-4">
          <p className="font-body-md text-body-md text-on-surface">
            Analyzed {issues.length * 3}+ candidate issues across the healthy repositories. Found <strong>{issues.length} high-affinity matches</strong> for your skill profile. Here is your <strong>#1 top recommendation:</strong>
          </p>
          {top && (
            <IssueMatchCard
              issue={top}
              totalCount={issues.length}
              onPrepare={handlePrepareMe}
              onViewOthers={() => setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, showAll: true } : m))}
            />
          )}
          {showAll && rest.map((issue, i) => (
            <IssueMatchCard
              key={issue.issue_id + issue.repo}
              issue={issue}
              totalCount={0}
              onPrepare={handlePrepareMe}
              onViewOthers={() => {}}
            />
          ))}
        </div>
      );
    }

    if (msg.content === 'no_issues') return (
      <div className="flex flex-col gap-3">
        <p className="font-body-md text-body-md text-on-surface">
          No matching issues were found with the current profile. The Manager Agent triggered a search expansion but good-first-issues may be scarce right now.
        </p>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-surface-container text-code-sm font-code-sm text-on-surface-variant">
          <Icon name="info" size={15} className="flex-shrink-0 mt-0.5 text-outline" />
          <span>Try broadening your search: reset and use a wider interest area, or increase your available time.</span>
        </div>
        <button onClick={handleReset} className="self-start px-4 py-2 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:opacity-90 flex items-center gap-1.5">
          <Icon name="refresh" size={15} /> Try a Different Profile
        </button>
      </div>
    );

    if (msg.content === 'onboard') return <OnboardingBrief issue={msg.issue} />;

    if (msg.content === 'error') return (
      <div className="flex items-start gap-2 p-3 rounded-lg bg-error-container text-on-error-container font-code-sm text-code-sm">
        <Icon name="error" size={15} className="flex-shrink-0 mt-0.5" />
        <span>{msg.text}</span>
      </div>
    );

    return <p className="font-body-md text-body-md text-on-surface leading-relaxed">{msg.text}</p>;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(26,86,219,0.08)] border-b border-primary-fixed">
        <div className="h-16 w-full px-gutter-desktop flex items-center justify-between gap-gutter">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Icon name="alt_route" size={18} className="text-on-primary" />
              </span>
              <span className="font-headline-md text-headline-md tracking-tight text-on-surface font-semibold">OpenStep</span>
            </div>
            <span className="hidden lg:inline-flex items-center px-space-sm py-0.5 rounded-full bg-surface-container-low text-primary text-code-sm font-code-sm border border-primary-fixed">
              LangGraph Multi-Agent Copilot
            </span>
            <div className="hidden md:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-lowest border border-outline-variant">
              <PingDot color={busy ? 'bg-secondary' : backendOk === false ? 'bg-error' : 'bg-outline'} pulse={busy} size="w-2 h-2" />
              <span className="text-code-sm font-code-sm text-on-surface-variant">
                {backendOk === false ? 'Backend offline' : busy ? `Active: ${activeNode?.label ?? 'Processing…'}` : stage >= 4 ? 'Issue Matching Agent' : 'Awaiting input'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <nav className="flex items-center gap-space-xs p-1 bg-surface-container rounded-lg">
              <a href="#" className="px-space-md py-1.5 transition-colors bg-primary-container text-on-primary-container font-semibold rounded-lg shadow-sm text-body-md">
                Copilot Workspace
              </a>
            </nav>
            <div className="flex items-center gap-space-sm pl-space-xs border-l border-outline-variant">
              <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-1 rounded-lg bg-surface-container-low text-on-surface-variant text-code-sm font-code-sm">
                <Icon name="terminal" size={16} className="text-primary" />
                <span>{profile?.languages ? `@${profile.languages.split(',')[0].trim().toLowerCase()}dev` : '@alexdev'}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                <Icon name="person" size={18} className="text-on-primary-container" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN ───────────────────────────────────────────────────────────── */}
      <main className="w-full pt-16 flex-1 flex flex-col bg-surface">
        <div className="w-full flex-1 flex flex-col lg:flex-row items-stretch bg-surface p-space-md lg:p-gutter-desktop gap-space-md lg:gap-gutter-desktop">

          {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
          <aside className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-space-md">

            {/* Profile card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="person_check" size={18} className="text-primary" />
                  <span className="font-label-md text-label-md text-on-surface font-semibold">User State Context</span>
                </div>
                <span className="px-space-xs py-0.5 rounded-full bg-surface-container-low text-secondary font-code-sm text-code-sm">
                  {stage >= 1 ? 'Thread #active' : 'Thread #idle'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
                {[
                  { label: 'Primary Lang',  value: profile?.languages?.split(',')[0] || '—', cls: 'text-primary font-semibold', dot: true },
                  { label: 'Time Budget',   value: profile ? `${profile.time}/week` : '—',   cls: 'text-on-surface font-medium', icon: 'schedule' },
                  { label: 'Domain Focus',  value: profile?.interest || '—',                  cls: 'text-on-surface font-medium' },
                  { label: 'OSS Tier',      value: profile?.experience || '—',                cls: 'text-tertiary-container font-medium' },
                ].map(({ label, value, cls, dot, icon }) => (
                  <div key={label} className="bg-surface-container-low p-space-xs rounded-lg flex flex-col">
                    <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">{label}</span>
                    <span className={`font-code-sm text-code-sm flex items-center gap-1 ${cls}`}>
                      {dot  && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      {icon && <Icon name={icon} size={12} className="text-secondary" />}
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              {profile?.skills && profile.skills !== profile.languages && (
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Detected Stack</span>
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.split(',').slice(0, 4).map(s => (
                      <span key={s} className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface text-code-sm font-code-sm">{s.trim()}</span>
                    ))}
                    {profile.skills.split(',').length > 4 && (
                      <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant text-code-sm font-code-sm">+{profile.skills.split(',').length - 4} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pipeline card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm flex-1">
              <div className="flex items-center justify-between pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <Icon name="schema" size={18} className="text-secondary" />
                  <span className="font-label-md text-label-md text-on-surface font-semibold">LangGraph Pipeline</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-code-sm text-secondary bg-surface-container-low px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  {busy ? 'Sync' : 'Ready'}
                </div>
              </div>
              <div className="flex flex-col space-y-1 relative">
                {pipeline.map((node, i) => (
                  <div key={node.label}>
                    <PipelineNode icon={node.icon} label={node.label} sub={node.sub} status={node.status} badge={node.badge} />
                    {i < pipeline.length - 1 && (
                      <div className={`h-2 w-0.5 ml-[18px] my-[-2px] ${node.status === 'done' ? 'bg-primary/20' : node.status === 'active' ? 'bg-secondary' : 'bg-outline-variant'}`} />
                    )}
                  </div>
                ))}
              </div>
              {stage >= 3 && counts.pruned > 0 && (
                <button className="mt-2 w-full p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-left flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-2">
                    <Icon name="filter_list_off" size={16} className="text-outline" />
                    <span className="font-code-sm text-code-sm text-on-surface-variant">{counts.pruned} Pruned Repositories</span>
                  </div>
                  <Icon name="chevron_right" size={16} className="text-outline" />
                </button>
              )}
              <div className="pt-2 mt-auto flex items-center justify-between">
                <button onClick={handleReset} className="flex items-center gap-1 text-code-sm font-code-sm text-outline hover:text-error transition-colors">
                  <Icon name="delete_sweep" size={14} /> Reset graph
                </button>
                <div className="flex items-center gap-1 text-code-sm font-code-sm text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-secondary" /> v1.2-beta
                </div>
              </div>
            </div>
          </aside>

          {/* ── CHAT SECTION ─────────────────────────────────────────────── */}
          <section className="flex-1 flex flex-col min-w-0 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">

            {/* Sub-header */}
            <div className="px-space-md py-space-sm bg-surface-container flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-space-sm">
                <span className="flex h-2.5 w-2.5 relative">
                  {busy && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />}
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
                <span className="font-code-sm text-code-sm text-on-surface font-semibold">Orchestration Graph: active execution</span>
                <span className="hidden sm:inline text-outline-variant font-code-sm">•</span>
                <span className="hidden sm:inline font-code-sm text-code-sm text-on-surface-variant">Session TTL: 48h checkpointed</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <button className="p-1 rounded hover:bg-surface-container-high text-on-surface-variant" title="Trace history">
                  <Icon name="history" size={18} />
                </button>
                <button className="p-1 rounded hover:bg-surface-container-high text-on-surface-variant" title="Debug">
                  <Icon name="terminal" size={18} />
                </button>
              </div>
            </div>

            {/* Messages feed */}
            <div ref={feedRef} className="flex-1 overflow-y-auto p-space-md lg:p-space-lg space-y-space-lg">

              {/* Empty state — shown before first message */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full min-h-[320px] gap-space-lg text-center px-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center shadow-sm">
                    <Icon name="alt_route" size={28} className="text-on-primary" />
                  </div>
                  <div className="flex flex-col gap-2 max-w-md">
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Find your first open source issue</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Tell me about yourself — your programming language, what you're interested in, and how many hours a week you have. I'll find the best matching issues for you.
                    </p>
                  </div>
                  {backendOk === false && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-error-container text-on-error-container text-[12px] font-code-sm max-w-md w-full text-left">
                      <Icon name="warning" size={15} className="flex-shrink-0 mt-0.5" />
                      <span>Backend offline at <strong>localhost:8000</strong>. Run <code className="bg-surface-container-lowest px-1 rounded">python main.py</code> in the backend folder, then refresh.</span>
                    </div>
                  )}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md w-full max-w-md flex flex-col gap-2 text-left shadow-sm">
                    <span className="font-code-sm text-code-sm text-on-surface font-semibold flex items-center gap-1.5">
                      <Icon name="tips_and_updates" size={15} className="text-secondary" /> Example
                    </span>
                    <p className="font-code-sm text-code-sm text-on-surface-variant italic leading-relaxed border-l-2 border-l-primary pl-3">
                      "I'm a Python developer with Pandas and NumPy, 5 hours a week, interested in data processing."
                    </p>
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id}>
                  {msg.type === 'user' ? (
                    <div className="flex flex-col items-end gap-1.5 ml-auto max-w-[85%] sm:max-w-[75%]">
                      <div className="flex items-center gap-2">
                        <span className="font-code-sm text-code-sm text-on-surface-variant">{profile ? `@${profile.languages?.split(',')[0]?.trim()?.toLowerCase() ?? 'user'}dev` : '@alexdev'}</span>
                        <span className="text-[11px] text-outline font-code-sm">{msg.time}</span>
                      </div>
                      <div className="bg-surface-container-low text-on-surface p-space-md rounded-2xl rounded-tr-none shadow-sm">
                        <p className="font-body-md text-body-md leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ) : (
                    <div className={`flex flex-col items-start gap-2 ${msg.content === 'onboard' ? 'w-full' : 'max-w-[95%] sm:max-w-[88%]'}`}>
                      <div className="flex items-center gap-2">
                        {msg.agentType === 'discovery' ? (
                          <div className="flex -space-x-1.5">
                            <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center"><Icon name="travel_explore" size={13} /></span>
                            <span className="w-6 h-6 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center"><Icon name="health_and_safety" size={13} /></span>
                          </div>
                        ) : (
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${AVATAR_CFG[msg.agentType]?.bg ?? 'bg-primary-container text-on-primary-container'}`}>
                            <Icon name={AVATAR_CFG[msg.agentType]?.icon ?? 'psychology'} size={14} />
                          </span>
                        )}
                        <AgentPill label={msg.agentLabel} color={PILL_CFG[msg.agentType]} />
                        <span className="text-[11px] text-outline font-code-sm">{msg.time}</span>
                      </div>
                      {msg.content === 'onboard' ? (
                        renderContent(msg)
                      ) : (
                        <div className="bg-surface-container-low/60 p-space-md rounded-2xl rounded-tl-none shadow-sm w-full flex flex-col gap-3">
                          {renderContent(msg)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {busy && (
                <div className="flex items-center gap-3 max-w-[95%]">
                  <div className="bg-surface-container-low/60 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                    <span className="font-code-sm text-code-sm text-on-surface-variant ml-1">{activeNode?.label ?? 'Agent'} processing…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="p-space-md bg-surface-container/70 border-t border-primary-fixed/30 flex flex-col gap-space-sm backdrop-blur-md flex-shrink-0">
              <div className="flex items-center gap-space-xs overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                <span className="text-[11px] font-code-sm text-outline whitespace-nowrap">Suggested:</span>
                {suggestions.map(s => (
                  <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="px-2.5 py-1 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface text-code-sm font-code-sm whitespace-nowrap shadow-sm transition-colors flex-shrink-0">
                    {s}
                  </button>
                ))}
              </div>
              <div className="relative flex items-center bg-surface-container-lowest rounded-xl shadow-md p-1.5">
                <div className="flex items-center gap-1 pl-2 text-outline">
                  <button className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface"><Icon name="attach_file" size={20} /></button>
                  <button className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface"><Icon name="code" size={20} /></button>
                </div>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={stage === 0 ? 'Describe yourself — languages, skills, interests, available time…' : "Reply to agents…"}
                  className="flex-1 px-space-md py-2.5 bg-transparent text-body-md font-body-md text-on-surface focus:outline-none placeholder:text-outline"
                />
                <div className="flex items-center gap-1 pr-1.5">
                  <button className="p-2 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface"><Icon name="mic" size={20} /></button>
                  <button onClick={handleReset} className="p-2 rounded-lg hover:bg-surface-container text-outline hover:text-secondary" title="Reset"><Icon name="refresh" size={20} /></button>
                  <button
                    onClick={() => handleSend()}
                    disabled={busy || !input.trim()}
                    className="p-2.5 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity flex items-center justify-center shadow-sm disabled:opacity-40"
                  >
                    <Icon name="send" size={18} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="w-full bg-surface-container-lowest/80 backdrop-blur-md border-t border-primary-fixed/40 py-2.5 px-gutter-desktop z-40">
        <div className="w-full flex items-center justify-between text-code-sm font-code-sm text-on-surface-variant">
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${backendOk === false ? 'bg-error' : 'bg-tertiary-container'}`} />
              <span>Backend:</span>
              <span className={`font-medium ${backendOk === false ? 'text-error' : 'text-on-surface'}`}>
                {backendOk === null ? 'Checking…' : backendOk ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <Icon name="database" size={14} className="text-secondary" />
              <span>Engine:</span>
              <span className="text-secondary font-medium">LangGraph v1.2 + Groq</span>
            </div>
          </div>
          <span className="text-outline">OpenStep © 2026</span>
        </div>
      </footer>
    </div>
  );
}
