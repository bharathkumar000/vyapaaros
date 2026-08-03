import React, { useState } from 'react';

const SVG = {
  Search: () => (
    <svg viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  ArrowDown: () => (
    <svg viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Play: () => (
    <svg viewBox="0 0 24 24">
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  ),
  Load: () => (
    <svg viewBox="0 0 24 24">
      <polyline points="4 7 4 4 7 4" />
      <polyline points="20 7 20 4 17 4" />
      <polyline points="4 17 4 20 7 20" />
      <polyline points="17 20 20 20 20 17" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Chevron: () => (
    <svg viewBox="0 0 24 24">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Print: () => (
    <svg viewBox="0 0 24 24">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  )
};

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const RANGES = { '14': 'Last 14 days', '30': 'Last 30 days', '90': 'Last quarter' };

const BASE_FLOW = [
  {
    node: '₹5,00,000',
    kind: 'start',
    title: 'Initial Cash Outflow',
    desc: 'Ramesh asks "Where did my ₹5 Lakh go?" AI rewinds every transaction across the selected window.',
    amount: 500000,
    color: '#12211e',
    tag: 'Opening Balance'
  },
  {
    node: 'Supplier',
    kind: 'out',
    title: 'Supplier Payment',
    desc: 'Paid to Annapoorna Distributors to clear outstanding rice accounts.',
    amount: 320000,
    color: '#fb923c',
    tag: 'Outflow'
  },
  {
    node: 'Inventory',
    kind: 'out',
    title: 'Stock Purchase (5,500 kg)',
    desc: 'Restocked India Gate rice and premium sunflower oils ahead of festival season.',
    amount: 150000,
    color: '#38bdf8',
    tag: 'Asset'
  },
  {
    node: 'Credit',
    kind: 'in',
    title: 'Customer Credit Sales',
    desc: 'Outstanding credit invoices issued to 8 local retail accounts. Payment pending.',
    amount: 140706,
    color: '#818cf8',
    tag: 'Receivable'
  },
  {
    node: 'GST Ledger',
    kind: 'tax',
    title: 'GST Liability',
    desc: '18% GST captured and locked in the GST ledger for the monthly filing buffer.',
    amount: 39294,
    color: '#f59e0b',
    tag: 'Liability'
  },
  {
    node: 'Balance',
    kind: 'end',
    title: 'Remaining Cash',
    desc: 'Fully reconciled. Every rupee is trace-linked to assets, receivables or liabilities.',
    amount: 0,
    color: '#22c55e',
    tag: 'Reconciled'
  }
];

const RANGE_SCALE = { '14': 1, '30': 1.85, '90': 4.4 };

export default function TimeMachine() {
  const [range, setRange] = useState('14');
  const [filter, setFilter] = useState('all');
  const [replaying, setReplaying] = useState(false);
  const [revealed, setRevealed] = useState({});

  const scale = RANGE_SCALE[range];
  const flowSteps = BASE_FLOW.map((s) => ({ ...s, amount: Math.round(s.amount * scale) }));

  const filters = [
    { id: 'all', label: 'All Flows' },
    { id: 'out', label: 'Outflows' },
    { id: 'in', label: 'Receivables' },
    { id: 'tax', label: 'Liabilities' }
  ];

  const visible = flowSteps.filter((s) => s.kind === 'start' || s.kind === 'end' || filter === 'all' || s.kind === filter);

  const spent = flowSteps.filter((s) => s.kind !== 'end').reduce((a, s) => a + s.amount, 0);

  const startReplay = () => {
    setReplaying(true);
    setRevealed({});
    const keys = visible.map((s) => s.title);
    keys.forEach((k, i) => setTimeout(() => setRevealed((r) => ({ ...r, [k]: true })), 300 * (i + 1)));
    setTimeout(() => setReplaying(false), 300 * keys.length + 250);
  };

  return (
    <div className="centered-view">
      <div className="view-title">
        <p className="eyebrow">RECONCILE EVERY SINGLE RUPEE</p>
        <h2>Business Time Machine</h2>
        <p>Rewind cash and asset flows to see exactly where funds were deployed — and confirm nothing was lost.</p>
      </div>

      <div className="time-machine-container">
        {/* ── Control Bar ─────────────────────────────── */}
        <div className="tm-toolbar">
          <div className="tm-query">
            <span className="tm-query-icon"><SVG.Search /></span>
            <span>"Where did my ₹5 lakh go?"</span>
          </div>

          <div className="tm-range-tabs" role="tablist">
            {Object.entries(RANGES).map(([id, label]) => (
              <button
                key={id}
                className={`tm-range-tab ${range === id ? 'active' : ''}`}
                onClick={() => setRange(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Filter chips + action bar ───────────────── */}
        <div className="tm-actionbar">
          <div className="tm-filters">
            {filters.map((f) => (
              <button
                key={f.id}
                className={`tm-chip ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="tm-actions">
            <button className="tm-btn tm-btn-replay" onClick={startReplay} disabled={replaying}>
              <SVG.Play /> {replaying ? 'Replaying…' : 'Replay Flow'}
            </button>
            <button className="tm-btn tm-btn-ghost">
              <SVG.Print /> Export Report
            </button>
          </div>
        </div>

        {/* ── Allocation Bar ──────────────────────────── */}
        <div className="tm-alloc">
          <div className="tm-alloc-head">
            <span>Where the funds went</span>
            <b>{fmt(spent)} traced</b>
          </div>
          <div className="tm-alloc-bar">
            {flowSteps.filter((s) => s.kind !== 'end').map((s) => (
              <div
                key={s.title}
                className="tm-alloc-seg"
                style={{ width: `${pct(s.amount, spent)}%`, background: s.color }}
                title={`${s.tag} — ${fmt(s.amount)} (${pct(s.amount, spent)}%)`}
              />
            ))}
          </div>
          <div className="tm-alloc-legend">
            {flowSteps.filter((s) => s.kind !== 'end').map((s) => (
              <span key={s.title}>
                <i style={{ background: s.color }} /> {s.tag} · {pct(s.amount, spent)}%
              </span>
            ))}
          </div>
        </div>

        {/* ── Flow timeline ───────────────────────────── */}
        <div className="tm-flow">
          {visible.map((step, idx) => (
            <div key={step.title} className={`tm-flow-step ${revealed[step.title] ? 'revealed' : ''}`}>
              <div className="tm-node" style={{ borderColor: step.color, color: step.color }}>
                {step.node}
                <span className={`tm-node-kind kind-${step.kind}`}>{step.tag}</span>
              </div>
              <div className="tm-direction">
                {idx < visible.length - 1 ? <SVG.ArrowDown /> : <SVG.Check />}
              </div>
              <div className="tm-card">
                <div className="tm-card-top">
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                  {step.kind !== 'start' && step.kind !== 'end' && (
                    <button className="tm-card-btn" onClick={() => setRevealed((r) => ({ ...r, [step.title]: true }))}>
                      <SVG.Eye /> Trace
                    </button>
                  )}
                </div>
                <div className="tm-card-foot">
                  <span className="tm-amount" style={{ color: step.color }}>
                    {step.kind === 'start' ? '' : step.kind === 'in' ? '+' : '-'}{fmt(step.amount)}
                  </span>
                  <span className="tm-share">{pct(step.amount, spent)}% of traced</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Reconciliation footer bar ───────────────── */}
        <div className="tm-footer">
          <div className="tm-footer-stat">
            <span>Total traced</span>
            <b>{fmt(flowSteps.reduce((a, s) => a + s.amount, 0))}</b>
          </div>
          <div className="tm-footer-stat">
            <span>Receivables pending</span>
            <b>{fmt(flowSteps.find((s) => s.kind === 'in').amount)}</b>
          </div>
          <div className="tm-footer-stat">
            <span>Unreconciled</span>
            <b className="tm-balance">₹0 · Fully reconciled</b>
          </div>
          <button className="tm-btn tm-btn-solid" onClick={startReplay}>
            <SVG.Zap /> Verify Reconciliation
          </button>
        </div>
      </div>
    </div>
  );
}

const pct = (value, total) => (total ? Math.round((value / total) * 100) : 0);