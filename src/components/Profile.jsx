import React, { useState } from 'react';

const SVG = {
  User: () => (
    <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', strokeWidth: '2.5px', fill: 'none', stroke: 'currentColor', marginRight: '8px', verticalAlign: 'middle' }}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Globe: () => (
    <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', strokeWidth: '2.5px', fill: 'none', stroke: 'currentColor', marginRight: '8px', verticalAlign: 'middle' }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', strokeWidth: '2.5px', fill: 'none', stroke: 'currentColor', marginRight: '8px', verticalAlign: 'middle' }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
};

export default function Profile({ branchState }) {
  const [lang, setLang] = useState('Kannada + English');
  const [langOpen, setLangOpen] = useState(false);

  const langOptions = [
    { val: 'Kannada + English', label: 'Kannada + English (Default)' },
    { val: 'Hindi + English', label: 'Hindi + English' },
    { val: 'Tamil + English', label: 'Tamil + English' },
    { val: 'Telugu + English', label: 'Telugu + English' }
  ];

  return (
    <div className="centered-view" style={{ maxWidth: '780px', margin: 'auto' }}>
      <div className="view-title" style={{ marginBottom: '25px' }}>
        <p className="eyebrow">USER PROFILE & OS PREFERENCES</p>
        <h2>Proprietor Profile & Settings</h2>
        <p style={{ fontSize: '13px', color: 'var(--ink-secondary)' }}>Manage Ramesh Kumar's administrative credentials and voice language interaction thresholds.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        
        {/* Left: User Card */}
        <div style={{ background: 'white', border: '1px solid var(--line-primary)', borderRadius: '12px', padding: '25px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #57d4b4, #1e6c5c)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '20px', fontWeight: 800 }}>
              RK
            </div>
            <div>
              <h3 style={{ fontSize: '16px', margin: 0 }}>Ramesh Kumar</h3>
              <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', margin: '2px 0 0' }}>Proprietor & Admin Account</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '12px', borderTop: '1px solid #eef2f0', paddingTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: 'var(--ink-secondary)' }}>Enterprise Name:</span>
              <b>Sri Lakshmi Groceries</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: 'var(--ink-secondary)' }}>Operating Location:</span>
              <b>Bengaluru, Karnataka</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: 'var(--ink-secondary)' }}>Registered GSTIN:</span>
              <b style={{ color: 'var(--brand-primary)' }}>29AAAAA0000A1Z5</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: 'var(--ink-secondary)' }}>Access Level:</span>
              <b style={{ textTransform: 'uppercase', fontSize: '10.5px', color: 'var(--state-success)', background: 'var(--state-success-bg)', padding: '2px 8px', borderRadius: '10px' }}>System Administrator</b>
            </div>
          </div>
        </div>

        {/* Right: OS Preferences */}
        <div style={{ background: 'white', border: '1px solid var(--line-primary)', borderRadius: '12px', padding: '25px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '15px', color: '#194e47', display: 'flex', alignItems: 'center' }}>
            <SVG.Globe /> Voice & Interaction Preferences
          </h3>

          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#556c67', marginBottom: '6px' }}>Voice Command Ingestion Language</label>
            <div 
              onClick={() => setLangOpen(!langOpen)}
              style={{ 
                width: '100%', 
                height: '42px', 
                border: '1px solid var(--line-primary)', 
                borderRadius: '8px', 
                padding: '0 12px', 
                background: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'var(--ink-primary)'
              }}
            >
              <span>{lang}</span>
              <span style={{ fontSize: '9px', color: 'var(--ink-secondary)' }}>▼</span>
            </div>
            {langOpen && (
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '46px', 
                  left: 0, 
                  right: 0, 
                  background: 'white', 
                  border: '1px solid var(--line-primary)', 
                  borderRadius: '8px', 
                  boxShadow: 'var(--shadow-md)', 
                  zIndex: 20
                }}
              >
                {langOptions.map(opt => (
                  <div 
                    key={opt.val}
                    onClick={() => {
                      setLang(opt.val);
                      setLangOpen(false);
                    }}
                    style={{ 
                      padding: '10px 12px', 
                      cursor: 'pointer', 
                      fontSize: '13px',
                      background: opt.val === lang ? 'var(--brand-light)' : 'transparent',
                      color: opt.val === lang ? 'var(--brand-primary)' : 'var(--ink-primary)',
                      fontWeight: opt.val === lang ? 700 : 500
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gap: '10px', fontSize: '11px', color: 'var(--ink-secondary)', background: 'var(--paper-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line-primary)' }}>
            <span style={{ fontWeight: 700, color: 'var(--ink-primary)', display: 'flex', alignItems: 'center' }}>
              <SVG.Shield /> Security Protocol
            </span>
            All voice input commands are processed locally. Voice patterns are stored locally and encrypted using AES-256 standard protocols.
          </div>
        </div>

      </div>
    </div>
  );
}
