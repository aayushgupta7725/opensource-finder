import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Material Symbol icon component ───────────────────────────────────────────
const Icon = ({ name, size = 18, className = '' }) => (
  <span
    className={`material-symbols-outlined select-none ${className}`}
    style={{ fontSize: size, lineHeight: 1 }}
  >
    {name}
  </span>
);

// ─── Animated ping dot ────────────────────────────────────────────────────────
const PingDot = ({ color = 'bg-primary', pulse = false, size = 'w-2.5 h-2.5' }) => (
  <span className={`relative inline-flex ${size}`}>
    {pulse && (
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
    )}
    <span className={`relative inline-flex rounded-full h-full w-full ${color}`} />
  </span>
);

// ─── Agent pill badge ─────────────────────────────────────────────────────────
const AgentPill = ({ label, color = 'text-primary bg-surface-container' }) => (
  <span className={`px-2 py-0.5 rounded-full font-code-sm text-code-sm font-medium ${color}`}>
    {label}
  </span>
);

// ─── Copy button with feedback ────────────────────────────────────────────────
const CopyButton = ({ text, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handle}
      className={`ml-2 px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-medium text-code-sm font-code-sm flex items-center gap-1 transition-colors flex-shrink-0 ${className}`}
    >
      <Icon name={copied ? 'check' : 'content_copy'} size={13} />
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

// ─── Pipeline node ────────────────────────────────────────────────────────────
const PipelineNode = ({ icon, label, sub, status, badge }) => {
  const isActive = status === 'active';
  const isDone   = status === 'done';
  const isIdle   = status === 'idle';

  return (
    <div className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
      isActive ? 'bg-surface-container-high shadow-sm' :
      isDone   ? 'bg-surface-container-low/70' :
                 'bg-surface-container-lowest'
    }`}>
      <div className="flex items-center gap-2">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
          isActive ? 'bg-primary-container text-on-primary' :
          isDone   ? 'bg-surface-container text-primary' :
                     'bg-surface-container text-outline'
        }`}>
          {isActive
            ? <Icon name="sync" size={13} className="animate-spin" />
            : isDone
              ? <Icon name="check" size={13} />
              : <Icon name={icon} size={13} />
          }
        </span>
        <div className="flex flex-col">
          <span className={`font-body-sm text-body-sm ${
            isActive ? 'font-semibold text-primary' :
            isIdle   ? 'font-medium text-on-surface-variant' :
                       'font-medium text-on-surface'
          }`}>{label}</span>
          <span className="font-code-sm text-[10px] text-on-surface-variant">{sub}</span>
        </div>
      </div>
      {badge && (
        <span className={`text-[10px] font-code-sm px-1.5 py-0.5 rounded ${
          isActive ? 'bg-primary-container text-on-primary' :
          isDone   ? 'bg-surface-container-lowest text-primary' :
                     'bg-surface-container-low text-outline'
        }`}>{badge}</span>
      )}
    </div>
  );
};

// ─── Repo health card ─────────────────────────────────────────────────────────
const RepoCard = ({ score, scoreHighlight, badgeIcon, badgeLabel, badgeCls, name, desc, meta }) => (
  <div className="bg-surface-container-lowest p-space-sm rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer border border-outline-variant/30">
    <div>
      <div className="flex items-center justify-between">
        <span className={`px-1.5 py-0.5 rounded font-code-sm text-code-sm font-semibold ${scoreHighlight ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container text-on-surface'}`}>
          {score}
        </span>
        <span className={`text-[11px] font-code-sm flex items-center gap-0.5 ${badgeCls}`}>
          <Icon name={badgeIcon} size={12} />
          {badgeLabel}
        </span>
      </div>
      <h4 className="font-code-md text-code-md font-semibold text-on-surface mt-2 truncate">{name}</h4>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">{desc}</p>
    </div>
    <div className="mt-3 pt-2 bg-surface-container-low rounded-lg p-2 flex flex-col gap-1 text-[11px] font-code-sm">
      {meta.map(([k, v, vCls], i) => (
        <div key={i} className="flex justify-between text-on-surface-variant">
          <span>{k}</span>
          <span className={`font-medium ${vCls || ''}`}>{v}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Issue match card ─────────────────────────────────────────────────────────
const IssueMatchCard = ({ onPrepare }) => (
  <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-md flex flex-col gap-space-md border border-outline-variant/20">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-code-sm text-code-sm font-semibold flex items-center gap-1">
            <Icon name="stars" size={13} /> 96% Match · Top Pick
          </span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-primary font-code-sm text-code-sm">#6184</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-code-sm text-code-sm">good-first-issue</span>
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
          Add CSV export support for custom validation summaries
        </h3>
        <span className="font-code-sm text-code-sm text-on-surface-variant">great-expectations/great_expectations</span>
      </div>
      <div className="text-right flex flex-col items-end flex-shrink-0">
        <span className="text-[11px] font-code-sm text-outline">Lead Maintainer</span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="w-2 h-2 rounded-full bg-tertiary-container" />
          <span className="font-code-sm text-code-sm text-on-surface font-semibold">@johndoe (Active now)</span>
        </div>
      </div>
    </div>

    {/* Agent Fit Breakdown */}
    <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-2">
      <span className="text-label-md font-label-md text-primary font-semibold flex items-center gap-1">
        <Icon name="verified_user" size={16} /> Agent Fit Breakdown
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-1">
        {[
          ['Stack Alignment', '100% (Pandas)', 'text-primary'],
          ['Est. Effort',     '2 - 4 hours',   'text-on-surface'],
          ['Scope Size',      '~35 LOC',        'text-on-surface'],
          ['Blast Radius',    'Low (Isolated)', 'text-tertiary-container'],
        ].map(([k, v, cls]) => (
          <div key={k} className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant font-code-sm">{k}</span>
            <span className={`font-code-sm text-code-sm font-bold ${cls}`}>{v}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Action bar */}
    <div className="flex flex-wrap items-center justify-between gap-space-sm pt-1">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrepare}
          className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold hover:opacity-90 shadow-sm flex items-center gap-1.5 transition-all"
        >
          <Icon name="rocket_launch" size={16} /> Prepare Me (Generate Brief)
        </button>
        <button className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-medium transition-colors">
          View Other 4 Matches
        </button>
      </div>
      <a
        href="https://github.com/great-expectations/great_expectations/issues/6184"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-code-sm font-code-sm text-primary hover:underline"
      >
        View on GitHub <Icon name="open_in_new" size={14} />
      </a>
    </div>
  </div>
);

// ─── Onboarding Brief ─────────────────────────────────────────────────────────
const OnboardingBrief = () => {
  const cliSteps = [
    'git clone https://github.com/alexdev/great_expectations.git',
    'git checkout -b feat/csv-validation-export',
    'poetry run pytest tests/render/test_summary.py -v',
  ];
  const introComment = `"Hi @johndoe! I'd love to pick this up as my first contribution to Great Expectations. I noticed the pattern from #5920 and plan to mirror the .to_json() implementation by writing a clean .to_csv(filepath, index=False) method with pytest coverage in tests/render/test_summary.py. Could you please assign this issue to me? Thanks!"`;

  return (
    <div className="bg-surface-container-lowest p-space-md lg:p-space-lg rounded-2xl rounded-tl-none shadow-md w-full flex flex-col gap-space-lg">

      {/* Brief header */}
      <div className="p-space-md rounded-xl bg-gradient-to-r from-primary-container/10 via-surface-container to-secondary-container/10 flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <span className="font-code-sm text-code-sm text-primary font-bold uppercase tracking-wider">Contribution Preparation Brief</span>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
            great-expectations/great_expectations #6184
          </h2>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Target deliverable: CSV export pipeline helper for ValidationSummary</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-code-sm text-code-sm font-medium flex items-center gap-1 shadow-sm">
            <Icon name="download" size={16} className="text-secondary" /> Export .MD
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-code-sm text-code-sm font-semibold flex items-center gap-1 shadow-sm hover:opacity-90">
            <Icon name="fork_right" size={16} /> Fork on GitHub
          </button>
        </div>
      </div>

      {/* 8-part grid */}
      <div className="space-y-space-md">

        {/* Row 1: Deliverable, Scope, Prerequisites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-primary">
              <Icon name="flag" size={18} />
              <span className="font-label-md text-label-md font-bold">1. Concrete Deliverable</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
              Add a <code className="font-code-sm bg-surface-container-lowest px-1 py-0.5 rounded text-primary">.to_csv(filepath, index=False)</code> method onto the <code className="font-code-sm text-on-surface">ValidationSummary</code> class to enable frictionless programmatic reporting exports.
            </p>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-secondary">
              <Icon name="straighten" size={18} />
              <span className="font-label-md text-label-md font-bold">2. Scope &amp; Complexity</span>
            </div>
            <div className="space-y-1 text-body-sm font-body-sm text-on-surface">
              {[
                ['LOC Impact:',       '~35 lines total', 'font-semibold text-primary'],
                ['Production code:',  '~12 lines',       ''],
                ['Pytest test suite:', '~23 lines',      ''],
              ].map(([k, v, cls]) => (
                <div key={k} className="flex justify-between font-code-sm text-code-sm">
                  <span className="text-on-surface-variant">{k}</span>
                  <span className={cls}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-tertiary-container">
              <Icon name="checklist" size={18} />
              <span className="font-label-md text-label-md font-bold">3. Prerequisites</span>
            </div>
            <ul className="text-body-sm font-body-sm text-on-surface space-y-1">
              {[
                'pandas.DataFrame.to_csv()',
                'pytest.tmp_path fixture',
                'Poetry virtual environment',
              ].map(item => (
                <li key={item} className="flex items-center gap-1">
                  <Icon name="check" size={14} className="text-tertiary-container" />
                  <code className="font-code-sm text-code-sm">{item}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Row 2: Target Files, Prior PR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-on-surface font-semibold font-label-md text-label-md">
                <Icon name="folder_open" size={18} className="text-primary" />
                <span>4. Target Files Map</span>
              </div>
              <span className="font-code-sm text-[11px] text-primary font-medium">2 Files Only</span>
            </div>
            <div className="space-y-2 pt-1 font-code-sm text-code-sm">
              <div className="p-2 rounded bg-surface-container-lowest flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <Icon name="edit_document" size={14} className="text-primary" />
                  <span className="truncate text-on-surface">great_expectations/render/summary.py</span>
                </div>
                <span className="text-secondary font-semibold text-[11px] flex-shrink-0">lines 240-285</span>
              </div>
              <div className="p-2 rounded bg-surface-container-lowest flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <Icon name="science" size={14} className="text-tertiary-container" />
                  <span className="truncate text-on-surface">tests/render/test_summary.py</span>
                </div>
                <span className="text-on-surface-variant text-[11px] flex-shrink-0">Add test_to_csv()</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-on-surface font-semibold font-label-md text-label-md">
                <Icon name="history_edu" size={18} className="text-secondary" />
                <span>5. Canonical Prior PR Reference</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-surface-container text-secondary font-code-sm text-[11px]">PR #5920</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Use PR #5920 (<em className="text-on-surface font-medium">"Add .to_json() export to ValidationSummary"</em>) as your direct code blueprint. The structure, parameter assertions, and test fixture can be cloned almost 1:1.
            </p>
            <div className="mt-auto pt-1 flex items-center gap-2">
              <a href="#" className="font-code-sm text-code-sm text-primary hover:underline flex items-center gap-1">
                Inspect PR #5920 diff tree <Icon name="arrow_outward" size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* CLI Runbook */}
        <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-on-surface font-semibold font-label-md text-label-md">
              <Icon name="terminal" size={18} className="text-primary" />
              <span>6. Copyable CLI Runbook</span>
            </div>
            <span className="font-code-sm text-code-sm text-outline">Terminal Commands</span>
          </div>
          <div className="space-y-2 font-code-sm text-code-sm">
            {cliSteps.map((cmd, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest">
                <span className="text-on-surface truncate">
                  <span className="text-outline">$ </span>{cmd}
                </span>
                <CopyButton text={cmd} />
              </div>
            ))}
          </div>
        </div>

        {/* Intro comment */}
        <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-on-surface font-semibold font-label-md text-label-md">
              <Icon name="forum" size={18} className="text-secondary" />
              <span>7. Ready-to-Send Intro Comment for @johndoe</span>
            </div>
            <button className="px-2.5 py-1 rounded bg-secondary text-on-secondary font-code-sm text-[11px] font-semibold flex items-center gap-1 shadow-sm hover:opacity-90">
              <Icon name="content_copy" size={13} /> Copy Template
            </button>
          </div>
          <div className="p-3 rounded-lg bg-surface-container-lowest font-code-sm text-code-sm text-on-surface leading-relaxed border-l-2 border-l-primary">
            {introComment}
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-2">
            <button className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:opacity-90 shadow-sm flex items-center gap-1.5 transition-all">
              <Icon name="bookmark_add" size={16} /> Mark Claimed / In Progress
            </button>
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

// ─── Pipeline data ─────────────────────────────────────────────────────────────
const buildPipeline = (stage) => [
  { icon: 'person',          label: 'User Intake',       sub: stage >= 1 ? 'Profile parsed'          : 'Awaiting input',       status: stage > 1 ? 'done' : stage === 1 ? 'active' : 'idle', badge: stage >= 1 ? 'Done'     : null },
  { icon: 'travel_explore',  label: 'Discovery Agent',   sub: stage >= 2 ? '15 candidates scraped'   : 'Pending',              status: stage > 2 ? 'done' : stage === 2 ? 'active' : 'idle', badge: stage >= 2 ? '15 repos' : null },
  { icon: 'health_and_safety', label: 'Repo Health Agent', sub: stage >= 3 ? '12 pruned / 3 active' : 'Pending',              status: stage > 3 ? 'done' : stage === 3 ? 'active' : 'idle', badge: stage >= 3 ? 'Filtered' : null },
  { icon: 'smart_toy',       label: 'Issue Matcher',     sub: stage >= 4 ? '5 high-affinity scored'  : 'Pending',              status: stage > 4 ? 'done' : stage === 4 ? 'active' : 'idle', badge: stage >= 4 ? '5 issues' : null },
  { icon: 'assignment_turned_in', label: 'Onboarding Agent', sub: stage >= 5 ? 'Brief #6184 generated' : 'Pending',           status: stage > 5 ? 'done' : stage === 5 ? 'active' : 'idle', badge: stage >= 5 ? 'Active'   : null },
  { icon: 'shield',          label: 'Manager Watchdog',  sub: 'Loop safety: Optimal',                                          status: 'idle',                                                badge: 'Idle' },
];

// ─── Timing helper ────────────────────────────────────────────────────────────
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const nowTime = () =>
  new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [stage, setStage]         = useState(0);
  const [busy, setBusy]           = useState(false);
  const feedRef  = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const addMsg = useCallback((msg) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), ...msg }]);
  }, []);

  // Show the orchestrator welcome on mount
  useEffect(() => {
    setTimeout(() => {
      addMsg({ type: 'agent', agentType: 'manager', agentLabel: 'Manager Orchestrator', time: nowTime(), content: 'welcome' });
    }, 500);
  }, [addMsg]);

  // ── Send handler ──────────────────────────────────────────────────────────
  const handleSend = async (overrideText) => {
    const txt = (overrideText ?? input).trim();
    if (!txt || busy) return;
    setInput('');
    const t = nowTime();

    if (stage === 0) {
      // First user message → run full multi-agent pipeline
      addMsg({ type: 'user', text: txt, time: t });
      setBusy(true);
      setStage(1);
      await delay(300);

      addMsg({ type: 'agent', agentType: 'manager', agentLabel: 'Manager Orchestrator', time: nowTime(), content: 'manager_dispatch' });
      setStage(2);
      await delay(1600);

      addMsg({ type: 'agent', agentType: 'discovery', agentLabel: 'Discovery & Health Joint Report', time: nowTime(), content: 'repos' });
      setStage(3);
      await delay(1800);

      addMsg({ type: 'agent', agentType: 'issue', agentLabel: 'Issue Matcher Agent', time: nowTime(), content: 'issue' });
      setStage(4);
      setBusy(false);

    } else if (
      stage === 4 &&
      (txt.toLowerCase().includes('prepare') ||
       txt.toLowerCase().includes('brief') ||
       txt.toLowerCase().includes('#6184') ||
       txt.toLowerCase().includes('onboard'))
    ) {
      addMsg({ type: 'user', text: txt, time: t });
      setBusy(true);
      await delay(900);
      setStage(5);
      addMsg({ type: 'agent', agentType: 'onboard', agentLabel: 'Onboarding Agent', time: `${nowTime()} • Checkpointed State`, content: 'onboard' });
      setBusy(false);

    } else {
      addMsg({ type: 'user', text: txt, time: t });
      setBusy(true);
      await delay(900);
      addMsg({
        type: 'agent', agentType: 'manager', agentLabel: 'Manager Orchestrator', time: nowTime(), content: 'generic',
        text: `Understood! I've forwarded your request to the relevant agents. Processing: "${txt}". Results will appear shortly.`,
      });
      setBusy(false);
    }
  };

  const handlePrepareMe = () => {
    if (busy) return;
    const msg = 'Please prepare me for issue #6184! Give me the full onboarding plan.';
    addMsg({ type: 'user', text: msg, time: nowTime() });
    setBusy(true);
    setTimeout(async () => {
      await delay(900);
      setStage(5);
      addMsg({ type: 'agent', agentType: 'onboard', agentLabel: 'Onboarding Agent', time: `${nowTime()} • Checkpointed State`, content: 'onboard' });
      setBusy(false);
    }, 0);
  };

  const handleReset = () => {
    setMessages([]);
    setStage(0);
    setBusy(false);
    setTimeout(() => addMsg({ type: 'agent', agentType: 'manager', agentLabel: 'Manager Orchestrator', time: nowTime(), content: 'welcome' }), 300);
  };

  // ── Suggestion chips ──────────────────────────────────────────────────────
  const suggestions =
    stage === 0
      ? ["I'm a Python dev with Pandas & NumPy, 5 hrs/week, interested in Data & ML", 'JavaScript developer, React + TypeScript, 3 hours/week', 'Go developer, interested in DevOps/infra tooling']
      : stage === 4
      ? ['Draft unit test code', 'Show me polars issue instead', 'Broaden search to 10 hrs/week', 'Explain repository structure']
      : ['Draft unit test code', 'Show me polars issue instead', 'Broaden search to 10 hrs/week', 'Explain repository structure'];

  // ── Pipeline state ────────────────────────────────────────────────────────
  const pipeline   = buildPipeline(stage);
  const activeNode = pipeline.find((n) => n.status === 'active');

  // ── Agent avatar colors ───────────────────────────────────────────────────
  const agentAvatarCfg = {
    manager:   { bg: 'bg-primary-container text-on-primary-container', icon: 'psychology' },
    discovery: { bg: 'bg-secondary text-on-secondary',                 icon: 'travel_explore' },
    health:    { bg: 'bg-tertiary-container text-on-tertiary-container', icon: 'health_and_safety' },
    issue:     { bg: 'bg-secondary-container text-on-secondary-container', icon: 'smart_toy' },
    onboard:   { bg: 'bg-primary text-on-primary',                     icon: 'assignment_turned_in' },
  };

  const agentPillCfg = {
    manager:   'text-primary bg-surface-container',
    discovery: 'text-secondary bg-surface-container',
    health:    'text-secondary bg-surface-container',
    issue:     'text-secondary bg-surface-container',
    onboard:   'text-on-primary-fixed bg-primary-fixed font-semibold',
  };

  // ── Message renderer ──────────────────────────────────────────────────────
  const renderContent = (msg) => {
    if (msg.content === 'welcome') return (
      <div className="flex flex-col gap-3">
        <p className="font-body-md text-body-md text-on-surface leading-relaxed">
          I've initialized the LangGraph workflow. Just tell me about yourself — your programming languages, skills, interests, and how many hours a week you have. I'll dispatch the <strong className="text-primary">Discovery Agent</strong> and <strong className="text-secondary">Repo Health Agent</strong> to find you the perfect first open source issue.
        </p>
        <div className="bg-surface-container-lowest rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 font-code-sm text-code-sm text-on-surface font-semibold">
            <Icon name="alt_route" size={16} className="text-secondary" /> Try saying something like…
          </div>
          <div className="p-3 rounded-lg bg-surface-container font-code-sm text-code-sm text-on-surface-variant italic leading-relaxed border-l-2 border-l-primary">
            "Hi! I'm a Python developer comfortable with Pandas and NumPy looking to make my first open source contribution. I have about 5 hours a week and want to work on data processing code. Can you find good starter issues?"
          </div>
        </div>
        <p className="font-code-sm text-code-sm text-outline">No setup required · GitHub token secured · LangGraph v1.2</p>
      </div>
    );

    if (msg.content === 'manager_dispatch') return (
      <div className="flex flex-col gap-3">
        <p className="font-body-md text-body-md text-on-surface leading-relaxed">
          I've initialized the LangGraph workflow. Dispatching the <strong className="text-primary font-medium">Discovery Agent</strong> to query active repositories and the <strong className="text-secondary font-medium">Repo Health Agent</strong> to evaluate maintainer responsiveness and beginner welcome metrics.
        </p>
        <div className="bg-surface-container-lowest rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-code-sm font-code-sm text-on-surface">
            <span className="font-semibold flex items-center gap-1.5">
              <Icon name="alt_route" size={16} className="text-secondary" /> Execution Trace (StateGraph v1.2)
            </span>
            <span className="text-primary font-medium">3 steps completed in 814ms</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {[
              { icon: 'check_circle', cls: 'text-primary', text: <>GraphQL GitHub Search: <span className="text-on-surface font-medium">'topic:data-engineering language:python stars:&gt;2000'</span></> },
              { icon: 'check_circle', cls: 'text-primary', text: '15 candidate repositories retrieved with active issue velocity' },
              { icon: 'tune',         cls: 'text-tertiary-container', text: <>Repo Health Agent: 12 pruned (<span className="underline decoration-dotted cursor-pointer" title="High PR backlog, SLA &gt; 3 weeks">slow newcomer SLA / stale triage</span>) • 3 certified active</> },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 font-code-sm text-code-sm text-on-surface-variant">
                <Icon name={s.icon} size={16} className={s.cls} />
                <span>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    if (msg.content === 'repos') return (
      <div className="flex flex-col gap-3">
        <p className="font-body-md text-body-md text-on-surface">
          Found <strong>3 healthy candidate repositories</strong> passing all safety and maintainer response SLAs for beginner contributors:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
          <RepoCard
            score="95/100" scoreHighlight
            badgeIcon="verified" badgeLabel="Certified" badgeCls="text-primary"
            name="great-expectations"
            desc="Data validation and profiling library written in pure Python."
            meta={[['Maintainer SLA:', '< 6 hours', 'text-primary'], ['Beginner Guide:', 'Comprehensive', 'text-tertiary-container']]}
          />
          <RepoCard
            score="92/100" scoreHighlight={false}
            badgeIcon="speed" badgeLabel="High Velocity" badgeCls="text-secondary"
            name="pola-rs/polars"
            desc="Lightning-fast DataFrame library with Python bindings."
            meta={[['Maintainer SLA:', '~18 hours', ''], ['Python Scopes:', 'Type stubs, IO', 'text-secondary']]}
          />
          <RepoCard
            score="89/100" scoreHighlight={false}
            badgeIcon="favorite" badgeLabel="Welcoming" badgeCls="text-outline"
            name="tiangolo/sqlmodel"
            desc="SQL databases with Python, powered by Pydantic and SQLAlchemy."
            meta={[['Maintainer SLA:', '~1.2 days', ''], ['Documentation:', 'Top Tier', '']]}
          />
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container text-code-sm font-code-sm text-on-surface-variant">
          <Icon name="info" size={16} className="text-outline flex-shrink-0" />
          <span><strong>Pruning rationale:</strong> Excluded <code className="text-on-surface font-semibold">pandas-dev/pandas</code> due to high PR review latency (&gt; 3 weeks for non-core maintainers) to protect contributor onboarding momentum.</span>
        </div>
      </div>
    );

    if (msg.content === 'issue') return (
      <div className="flex flex-col gap-3">
        <p className="font-body-md text-body-md text-on-surface">
          Analyzed 18 candidate issues across the 3 healthy repositories. Found 5 high-affinity matches for your Python &amp; Pandas skill profile. Here is your <strong>#1 top recommendation:</strong>
        </p>
        <IssueMatchCard onPrepare={handlePrepareMe} />
      </div>
    );

    if (msg.content === 'onboard') return <OnboardingBrief />;

    return (
      <p className="font-body-md text-body-md text-on-surface leading-relaxed">{msg.text}</p>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(124,58,237,0.06)] border-b border-primary-fixed">
        <div className="h-16 w-full px-gutter-desktop flex items-center justify-between gap-gutter">
          {/* Left cluster */}
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-sm">
              {/* Logo mark */}
              <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Icon name="alt_route" size={18} className="text-on-primary" />
              </span>
              <span className="font-headline-md text-headline-md tracking-tight text-on-surface font-semibold">OpenStep</span>
            </div>
            <span className="hidden lg:inline-flex items-center px-space-sm py-0.5 rounded-full bg-surface-container-low text-primary text-code-sm font-code-sm border border-primary-fixed">
              LangGraph Multi-Agent Copilot
            </span>
            <div className="hidden md:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-lowest border border-outline-variant">
              <PingDot color={busy ? 'bg-secondary' : 'bg-outline'} pulse={busy} size="w-2 h-2" />
              <span className="text-code-sm font-code-sm text-on-surface-variant">
                {busy
                  ? `Active: ${activeNode?.label ?? 'Processing…'}`
                  : stage >= 5
                  ? 'Active: Onboarding Agent'
                  : stage >= 4
                  ? 'Active: Issue Matching Agent'
                  : 'Awaiting input'}
              </span>
            </div>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-space-md">
            <nav className="flex items-center gap-space-xs p-1 bg-surface-container rounded-lg">
              <a
                href="#"
                className="px-space-md py-1.5 transition-colors bg-primary-container text-on-primary-container font-semibold rounded-lg shadow-sm text-body-md"
              >
                Copilot Workspace
              </a>
            </nav>
            <div className="flex items-center gap-space-sm pl-space-xs border-l border-outline-variant">
              <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-1 rounded-lg bg-surface-container-low text-on-surface-variant text-code-sm font-code-sm">
                <Icon name="terminal" size={16} className="text-primary" />
                <span>@alexdev</span>
              </div>
              {/* Avatar placeholder */}
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                <Icon name="person" size={18} className="text-on-primary-container" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT (below fixed header) ─────────────────────────────── */}
      <main className="w-full pt-16 flex-1 flex flex-col bg-surface">
        <div className="w-full flex-1 flex flex-col lg:flex-row items-stretch bg-surface p-space-md lg:p-gutter-desktop gap-space-md lg:gap-gutter-desktop">

          {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
          <aside className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-space-md">

            {/* Session profile card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="person_check" size={18} className="text-primary" />
                  <span className="font-label-md text-label-md text-on-surface font-semibold">User State Context</span>
                </div>
                <span className="px-space-xs py-0.5 rounded-full bg-surface-container-low text-secondary font-code-sm text-code-sm">Thread #cg-8821</span>
              </div>

              {/* Attribute chips */}
              <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
                {[
                  { label: 'Primary Lang',  value: stage >= 1 ? 'Python 3.11' : '—', valueCls: 'text-primary font-semibold', dot: true },
                  { label: 'Time Budget',   value: stage >= 1 ? '5h / week'   : '—', valueCls: 'text-on-surface font-medium', icon: 'schedule' },
                  { label: 'Domain Focus',  value: stage >= 1 ? 'Data & ML'   : '—', valueCls: 'text-on-surface font-medium' },
                  { label: 'OSS Tier',      value: stage >= 1 ? 'Beginner'    : '—', valueCls: 'text-tertiary-container font-medium' },
                ].map(({ label, value, valueCls, dot, icon }) => (
                  <div key={label} className="bg-surface-container-low p-space-xs rounded-lg flex flex-col">
                    <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">{label}</span>
                    <span className={`font-code-sm text-code-sm flex items-center gap-1 ${valueCls}`}>
                      {dot  && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      {icon && <Icon name={icon} size={12} className="text-secondary" />}
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Skills */}
              {stage >= 1 && (
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Confirmed Stack</span>
                  <div className="flex flex-wrap gap-1">
                    {['Pandas', 'NumPy', 'FastAPI'].map((s) => (
                      <span key={s} className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface text-code-sm font-code-sm">{s}</span>
                    ))}
                    <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant text-code-sm font-code-sm">+2 inferred</span>
                  </div>
                </div>
              )}
            </div>

            {/* LangGraph Pipeline card */}
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

              {/* Nodes */}
              <div className="flex flex-col space-y-1 relative">
                {pipeline.map((node, i) => (
                  <div key={node.label}>
                    <PipelineNode
                      icon={node.icon}
                      label={node.label}
                      sub={node.sub}
                      status={node.status}
                      badge={node.badge}
                    />
                    {i < pipeline.length - 1 && (
                      <div className={`h-2 w-0.5 ml-[18px] my-[-2px] ${
                        node.status === 'done' ? 'bg-primary/20' :
                        node.status === 'active' ? 'bg-secondary' :
                        'bg-outline-variant'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Pruned repos drawer */}
              {stage >= 3 && (
                <button className="mt-2 w-full p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-left flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-2">
                    <Icon name="filter_list_off" size={16} className="text-outline" />
                    <span className="font-code-sm text-code-sm text-on-surface-variant">12 Pruned Repositories</span>
                  </div>
                  <Icon name="chevron_right" size={16} className="text-outline" />
                </button>
              )}

              {/* Sidebar footer */}
              <div className="pt-2 mt-auto flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-code-sm font-code-sm text-outline hover:text-error transition-colors"
                >
                  <Icon name="delete_sweep" size={14} /> Reset graph
                </button>
                <div className="flex items-center gap-1 text-code-sm font-code-sm text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  v1.2-beta
                </div>
              </div>
            </div>
          </aside>

          {/* ── CENTRAL CHAT FEED ─────────────────────────────────────────── */}
          <section className="flex-1 flex flex-col min-w-0 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">

            {/* Sub-header bar */}
            <div className="px-space-md py-space-sm bg-surface-container flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-space-sm">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 ${busy ? '' : 'hidden'}`} />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
                <span className="font-code-sm text-code-sm text-on-surface font-semibold">
                  Orchestration Graph: {busy ? 'active execution' : 'active execution'}
                </span>
                <span className="hidden sm:inline text-outline-variant font-code-sm">•</span>
                <span className="hidden sm:inline font-code-sm text-code-sm text-on-surface-variant">Session TTL: 48h checkpointed</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <button className="p-1 rounded hover:bg-surface-container-high text-on-surface-variant" title="Search trace history">
                  <Icon name="history" size={18} />
                </button>
                <button className="p-1 rounded hover:bg-surface-container-high text-on-surface-variant" title="LangGraph Visual Debugger">
                  <Icon name="terminal" size={18} />
                </button>
              </div>
            </div>

            {/* Messages scroll area */}
            <div ref={feedRef} className="flex-1 overflow-y-auto p-space-md lg:p-space-lg space-y-space-lg">

              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.type === 'user' ? (
                    /* User bubble */
                    <div className="flex flex-col items-end gap-1.5 ml-auto max-w-[85%] sm:max-w-[75%]">
                      <div className="flex items-center gap-2">
                        <span className="font-code-sm text-code-sm text-on-surface-variant">Alex Dev (@alexdev)</span>
                        <span className="text-[11px] text-outline font-code-sm">{msg.time}</span>
                      </div>
                      <div className="bg-surface-container-low text-on-surface p-space-md rounded-2xl rounded-tr-none shadow-sm">
                        <p className="font-body-md text-body-md leading-relaxed">{msg.text}</p>
                      </div>
                      {msg.content === undefined && (
                        <div className="flex items-center gap-1.5 text-code-sm font-code-sm text-outline">
                          <Icon name="done_all" size={14} className="text-primary" />
                          <span>Intake state matched: 5 vars initialized</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Agent bubble */
                    <div className={`flex flex-col items-start gap-2 ${msg.content === 'onboard' ? 'w-full' : 'max-w-[95%] sm:max-w-[85%]'}`}>
                      <div className="flex items-center gap-2">
                        {/* Multi-avatar for joint report */}
                        {msg.agentType === 'discovery' ? (
                          <div className="flex -space-x-1.5">
                            <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-code-sm text-[12px] font-bold">
                              <Icon name="travel_explore" size={13} />
                            </span>
                            <span className="w-6 h-6 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-code-sm text-[12px] font-bold">
                              <Icon name="health_and_safety" size={13} />
                            </span>
                          </div>
                        ) : (
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-code-sm text-[12px] font-bold flex-shrink-0 ${agentAvatarCfg[msg.agentType]?.bg ?? 'bg-primary-container text-on-primary-container'}`}>
                            <Icon name={agentAvatarCfg[msg.agentType]?.icon ?? 'psychology'} size={14} />
                          </span>
                        )}
                        <AgentPill label={msg.agentLabel} color={agentPillCfg[msg.agentType]} />
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
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="font-code-sm text-code-sm text-on-surface-variant ml-1">{activeNode?.label ?? 'Agent'} processing…</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── BOTTOM INPUT AREA ────────────────────────────────────────── */}
            <div className="p-space-md bg-surface-container/70 border-t border-primary-fixed/30 flex flex-col gap-space-sm backdrop-blur-md flex-shrink-0">

              {/* Suggestion chips */}
              <div className="flex items-center gap-space-xs overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                <span className="text-[11px] font-code-sm text-outline whitespace-nowrap">Suggested:</span>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="px-2.5 py-1 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface text-code-sm font-code-sm whitespace-nowrap shadow-sm transition-colors flex-shrink-0"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Input bar */}
              <div className="relative flex items-center bg-surface-container-lowest rounded-xl shadow-md p-1.5 transition-all">
                <div className="flex items-center gap-1 pl-2 text-outline">
                  <button className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface" title="Attach file / snippet">
                    <Icon name="attach_file" size={20} />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface" title="Insert code block">
                    <Icon name="code" size={20} />
                  </button>
                </div>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={
                    stage === 0
                      ? 'Describe yourself — languages, skills, interests, available time…'
                      : "Reply to agents (e.g. 'Can you draft the test case for me?' or 'Show me other issues')..."
                  }
                  className="flex-1 px-space-md py-2.5 bg-transparent text-body-md font-body-md text-on-surface focus:outline-none placeholder:text-outline"
                />
                <div className="flex items-center gap-1 pr-1.5">
                  <button className="p-2 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface" title="Speech to text">
                    <Icon name="mic" size={20} />
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 rounded-lg hover:bg-surface-container text-outline hover:text-secondary"
                    title="Restart LangGraph execution"
                  >
                    <Icon name="refresh" size={20} />
                  </button>
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
        <div className="w-full flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg text-code-sm font-code-sm text-on-surface-variant">
            <div className="flex items-center gap-space-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container" />
              <span className="text-on-surface-variant">Engine:</span>
              <span className="text-on-surface font-medium">LangGraph v1.2</span>
            </div>
            <div className="hidden sm:flex items-center gap-space-xs">
              <Icon name="account_tree" size={14} className="text-primary" />
              <span className="text-on-surface-variant">Graph Nodes:</span>
              <span className="text-on-surface font-medium">4 Running / 2 Idle</span>
            </div>
            <div className="flex items-center gap-space-xs">
              <Icon name="database" size={14} className="text-secondary" />
              <span className="text-on-surface-variant">Memory:</span>
              <span className="text-secondary font-medium">Synced (Checkpointed)</span>
            </div>
          </div>
          <div className="flex items-center gap-space-md text-code-sm font-code-sm text-on-surface-variant">
            <span className="flex items-center gap-space-xs">
              <Icon name="bolt" size={14} className="text-outline" /> Latency: 142ms
            </span>
            <span className="hidden md:inline text-outline-variant">|</span>
            <span className="text-label-md font-label-md text-outline">Autonomous Contributor Copilot © 2025</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
