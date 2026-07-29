import React, { useMemo, useState } from 'react';

const agents = [
  { icon: '₹', name: 'AI CFO', job: 'Cash flow & margins', signal: 'Delay ₹1.12L supplier payout by 3 days', tone: 'mint' },
  { icon: '◒', name: 'AI Procurement', job: 'Stock & suppliers', signal: 'Order 500 kg rice before Friday', tone: 'amber' },
  { icon: '◉', name: 'AI Auditor', job: 'Risk & compliance', signal: '1 duplicate payment needs review', tone: 'rose' },
];

export default function CommandCenter({ branchState, onAsk }) {
  const [expanded, setExpanded] = useState(false);
  const score = useMemo(() => branchState ? 91 - Math.min(branchState.actions.length * 3, 12) : 82, [branchState]);
  const explain = (agent) => {
    const explanations = {
      'AI CFO': 'Why: ₹3.1L in supplier payments is due shortly, while ₹2.18L remains tied up in receivables. A three-day delay preserves a healthy operating buffer without risking the supplier relationship.',
      'AI Procurement': 'Why: rice is your fastest-moving SKU and current stock covers only six days. A 500 kg purchase maintains safety stock while keeping projected cash above ₹3.5L.',
      'AI Auditor': 'Why: two ₹28,500 payments to Annapoorna were recorded 11 minutes apart with the same amount and vendor. This has a high duplicate-payment confidence score.',
    };
    onAsk({ title: `${agent.name} recommendation`, body: explanations[agent.name] });
  };
  return <section className="command-center" aria-label="AI employee command center">
    <div className="health-card"><div className="health-ring" style={{ '--score': `${score * 3.6}deg` }}><b>{score}</b><span>/100</span></div><div><p className="eyebrow">BUSINESS HEALTH</p><h3>Healthy, with 3 priorities</h3><p>Cash is stable. Resolve receivables and rice stock this week.</p></div></div>
    <div className="employees"><div className="employee-head"><div><p className="eyebrow">YOUR AI EMPLOYEES</p><h3>Working in the background</h3></div><button onClick={() => setExpanded((value) => !value)}>{expanded ? 'Collapse' : 'View work'} <span>→</span></button></div><div className={`employee-list ${expanded ? 'expanded' : ''}`}>{agents.map((agent) => <button className="employee" key={agent.name} onClick={() => explain(agent)}><span className={`employee-icon ${agent.tone}`}>{agent.icon}</span><span><b>{agent.name}</b><small>{agent.job}</small></span><em>{agent.signal}</em><i>Why →</i></button>)}</div></div>
  </section>;
}
