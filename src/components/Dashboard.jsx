import React, { useState } from 'react';

/* ─── SVG Icons ─────────────────────────────────────────────── */
const Icon = {
  Cash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  Sales: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Dues: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Stock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    </svg>
  ),
  Arrow: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  Scan: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" /><line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  ),
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const HOUR = new Date().getHours();
const GREETING = HOUR < 12 ? 'Good morning' : HOUR < 17 ? 'Good afternoon' : 'Good evening';

/* ─── Sparkline ─────────────────────────────────────────────── */
function Spark({ points, color }) {
  const max = Math.max(...points), min = Math.min(...points);
  const range = max - min || 1;
  const W = 70, H = 24;
  const step = W / (points.length - 1);
  const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)} ${(H - ((v - min) / range) * H).toFixed(1)}`).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.25" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d + ` L${W} ${H} L0 ${H} Z`} fill={`url(#sg-${color})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Bar Chart ──────────────────────────────────────────────── */
function BarChart({ inflow, outflow }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const inflowData = [980000, 1120000, 1050000, 1380000, 1250000, 1560000, inflow];
  const outflowData = [720000, 840000, 780000, 1020000, 950000, 1100000, outflow];
  const maxVal = Math.max(...inflowData, ...outflowData);
  return (
    <div className="db-bar-chart">
      {months.map((m, i) => (
        <div key={m} className="db-bar-col">
          <div className="db-bar-pair">
            <div className="db-bar db-bar-in" style={{ height: `${(inflowData[i] / maxVal) * 100}%` }} title={fmt(inflowData[i])} />
            <div className="db-bar db-bar-out" style={{ height: `${(outflowData[i] / maxVal) * 100}%` }} title={fmt(outflowData[i])} />
          </div>
          <span className="db-bar-label">{m}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Clean Streamlined Dashboard Component ─────────────────── */
export default function Dashboard({ branchState, selectedBranchId, onStateUpdate, onResolveAction, aiAnswer, onCloseAnswer, setView }) {
  const [uploading, setUploading] = useState(null);
  const [uploadMsg, setUploadMsg] = useState('');

  if (!branchState) return <div className="spinner" style={{ margin: '60px auto' }} />;

  const { metrics, cashFlow, actions } = branchState;

  const handleUpload = async (fileType) => {
    setUploading(fileType);
    setUploadMsg('AI is processing document…');
    setTimeout(async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ branchId: selectedBranchId, fileType })
        });
        const data = await res.json();
        setUploadMsg(data.message);
        onStateUpdate(data.branch);
        setTimeout(() => { setUploading(null); setUploadMsg(''); }, 2500);
      } catch {
        setUploading(null); setUploadMsg('');
      }
    }, 1200);
  };

  const sparkCash = [38, 42, 39, 51, 47, 53, 58, 61, 55, 70];
  const sparkSales = [62, 70, 65, 80, 77, 88, 82, 91, 85, 95];
  const sparkDues = [44, 48, 52, 49, 55, 58, 61, 57, 63, 60];
  const sparkInv = [80, 77, 82, 78, 75, 71, 74, 70, 67, 72];

  return (
    <div className="db-root">

      {/* ── Hero Greeting Bar ──────────────────────────────────── */}
      <header className="db-hero">
        <div className="db-hero-left">
          <p className="db-greeting">{GREETING}, Ramesh 👋</p>
          <h1 className="db-hero-title">Sri Lakshmi Traders</h1>
          <p className="db-hero-sub">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="db-hero-right">
          {actions.length > 0 && (
            <div className="db-alert-pill">
              <Icon.Bell />
              <span>{actions.length} action{actions.length > 1 ? 's' : ''} required</span>
            </div>
          )}
          <div className="db-hero-net">
            <span className="db-hero-net-label">Net this month</span>
            <span className="db-hero-net-val" style={{ color: cashFlow.net >= 0 ? '#22c55e' : '#ef4444' }}>
              {cashFlow.net >= 0 ? '+' : ''}{fmt(cashFlow.net)}
            </span>
          </div>
        </div>
      </header>

      {/* ── 4 KPI Cards Row ────────────────────────────────────── */}
      <section className="db-kpi-row">
        {[
          { label: 'Cash in Bank', val: metrics.cashInBank, change: metrics.cashInChange, positive: true, spark: sparkCash, color: '#22c55e', Icon: Icon.Cash, accent: 'kpi-green' },
          { label: 'Sales This Month', val: metrics.salesThisMonth, change: metrics.salesChange, positive: true, spark: sparkSales, color: '#818cf8', Icon: Icon.Sales, accent: 'kpi-purple' },
          { label: 'Customers Owe', val: metrics.customersOwe, change: metrics.oweChange, positive: false, spark: sparkDues, color: '#fb923c', Icon: Icon.Dues, accent: 'kpi-orange' },
          { label: 'Inventory Value', val: metrics.inventoryValue, change: metrics.inventoryChange, positive: null, spark: sparkInv, color: '#38bdf8', Icon: Icon.Stock, accent: 'kpi-blue' },
        ].map(({ label, val, change, positive, spark, color, Icon: Ic, accent }) => (
          <article key={label} className={`db-kpi-card ${accent}`}>
            <div className="db-kpi-top">
              <div className="db-kpi-icon"><Ic /></div>
              <Spark points={spark} color={color} />
            </div>
            <p className="db-kpi-label">{label}</p>
            <h2 className="db-kpi-val">{fmt(val)}</h2>
            <p className={`db-kpi-change ${positive === true ? 'pos' : positive === false ? 'neg' : 'neu'}`}>
              {positive === true ? '↑' : positive === false ? '↓' : '↔'} {change}
            </p>
          </article>
        ))}
      </section>

      {/* ── Clean 2-Column Main Section ────────────────────────── */}
      <div className="db-clean-grid">

        {/* Left Column: Cash Flow Chart */}
        <article className="db-panel db-panel-cashflow">
          <div className="db-panel-header">
            <div>
              <p className="db-eyebrow">Money Movement</p>
              <h3 className="db-panel-title">Cash Flow</h3>
            </div>
            <div className="db-cf-legend">
              <span className="db-leg-dot" style={{ background: '#22c55e' }} /> Inflow
              <span className="db-leg-dot" style={{ background: '#fb923c', marginLeft: 10 }} /> Outflow
            </div>
          </div>
          <div className="db-cf-totals">
            <div><span className="db-cf-label">Inflow</span><b className="db-cf-num in">₹{(cashFlow.inflow / 100000).toFixed(1)}L</b></div>
            <div className="db-cf-divider" />
            <div><span className="db-cf-label">Outflow</span><b className="db-cf-num out">₹{(cashFlow.outflow / 100000).toFixed(1)}L</b></div>
            <div className="db-cf-divider" />
            <div><span className="db-cf-label">Net Buffer</span><b className="db-cf-num" style={{ color: cashFlow.net >= 0 ? '#22c55e' : '#ef4444' }}>{cashFlow.net >= 0 ? '+' : ''}₹{(cashFlow.net / 100000).toFixed(1)}L</b></div>
          </div>
          <BarChart inflow={cashFlow.inflow} outflow={cashFlow.outflow} />
        </article>

        {/* Right Column: AI Priorities & Actions */}
        <div className="db-right-column">

          {/* Quick Actions */}
          <section className="db-quick-row" style={{ marginTop: 0 }}>
            <div className="db-quick-tiles">
              <button className="db-quick-tile" onClick={() => setView && setView('billing')}>
                <div className="db-qt-icon qt-green"><Icon.Plus /></div>
                <span>New Bill</span>
              </button>
              <button className="db-quick-tile" onClick={() => handleUpload('upi')} disabled={!!uploading}>
                <div className="db-qt-icon qt-purple"><Icon.Scan /></div>
                <span>Scan UPI</span>
              </button>
              <button className="db-quick-tile" onClick={() => handleUpload('invoice')} disabled={!!uploading}>
                <div className="db-qt-icon qt-orange"><Icon.Upload /></div>
                <span>Upload Bill</span>
              </button>
              <button className="db-quick-tile" onClick={() => setView && setView('chatbot')}>
                <div className="db-qt-icon qt-blue"><Icon.Zap /></div>
                <span>Ask AI</span>
              </button>
            </div>
            {uploading && (
              <div className="db-upload-toast">
                <span className="spinner" />
                <span>{uploadMsg}</span>
              </div>
            )}
          </section>

          {/* AI Priorities List */}
          <article className="db-panel db-panel-actions">
            <div className="db-panel-header">
              <div>
                <p className="db-eyebrow">AI Priorities</p>
                <h3 className="db-panel-title">Needs Attention</h3>
              </div>
              {actions.length > 0 && <span className="db-badge">{actions.length}</span>}
            </div>
            <div className="db-action-list">
              {actions.length === 0 ? (
                <div className="db-all-clear">
                  <Icon.Check />
                  <p>All clear! VyapaarOS is fully reconciled.</p>
                </div>
              ) : actions.map(act => (
                <button key={act.id} className={`db-action-row db-action-${act.type}`} onClick={() => onResolveAction(act.id)}>
                  <div className={`db-action-dot dot-${act.type}`} />
                  <div className="db-action-text">
                    <b>{act.title}</b>
                    <p>{act.desc}</p>
                  </div>
                  <Icon.Arrow />
                </button>
              ))}
            </div>
          </article>
        </div>
      </div>

      {/* ── AI Answer Card ────────────────────────────────────── */}
      {aiAnswer && (
        <section className="answer-card">
          <div className="answer-ai">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div>
            <p className="eyebrow">VYAAPAROS INTEL ADVISOR</p>
            <h3>{aiAnswer.title}</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{aiAnswer.body}</p>
          </div>
          <button className="close-answer" onClick={onCloseAnswer} aria-label="Close"><Icon.Close /></button>
        </section>
      )}
    </div>
  );
}
