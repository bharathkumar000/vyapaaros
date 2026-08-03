import React, { useState } from 'react';
import { apiJson, setToken } from '../lib/api';

const SVG = {
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  Bot: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M12 2v9M8 5h8" />
      <circle cx="8" cy="16" r="1" />
      <circle cx="16" cy="16" r="1" />
    </svg>
  ),
  Cash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Box: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Arrow: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  LockCheck: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
};

const features = [
  { icon: <SVG.Bot />, title: 'AI Employees', text: 'Your back office runs itself' },
  { icon: <SVG.Cash />, title: 'Cash Flow Control', text: 'See and protect every rupee' },
  { icon: <SVG.Box />, title: 'Inventory Intelligence', text: 'Never run out of stock again' },
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [isTypingDemo, setIsTypingDemo] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [shake, setShake] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const performLogin = async (u, p) => {
    setError('');
    setBusy(true);
    try {
      const data = await apiJson('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      });
      
      setLoginSuccess(true);
      await new Promise(r => setTimeout(r, 600));
      
      setToken(data.token);
      onLogin(data.user);
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (err.status === 401) {
        setError('Invalid username or password.');
      } else if (err.status === 429) {
        setError('Too many attempts. Please wait a minute and try again.');
      } else {
        setError('Could not reach the server. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    if (busy || isTypingDemo) return;
    if (!username.trim() || !password) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setError('Enter your username and password.');
      return;
    }
    performLogin(username, password);
  };

  const startDemoLogin = async () => {
    if (busy || isTypingDemo) return;
    setIsTypingDemo(true);
    setError('');
    setUsername('');
    setPassword('');

    // Simulated typewriter delay for premium feel
    await new Promise((r) => setTimeout(r, 250));
    setUsername('1');
    await new Promise((r) => setTimeout(r, 250));
    setPassword('1');
    await new Promise((r) => setTimeout(r, 200));

    setIsTypingDemo(false);
    performLogin('1', '1');
  };

  return (
    <div className="login-screen">
      <div className="login-brand">
        <div className="brand-glow-spot brand-glow-1"></div>
        <div className="brand-glow-spot brand-glow-2"></div>
        
        <div className="login-brand-inner">
          <div className="login-logo-row">
            <span className="login-logo-mark">V</span>
            <span className="login-logo-name">Vyapaar<span>OS</span></span>
          </div>

          <div className="login-brand-copy">
            <p className="login-eyebrow">AI BUSINESS OPERATING SYSTEM</p>
            <h1>Your entire back office,<br />run by AI employees.</h1>
            <p className="login-brand-desc">
              VyapaarOS connects your bills, cash, stock and customers so you can run a smarter, safer business.
            </p>
          </div>

          <ul className="login-features">
            {features.map((f, i) => (
              <li key={f.title} style={{ '--index': i }} className="login-feature-card">
                <span className="login-feature-icon">{f.icon}</span>
                <span>
                  <b>{f.title}</b>
                  <small>{f.text}</small>
                </span>
              </li>
            ))}
          </ul>

          <div className="login-brand-footer">
            <span className="login-secure-badge"><SVG.Shield /> Secured with JWT & rate limiting</span>
          </div>
        </div>
      </div>

      <div className="login-panel">
        <div className={`login-panel-container ${shake ? 'shake-animation' : ''}`}>
          <form className="login-card" onSubmit={submit}>
            <p className="login-eyebrow">WELCOME BACK</p>
            <h2>Sign in to your business</h2>
            <p className="login-sub">Use your credentials to unlock your AI back office.</p>

            <div className="input-group">
              <label className={username ? 'has-value' : ''}>
                <span>Username</span>
                <div className="input-wrapper">
                  <span className="input-field-icon"><SVG.User /></span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    placeholder="Enter your ID"
                    disabled={busy || isTypingDemo}
                    autoFocus
                  />
                </div>
              </label>
            </div>

            <div className="input-group">
              <label className={password ? 'has-value' : ''}>
                <span>Password</span>
                <div className="input-wrapper">
                  <span className="input-field-icon"><SVG.Lock /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    disabled={busy || isTypingDemo}
                  />
                  <button
                    type="button"
                    className="login-eye"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                    disabled={busy || isTypingDemo}
                  >
                    {showPassword ? <SVG.EyeOff /> : <SVG.Eye />}
                  </button>
                </div>
              </label>
            </div>

            <div className="login-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="checkbox-label">Keep me signed in</span>
              </label>
              <a href="#forgot" className="forgot-password-link" onClick={(e) => { e.preventDefault(); alert("Use the One-Click Demo Access button below!"); }}>
                Forgot credentials?
              </a>
            </div>

            {error && (
              <div className="login-error-alert">
                <span className="error-icon">⚠️</span>
                <p className="login-error">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className={`primary login-submit ${loginSuccess ? 'login-success-state' : ''}`}
              disabled={busy || isTypingDemo}
            >
              {loginSuccess ? (
                <>
                  <span className="success-icon-spin"><SVG.LockCheck /></span>
                  <span>Welcome Back!</span>
                </>
              ) : busy ? (
                <>
                  <div className="btn-spinner"></div>
                  <span>Signing in…</span>
                </>
              ) : isTypingDemo ? (
                <>
                  <div className="btn-spinner"></div>
                  <span>Autofilling Demo…</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <SVG.Arrow />
                </>
              )}
            </button>
          </form>

          {/* Single Demo Account Login */}
          <div className="demo-accounts-section">
            <div className="demo-accounts-header">
              <span className="line-dec"></span>
              <span className="header-text">QUICK DEMO SIGN-IN</span>
              <span className="line-dec"></span>
            </div>
            
            <button
              type="button"
              className={`demo-single-btn ${isTypingDemo ? 'typing' : ''}`}
              onClick={startDemoLogin}
              disabled={busy || isTypingDemo}
            >
              <div className="demo-btn-avatar">⚡</div>
              <div className="demo-btn-content">
                <span className="demo-btn-title">One-Click Demo Access</span>
                <span className="demo-btn-subtitle">Autofill credentials "1 / 1" & sign in instantly</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
