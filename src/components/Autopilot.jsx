import React, { useState, useEffect } from 'react';

/* ── Icons ───────────────────────────────────────────── */
const Icon = {
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Gear: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 9a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9z" />
    </svg>
  ),
  Play: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  Box: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    </svg>
  ),
  Rupee: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12M6 8h12M6 13h8.5c2.5 0 4.5-2 4.5-4.5S17 4 14.5 4H6M6 13l9 9M9 3v10" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Toggle: ({ on }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={on ? '#22c55e' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="5" width="22" height="14" rx="7" fill={on ? '#dcfce7' : '#f3f4f6'} />
      <circle cx={on ? 16 : 8} cy="12" r="4" fill={on ? '#22c55e' : '#9ca3af'} stroke="none" />
    </svg>
  ),
};

/* ── Static automation rules ─────────────────────────── */
const RULES_INIT = [
  {
    id: 'rule-1',
    icon: Icon.Box,
    iconBg: '#e0f2fe',
    iconColor: '#0284c7',
    title: 'Auto-Restock Rice',
    desc: 'When Sona Masoori Rice stock drops below 300 kg, raise a purchase order to Annapoorna Distributors for 500 kg.',
    trigger: 'Stock < 300 kg',
    action: 'Purchase Order → Annapoorna',
    lastRun: 'Yesterday, 11:42 AM',
    runs: 3,
    active: true,
  },
  {
    id: 'rule-2',
    icon: Icon.Bell,
    iconBg: '#fff7ed',
    iconColor: '#c2410c',
    title: 'Overdue Payment Reminder',
    desc: 'Send a WhatsApp reminder to any customer with an overdue invoice 15+ days past the due date.',
    trigger: 'Invoice overdue > 15 days',
    action: 'WhatsApp reminder → Customer',
    lastRun: 'Today, 9:00 AM',
    runs: 7,
    active: true,
  },
  {
    id: 'rule-3',
    icon: Icon.Rupee,
    iconBg: '#f0fdf4',
    iconColor: '#15803d',
    title: 'Margin Guard',
    desc: "If any product's sale price drops within 5% of cost price, pause the SKU and alert Ramesh Kumar immediately.",
    trigger: 'Margin < 5%',
    action: 'Pause SKU + Alert owner',
    lastRun: 'Never triggered',
    runs: 0,
    active: false,
  },
];

const GOAL_STEPS = {
  'goal-1': [
    { title: 'Analyzing slow-moving SKUs', desc: 'Found 3 products below expected velocity threshold.' },
    { title: 'Negotiating with Annapoorna', desc: 'Sent automated bulk discount request for Sona Masoori Rice.' },
    { title: 'Adjusting DNA markup rules', desc: 'Set Sona Masoori margin to 14.5% automatically.' },
    { title: 'Simulation running', desc: 'Projected margin lift: +8.4% from next billing cycle.' },
  ],
  'goal-2': [
    { title: 'Scanning receivables ledger', desc: 'Identified ₹2,18,300 across 4 overdue accounts.' },
    { title: 'Drafting WhatsApp messages', desc: 'Personalized regional-language reminders prepared.' },
    { title: 'Releasing reminders', desc: 'Sent to Mahaveer, Sunil, Ramesh G — 3 clients notified.' },
    { title: 'Tracking payments via webhook', desc: 'Reconciliation engine armed and watching bank settlements.' },
  ],
};

const GOALS = [
  {
    id: 'goal-1',
    icon: '📈',
    title: 'Boost Profit Margin by 10%',
    desc: 'Halt slow-moving items, negotiate supplier rates & adjust price markups automatically.',
    tag: 'Margin',
    tagColor: '#7c3aed',
    tagBg: '#ede9fe',
  },
  {
    id: 'goal-2',
    icon: '💸',
    title: 'Accelerate Cash Collection',
    desc: 'Send reminders, negotiate credit terms, and automatically chase overdues.',
    tag: 'Cash Flow',
    tagColor: '#0284c7',
    tagBg: '#e0f2fe',
  },
];

export default function Autopilot() {
  const [rules, setRules] = useState(RULES_INIT);
  const [activeTab, setActiveTab] = useState('rules');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);

  const activeRules = rules.filter(r => r.active).length;

  // Step ticker
  useEffect(() => {
    if (!running || !selectedGoal) return;
    const steps = GOAL_STEPS[selectedGoal];
    if (step < steps.length) {
      const t = setTimeout(() => setStep(s => s + 1), 1800);
      return () => clearTimeout(t);
    } else {
      setRunning(false);
    }
  }, [running, step, selectedGoal]);

  const handleLaunchGoal = (goalId) => {
    setSelectedGoal(goalId);
    setRunning(true);
    setStep(0);
  };

  const toggleRule = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="ap-root">

      {/* ── Header ─────────────────────────────────── */}
      <div className="ap-header">
        <div className="ap-header-left">
          <p className="ap-eyebrow">Autonomous AI Operations</p>
          <h1 className="ap-title">Business Autopilot</h1>
          <p className="ap-subtitle">Configure trigger-based automation rules or launch goal-driven AI campaigns.</p>
        </div>
        <div className="ap-status-pill">
          <span className="ap-status-dot" />
          <span>{activeRules} rule{activeRules !== 1 ? 's' : ''} active</span>
        </div>
      </div>

      {/* ── Stat row ───────────────────────────────── */}
      <div className="ap-stat-row">
        <div className="ap-stat"><b>{rules.filter(r => r.active).length}</b><span>Active Rules</span></div>
        <div className="ap-stat"><b>{rules.reduce((s, r) => s + r.runs, 0)}</b><span>Total Runs</span></div>
        <div className="ap-stat"><b>₹47,800</b><span>Auto-Recovered</span></div>
        <div className="ap-stat"><b>3</b><span>Alerts Sent</span></div>
      </div>

      {/* ── Tabs ───────────────────────────────────── */}
      <div className="ap-tabs">
        <button className={`ap-tab ${activeTab === 'rules' ? 'ap-tab-active' : ''}`} onClick={() => setActiveTab('rules')}>
          Automation Rules
        </button>
        <button className={`ap-tab ${activeTab === 'goals' ? 'ap-tab-active' : ''}`} onClick={() => setActiveTab('goals')}>
          Goal Campaigns
        </button>
      </div>

      {/* ── Rules tab ──────────────────────────────── */}
      {activeTab === 'rules' && (
        <div className="ap-rules-list">
          {rules.map(rule => {
            const RuleIcon = rule.icon;
            return (
              <article key={rule.id} className={`ap-rule-card ${!rule.active ? 'ap-rule-inactive' : ''}`}>
                <div className="ap-rule-icon" style={{ background: rule.active ? rule.iconBg : '#f3f4f6' }}>
                  <RuleIcon />
                </div>
                <div className="ap-rule-body">
                  <div className="ap-rule-top">
                    <h3 className="ap-rule-title">{rule.title}</h3>
                    <button className="ap-toggle" onClick={() => toggleRule(rule.id)} title={rule.active ? 'Disable' : 'Enable'}>
                      <Icon.Toggle on={rule.active} />
                    </button>
                  </div>
                  <p className="ap-rule-desc">{rule.desc}</p>
                  <div className="ap-rule-meta">
                    <span className="ap-meta-chip ap-chip-trigger">
                      <b>Trigger:</b> {rule.trigger}
                    </span>
                    <span className="ap-meta-chip ap-chip-action">
                      <b>Action:</b> {rule.action}
                    </span>
                  </div>
                  <div className="ap-rule-footer">
                    <span>Last run: <b>{rule.lastRun}</b></span>
                    <span>Executed <b>{rule.runs}×</b></span>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Add Rule placeholder */}
          <button className="ap-add-rule">
            <Icon.Plus />
            <span>Add New Automation Rule</span>
          </button>
        </div>
      )}

      {/* ── Goals tab ──────────────────────────────── */}
      {activeTab === 'goals' && (
        <div className="ap-goals-wrap">
          <div className="ap-goal-grid">
            {GOALS.map(goal => (
              <article
                key={goal.id}
                className={`ap-goal-card ${selectedGoal === goal.id ? 'ap-goal-selected' : ''}`}
                onClick={() => !running && handleLaunchGoal(goal.id)}
              >
                <div className="ap-goal-header">
                  <span className="ap-goal-emoji">{goal.icon}</span>
                  <span className="ap-goal-tag" style={{ background: goal.tagBg, color: goal.tagColor }}>{goal.tag}</span>
                </div>
                <h3 className="ap-goal-title">{goal.title}</h3>
                <p className="ap-goal-desc">{goal.desc}</p>
                <button
                  className="ap-launch-btn"
                  disabled={running}
                  onClick={(e) => { e.stopPropagation(); handleLaunchGoal(goal.id); }}
                >
                  <Icon.Play />
                  {selectedGoal === goal.id && running ? 'Running…' : 'Launch Campaign'}
                </button>
              </article>
            ))}
          </div>

          {/* Execution timeline */}
          {selectedGoal && (
            <div className="ap-timeline-wrap">
              <div className="ap-timeline-header">
                <p className="ap-eyebrow">Execution Log</p>
                <h3 className="ap-tl-title">{GOALS.find(g => g.id === selectedGoal).title}</h3>
                <span className={`ap-run-badge ${running ? 'badge-running' : 'badge-done'}`}>
                  {running ? <><span className="ap-run-dot" />Running</> : <><Icon.Check />Completed</>}
                </span>
              </div>
              <div className="ap-timeline">
                {GOAL_STEPS[selectedGoal].map((s, i) => {
                  const isDone = i < step;
                  const isActive = i === step && running;
                  return (
                    <div key={i} className="ap-tl-row">
                      <div className="ap-tl-col">
                        <div className={`ap-tl-dot ${isDone ? 'tl-done' : isActive ? 'tl-active' : 'tl-pending'}`}>
                          {isDone ? <Icon.Check /> : isActive ? <Icon.Gear /> : null}
                        </div>
                        {i < GOAL_STEPS[selectedGoal].length - 1 && (
                          <div className={`ap-tl-line ${isDone ? 'tl-line-done' : ''}`} />
                        )}
                      </div>
                      <div className={`ap-tl-content ${isDone ? '' : isActive ? 'tl-content-active' : 'tl-content-pending'}`}>
                        <b>{s.title}</b>
                        <p>{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
