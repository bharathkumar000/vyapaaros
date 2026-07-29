import React, { useState, useEffect } from 'react';

export default function AIAuditor({ branchState, onResolveAction }) {
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    // Show a scanning bar loader on mount
    const timer = setTimeout(() => {
      setScanning(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!branchState) return null;
  const { audits } = branchState;

  // Dynamically calculate Business Health Score based on open anomalies
  const unresolvedCount = audits.filter(a => !a.resolved).length;
  let healthScore = 100;
  if (unresolvedCount === 3) healthScore = 84;
  else if (unresolvedCount === 2) healthScore = 90;
  else if (unresolvedCount === 1) healthScore = 95;

  return (
    <div className="centered-view">
      <div className="view-title">
        <p className="eyebrow">CONTINUOUSLY WATCHING YOUR BOOKS</p>
        <h2>AI Auditor Log</h2>
        <p>Small anomalies caught before they become expensive mistakes. Audits are performed in real-time.</p>
      </div>

      {/* Health Meter Block */}
      <div className="auditor-health-section">
        <div className="auditor-health-meter">
          <div className="health-ring-container">
            <svg width="90" height="90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#eef3f1"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#69cbb1"
                strokeWidth="3.5"
                strokeDasharray={`${healthScore}, 100`}
                style={{ strokeLinecap: 'round', transition: 'stroke-dasharray 0.5s ease-out' }}
              />
            </svg>
            <div className="health-score-text">
              <h3>{healthScore}%</h3>
              <span>HEALTH</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p className="eyebrow" style={{ margin: 0 }}>LIVE ACCOUNT AUDITOR STATUS</p>
          <h3 style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: 700 }}>
            {scanning ? '🔍 Scanning ledger statements & invoices...' : `Audit scan finished. ${unresolvedCount} anomalies need review.`}
          </h3>
          
          {scanning && (
            <div className="scan-container">
              <div className="scan-line"></div>
            </div>
          )}
          
          <p style={{ fontSize: '9px', color: '#71807e', margin: '4px 0 0' }}>
            VyapaarOS AI scans invoices, WhatsApp delivery messages, and bank webhooks to prevent duplicate payouts, GST leakage, or theft.
          </p>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="audit-list">
        {audits.map(item => (
          <article key={item.id} className={item.resolved ? 'audit-resolved' : ''}>
            <span className={`severity ${item.severity}`}></span>
            <div>
              <b>{item.title}</b>
              <p>{item.desc}</p>
            </div>
            {item.resolved ? (
              <button disabled style={{ background: '#e0e5e2', color: '#7a8581', cursor: 'default' }}>
                Resolved ✓
              </button>
            ) : (
              <button onClick={() => onResolveAction(item.id)}>
                {item.id === 'audit-1' ? 'Refund Cash' : item.id === 'audit-2' ? 'Auto-Fix GST' : 'Resolve'} →
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
