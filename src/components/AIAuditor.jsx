import React, { useState, useEffect } from 'react';

/* ── Icons ───────────────────────────────────────────── */
const Icon = {
  Shield: ({ color = 'currentColor' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  Duplicate: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
  GST: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="15" y2="16" />
    </svg>
  ),
  Refund: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 14 4 9 9 4" /><path d="M20 20v-7a4 4 0 00-4-4H4" />
    </svg>
  ),
  Scan: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  ),
};

/* ── Config per audit ─────────────────────────────────── */
const AUDIT_CONFIG = {
  'audit-1': { icon: Icon.Duplicate, color: '#ef4444', bg: '#fee2e2', action: 'Refund Payout', category: 'Duplicate Payment' },
  'audit-2': { icon: Icon.GST,       color: '#f59e0b', bg: '#fef9c3', action: 'Auto-Fix GST',  category: 'GST Compliance' },
  'audit-3': { icon: Icon.Refund,    color: '#8b5cf6', bg: '#ede9fe', action: 'Dismiss',        category: 'Refund Pattern' },
};

const SEVERITY_MAP = {
  high: { label: 'High Risk', bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
  med:  { label: 'Warning',   bg: '#fef9c3', color: '#92400e', dot: '#f59e0b' },
  low:  { label: 'Info',      bg: '#ede9fe', color: '#6d28d9', dot: '#8b5cf6' },
};

/* ── Health ring ─────────────────────────────────────── */
function HealthRing({ score }) {
  const color = score >= 95 ? '#22c55e' : score >= 88 ? '#f59e0b' : '#ef4444';
  return (
    <svg width="80" height="80" viewBox="0 0 36 36">
      <path d="M18 2.0845a15.9155 15.9155 0 010 31.831A15.9155 15.9155 0 0118 2.0845"
        fill="none" stroke="#f0f0f0" strokeWidth="3.5" />
      <path d="M18 2.0845a15.9155 15.9155 0 010 31.831A15.9155 15.9155 0 0118 2.0845"
        fill="none" stroke={color} strokeWidth="3.5"
        strokeDasharray={`${score}, 100`}
        style={{ strokeLinecap: 'round', transition: 'stroke-dasharray 1s ease' }} />
      <text x="18" y="15.5" textAnchor="middle" style={{ fontSize: '7px', fontWeight: 800, fill: color }}>{score}%</text>
      <text x="18" y="21.5" textAnchor="middle" style={{ fontSize: '3.5px', fontWeight: 700, fill: '#9ca3af', letterSpacing: '0.5px' }}>HEALTH</text>
    </svg>
  );
}

export default function AIAuditor({ branchState, onResolveAction }) {
  const [scanning, setScanning] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const t = setTimeout(() => setScanning(false), 2200);
    return () => clearTimeout(t);
  }, []);

  if (!branchState) return null;
  const { audits } = branchState;

  const unresolved = audits.filter(a => !a.resolved);
  const resolved   = audits.filter(a => a.resolved);
  const score = unresolved.length === 3 ? 84 : unresolved.length === 2 ? 90 : unresolved.length === 1 ? 95 : 100;

  const displayed = filter === 'all' ? audits : filter === 'open' ? unresolved : resolved;

  return (
    <div className="aud-root">

      {/* ── Top summary bar ───────────────────────────────── */}
      <div className="aud-summary-bar">

        {/* Health ring */}
        <div className="aud-health-block">
          <HealthRing score={score} />
          <div>
            <p className="aud-eyebrow">Book Health Score</p>
            <h2 className="aud-headline">
              {score === 100 ? 'Fully Reconciled' : score >= 90 ? 'Minor Issues Found' : 'Needs Attention'}
            </h2>
            <p className="aud-sub">
              {scanning
                ? <span className="aud-scanning"><span className="aud-scan-dot" />Scanning ledger, invoices &amp; payments…</span>
                : `${unresolved.length} open anomal${unresolved.length === 1 ? 'y' : 'ies'} · ${resolved.length} resolved`
              }
            </p>
          </div>
        </div>

        {/* Stat chips */}
        <div className="aud-stat-chips">
          <div className="aud-chip chip-red">
            <span className="aud-chip-num">{audits.filter(a => a.severity === 'high').length}</span>
            <span className="aud-chip-label">High Risk</span>
          </div>
          <div className="aud-chip chip-amber">
            <span className="aud-chip-num">{audits.filter(a => a.severity === 'med').length}</span>
            <span className="aud-chip-label">Warnings</span>
          </div>
          <div className="aud-chip chip-purple">
            <span className="aud-chip-num">{audits.filter(a => a.severity === 'low').length}</span>
            <span className="aud-chip-label">Info</span>
          </div>
          <div className="aud-chip chip-green">
            <span className="aud-chip-num">{resolved.length}</span>
            <span className="aud-chip-label">Resolved</span>
          </div>
        </div>

        {/* Scanner strip */}
        <div className="aud-scan-strip">
          <div className="aud-scan-icon"><Icon.Scan /></div>
          <div>
            <p className="aud-eyebrow" style={{ marginBottom: 4 }}>AI Monitoring</p>
            <p className="aud-scan-desc">Continuously scanning invoices, UPI logs, WhatsApp orders &amp; bank webhooks for anomalies.</p>
            {scanning && <div className="aud-progress-bar"><div className="aud-progress-fill" /></div>}
          </div>
        </div>
      </div>

      {/* ── Filter tabs ───────────────────────────────────── */}
      <div className="aud-tab-row">
        {['all', 'open', 'resolved'].map(f => (
          <button key={f} className={`aud-tab ${filter === f ? 'aud-tab-active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${audits.length})` : f === 'open' ? `Open (${unresolved.length})` : `Resolved (${resolved.length})`}
          </button>
        ))}
      </div>

      {/* ── Audit cards ───────────────────────────────────── */}
      <div className="aud-card-list">
        {displayed.length === 0 && (
          <div className="aud-empty">
            <Icon.Check />
            <p>No items in this category.</p>
          </div>
        )}

        {displayed.map(item => {
          const sev = SEVERITY_MAP[item.severity] || SEVERITY_MAP.low;
          const cfg = AUDIT_CONFIG[item.id] || { icon: Icon.Info, color: '#6b7280', bg: '#f3f4f6', action: 'Resolve', category: 'Audit' };
          const AuditIcon = cfg.icon;

          return (
            <article key={item.id} className={`aud-card ${item.resolved ? 'aud-card-resolved' : ''}`}>
              {/* Left icon */}
              <div className="aud-card-icon-wrap" style={{ background: item.resolved ? '#f3f4f6' : cfg.bg }}>
                <AuditIcon color={item.resolved ? '#9ca3af' : cfg.color} />
              </div>

              {/* Body */}
              <div className="aud-card-body">
                <div className="aud-card-meta">
                  <span className="aud-category-tag" style={{ background: item.resolved ? '#f3f4f6' : cfg.bg, color: item.resolved ? '#9ca3af' : cfg.color }}>
                    {cfg.category}
                  </span>
                  <span className="aud-sev-pill" style={{ background: item.resolved ? '#f3f4f6' : sev.bg, color: item.resolved ? '#9ca3af' : sev.color }}>
                    <span className="aud-sev-dot" style={{ background: item.resolved ? '#9ca3af' : sev.dot }} />
                    {item.resolved ? 'Resolved' : sev.label}
                  </span>
                </div>
                <h3 className="aud-card-title" style={{ color: item.resolved ? '#9ca3af' : undefined }}>{item.title}</h3>
                <p className="aud-card-desc">{item.desc}</p>
              </div>

              {/* Action */}
              <div className="aud-card-action">
                {item.resolved ? (
                  <span className="aud-resolved-badge"><Icon.Check />Resolved</span>
                ) : (
                  <button className="aud-action-btn" style={{ background: cfg.color }} onClick={() => onResolveAction(item.id)}>
                    {cfg.action}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* ── Coverage footer ─────────────────────────────── */}
      <div className="aud-footer">
        <p>🔍 Last full scan: <b>Today, {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</b></p>
        <p>Coverage: Invoices · UPI · WhatsApp · Bank Statement · Refunds · GST Filings</p>
      </div>
    </div>
  );
}
