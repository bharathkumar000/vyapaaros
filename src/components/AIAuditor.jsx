import React, { useState, useEffect } from 'react';

/* ── Icons ───────────────────────────────────────────── */
const Icon = {
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

/* ── Config per audit ─────────────────────────────────── */
const AUDIT_CONFIG = {
  'audit-1': { icon: Icon.Duplicate, color: '#ef4444', bg: '#fee2e2', action: 'Refund Payout', category: 'Duplicate Payment', code: 'PAY-2001' },
  'audit-2': { icon: Icon.GST,       color: '#f59e0b', bg: '#fef9c3', action: 'Auto-Fix GST',  category: 'GST Compliance',  code: 'TAX-3102' },
  'audit-3': { icon: Icon.Refund,    color: '#8b5cf6', bg: '#ede9fe', action: 'Dismiss',        category: 'Refund Pattern',  code: 'RFN-1189' },
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
    <svg width="92" height="92" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
      <path d="M18 2.0845a15.9155 15.9155 0 010 31.831A15.9155 15.9155 0 0118 2.0845"
        fill="none" stroke="#edf2f0" strokeWidth="3.5" />
      <path d="M18 2.0845a15.9155 15.9155 0 010 31.831A15.9155 15.9155 0 0118 2.0845"
        fill="none" stroke={color} strokeWidth="3.5"
        strokeDasharray={`${score}, 100`}
        style={{ strokeLinecap: 'round', transition: 'stroke-dasharray 1s ease' }} />
      <g transform="rotate(90 18 18)">
        <text x="18" y="16.2" textAnchor="middle" style={{ fontSize: '7px', fontWeight: 800, fill: color }}>{score}%</text>
        <text x="18" y="21.5" textAnchor="middle" style={{ fontSize: '3.2px', fontWeight: 700, fill: '#9ca3af', letterSpacing: '0.6px' }}>HEALTH</text>
      </g>
    </svg>
  );
}

export default function AIAuditor({ branchState, onResolveAction }) {
  const [scanning, setScanning] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setScanning(false), 2200);
    return () => clearTimeout(t);
  }, []);

  if (!branchState) return null;
  const { audits } = branchState;

  const unresolved = audits.filter(a => !a.resolved);
  const resolved   = audits.filter(a => a.resolved);
  const score = unresolved.length === 3 ? 84 : unresolved.length === 2 ? 90 : unresolved.length === 1 ? 95 : 100;

  const sevColor = score >= 95 ? '#22c55e' : score >= 88 ? '#f59e0b' : '#ef4444';

  const matches = (item) => {
    const cfg = AUDIT_CONFIG[item.id] || { category: 'Audit' };
    const hay = `${item.title} ${item.desc} ${item.severity} ${cfg.category}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  };
  const base = filter === 'all' ? audits : filter === 'open' ? unresolved : resolved;
  const displayed = base.filter(matches);

  const counts = {
    high: audits.filter(a => a.severity === 'high').length,
    med: audits.filter(a => a.severity === 'med').length,
    low: audits.filter(a => a.severity === 'low').length,
    resolved: resolved.length,
  };

  return (
    <div className="aud2-root">

      {/* ── Hero header ─────────────────────────────────────── */}
      <section className="aud2-hero">
        <div className="aud2-hero-top">
          <div className="aud2-hero-left">
            <div className="aud2-hero-badge">
              <Icon.Shield />
              <span>AI GOVERNANCE CORE</span>
            </div>
            <h1 className="aud2-hero-title">Audit &amp; Log</h1>
            <p className="aud2-hero-sub">
              Continuous anomaly detection across invoices, UPI, WhatsApp orders, bank webhooks &amp; GST filings.
            </p>
          </div>

          <div className="aud2-live-chip">
            <span className="aud2-live-dot" />
            {scanning ? 'Auditing live…' : 'Monitoring active'}
          </div>
        </div>

        <div className="aud2-hero-grid">
          {/* Health */}
          <div className="aud2-health-card">
            <div className="aud2-health-ring"><HealthRing score={score} /></div>
            <div className="aud2-health-info">
              <label>Ledger Health Score</label>
              <b style={{ color: sevColor }}>
                {score === 100 ? 'Fully Reconciled' : score >= 90 ? 'Minor Anomalies' : 'Needs Attention'}
              </b>
              <span>{unresolved.length} open · {resolved.length} resolved</span>
            </div>
          </div>

          {/* KPI cards */}
          <div className="aud2-kpis">
            <div className="aud2-kpi aud2-kpi-red">
              <span className="aud2-kpi-num">{counts.high}</span>
              <span className="aud2-kpi-label">High Risk</span>
            </div>
            <div className="aud2-kpi aud2-kpi-amber">
              <span className="aud2-kpi-num">{counts.med}</span>
              <span className="aud2-kpi-label">Warnings</span>
            </div>
            <div className="aud2-kpi aud2-kpi-purple">
              <span className="aud2-kpi-num">{counts.low}</span>
              <span className="aud2-kpi-label">Info</span>
            </div>
            <div className="aud2-kpi aud2-kpi-green">
              <span className="aud2-kpi-num">{counts.resolved}</span>
              <span className="aud2-kpi-label">Resolved</span>
            </div>
          </div>

          {/* Scan strip */}
          <div className="aud2-scan">
            <div className="aud2-scan-head">
              <span className="aud2-scan-icon"><Icon.Scan /></span>
              <div>
                <b>AI Monitoring</b>
                <p>Scanning invoices, UPI logs, WhatsApp &amp; bank statements for anomalies.</p>
              </div>
            </div>
            {scanning && (
              <div className="aud2-progress"><div className="aud2-progress-fill" /></div>
            )}
            {!scanning && (
              <div className="aud2-scan-foot">
                <Icon.Clock /> Last scan today, {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Toolbar ────────────────────────────────────────── */}
      <section className="aud2-toolbar">
        <div className="aud2-search">
          <Icon.Search />
          <input
            type="text"
            placeholder="Search audit entries…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="aud2-tabs">
          {[
            { key: 'all', label: 'All', n: audits.length },
            { key: 'open', label: 'Open', n: unresolved.length },
            { key: 'resolved', label: 'Resolved', n: resolved.length },
          ].map(t => (
            <button
              key={t.key}
              className={`aud2-tab ${filter === t.key ? 'aud2-tab-active' : ''}`}
              onClick={() => setFilter(t.key)}
            >
              {t.label} <span className="aud2-tab-count">{t.n}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Timeline log ───────────────────────────────────── */}
      <section className="aud2-list">
        {displayed.length === 0 && (
          <div className="aud2-empty">
            <Icon.Check />
            <b>All clear</b>
            <p>No {filter} audit entries{query.trim() ? ` matching "“${query}”"` : ''}.</p>
          </div>
        )}

        {displayed.map((item, idx) => {
          const sev = SEVERITY_MAP[item.severity] || SEVERITY_MAP.low;
          const cfg = AUDIT_CONFIG[item.id] || { icon: Icon.Alert, color: '#6b7280', bg: '#f3f4f6', action: 'Resolve', category: 'Audit', code: 'AUD-0000' };
          const AuditIcon = cfg.icon;
          const isResolved = item.resolved;

          return (
            <article key={item.id} className={`aud2-entry ${isResolved ? 'aud2-entry-resolved' : ''}`}>
              {/* Timeline spine */}
              <div className="aud2-spine">
                <span
                  className="aud2-spine-dot"
                  style={{ background: isResolved ? '#cbd5e1' : sev.dot, boxShadow: isResolved ? 'none' : `0 0 0 4px ${sev.bg}` }}
                />
                {idx < displayed.length - 1 && <span className="aud2-spine-line" />}
              </div>

              <div className="aud2-entry-card" style={{ borderLeftColor: isResolved ? '#cbd5e1' : sev.dot }}>
                <div className="aud2-entry-icon" style={{ background: isResolved ? '#f1f5f9' : cfg.bg }}>
                  <AuditIcon color={isResolved ? '#9ca3af' : cfg.color} />
                </div>

                <div className="aud2-entry-body">
                  <div className="aud2-entry-meta">
                    <span className="aud2-tag" style={{ background: isResolved ? '#f1f5f9' : cfg.bg, color: isResolved ? '#9ca3af' : cfg.color }}>
                      {cfg.category}
                    </span>
                    <span className="aud2-code">{cfg.code}</span>
                    <span className="aud2-pill" style={{ background: isResolved ? '#f1f5f9' : sev.bg, color: isResolved ? '#9ca3af' : sev.color }}>
                      <span className="aud2-pill-dot" style={{ background: isResolved ? '#9ca3af' : sev.dot }} />
                      {isResolved ? 'Resolved' : sev.label}
                    </span>
                  </div>

                  <h3 className="aud2-title" style={{ color: isResolved ? '#9ca3af' : undefined }}>{item.title}</h3>
                  <p className="aud2-desc">{item.desc}</p>
                </div>

                <div className="aud2-entry-action">
                  {isResolved ? (
                    <span className="aud2-done"><Icon.Check />Resolved</span>
                  ) : (
                    <button className="aud2-resolve-btn" style={{ background: cfg.color }} onClick={() => onResolveAction(item.id)}>
                      {cfg.action}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* ── Coverage footer ────────────────────────────────── */}
      <section className="aud2-footer">
        <div className="aud2-footer-covers">
          {['Invoices', 'UPI Logs', 'WhatsApp', 'Bank Statement', 'Refunds', 'GST Filings'].map(c => (
            <span key={c} className="aud2-cover"><Icon.Check />{c}</span>
          ))}
        </div>
        <p className="aud2-footer-note">◇ Continuous anomaly detection · Auto-reconciliation · Instant resolution</p>
      </section>
    </div>
  );
}