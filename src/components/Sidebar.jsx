import React, { useState } from 'react';

// Custom lightweight inline SVGs for premium look & feel
const Icons = {
  Building: () => (
    <svg viewBox="0 0 24 24" style={{ width: '13px', height: '13px', strokeWidth: '2.3px', fill: 'none', stroke: 'currentColor', marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }}>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="9" y1="22" x2="9" y2="16" />
      <line x1="15" y1="22" x2="15" y2="16" />
      <line x1="9" y1="16" x2="15" y2="16" />
      <path d="M8 6h2M8 10h2M14 6h2M14 10h2" />
    </svg>
  ),
  Today: () => (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="8" cy="14" r="1.5" />
      <circle cx="12" cy="14" r="1.5" />
      <circle cx="16" cy="14" r="1.5" />
    </svg>
  ),
  Billing: () => (
    <svg viewBox="0 0 24 24">
      <path d="M9 12h6M9 16h6" />
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l4 4v12a2 2 0 01-2 2z" />
      <path d="M16 3v4h4" />
    </svg>
  ),
  Brain: () => (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="12" r="2.5" />
      <circle cx="19" cy="12" r="2.5" />
      <circle cx="12" cy="19" r="2.5" />
      <line x1="12" y1="7.5" x2="12" y2="16.5" />
      <line x1="7.5" y1="12" x2="16.5" y2="12" />
      <line x1="6.77" y1="10.23" x2="17.23" y2="13.77" />
    </svg>
  ),

  Auditor: () => (
    <svg viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 11l2 2 4-4" />
    </svg>
  ),
  DNA: () => (
    <svg viewBox="0 0 24 24">
      <path d="M4.5 10.5c2.5 5.5 7.5 5.5 7.5 0s5-5.5 7.5 0" />
      <path d="M4.5 13.5c2.5-5.5 7.5-5.5 7.5 0s5 5.5 7.5 0" />
      <line x1="6" y1="8" x2="6" y2="16" />
      <line x1="12" y1="6" x2="12" y2="18" />
      <line x1="18" y1="8" x2="18" y2="16" />
    </svg>
  ),
  TimeMachine: () => (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L21 8" />
    </svg>
  ),
  Autopilot: () => (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  Inventory: () => (
    <svg viewBox="0 0 24 24">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Ledger: () => (
    <svg viewBox="0 0 24 24">
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  ),
  Bookings: () => (
    <svg viewBox="0 0 24 24">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  ),
  Books: () => (
    <svg viewBox="0 0 24 24">
      <path d="M5 4h14a1 1 0 011 1v15H6a2 2 0 01-2-2V5a1 1 0 011-1z" />
      <path d="M8 4v16M11 9h6M11 13h6" />
    </svg>
  ),
  Chatbot: () => (
    <svg viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Language: () => (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
};

export default function Sidebar({
  currentView,
  setView,
  branches,
  selectedBranchId,
  onBranchChange,
  actionCount
}) {
  const [branchOpen, setBranchOpen] = useState(false);
  const selectedBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  return (
    <aside className="sidebar">
      <a className="brand" href="#" onClick={(e) => { e.preventDefault(); setView('today'); }}>
        <span className="brand-mark">V</span>
        <span>Vyapaar<span>OS</span></span>
      </a>
      
      <div className="sidebar-branch-container">
        <p className="business">Sri Lakshmi Traders</p>
        
        <div style={{ position: 'relative', width: '100%', marginBottom: '25px', zIndex: 105 }}>
          <div 
            onClick={() => setBranchOpen(!branchOpen)}
            style={{ 
              background: '#112824', 
              border: '1px solid rgba(255, 255, 255, 0.06)', 
              color: '#c9dedb', 
              fontSize: '11px', 
              fontWeight: '600', 
              padding: '10px 12px', 
              borderRadius: '8px', 
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <Icons.Building /> {selectedBranch?.name}
            </span>
            <span style={{ fontSize: '8px', color: '#718884', transition: 'transform 0.2s', transform: branchOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </div>
          {branchOpen && (
            <div 
              style={{ 
                position: 'absolute', 
                top: '42px', 
                left: 0, 
                right: 0, 
                background: '#112824', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '8px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)', 
                zIndex: 110
              }}
            >
              {branches.map(b => (
                <div 
                  key={b.id}
                  onClick={() => {
                    onBranchChange(b.id);
                    setBranchOpen(false);
                  }}
                  style={{ 
                    padding: '10px 12px', 
                    cursor: 'pointer', 
                    fontSize: '11px',
                    background: b.id === selectedBranchId ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    color: b.id === selectedBranchId ? '#57d4b4' : '#c9dedb',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.08)'}
                  onMouseLeave={(e) => e.target.style.background = b.id === selectedBranchId ? 'rgba(255, 255, 255, 0.05)' : 'transparent'}
                >
                  <Icons.Building /> {b.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav>
        <button 
          className={`nav-item ${currentView === 'today' ? 'active' : ''}`} 
          onClick={() => setView('today')}
        >
          <Icons.Today /> <span>Today</span>
        </button>
        
        <button 
          className={`nav-item ${currentView === 'chatbot' ? 'active' : ''}`} 
          onClick={() => setView('chatbot')}
        >
          <Icons.Chatbot /> <span>AI Chatbot</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'billing' ? 'active' : ''}`} 
          onClick={() => setView('billing')}
        >
          <Icons.Billing /> <span>AI Billing</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'inventory' ? 'active' : ''}`} 
          onClick={() => setView('inventory')}
        >
          <Icons.Inventory /> <span>AI Inventory</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'bookings' ? 'active' : ''}`} 
          onClick={() => setView('bookings')}
        >
          <Icons.Bookings /> <span>Bookings</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'books' ? 'active' : ''}`} 
          onClick={() => setView('books')}
        >
          <Icons.Books /> <span>Ledger & Books</span>
        </button>
        
        <button 
          className={`nav-item ${currentView === 'audit' ? 'active' : ''}`} 
          onClick={() => setView('audit')}
        >
          <Icons.Auditor /> <span>AI Auditor</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'brain' ? 'active' : ''}`} 
          onClick={() => setView('brain')}
        >
          <Icons.Brain /> <span>Business Brain</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'autopilot' ? 'active' : ''}`} 
          onClick={() => setView('autopilot')}
        >
          <Icons.Autopilot /> <span>Autopilot</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'dna' ? 'active' : ''}`} 
          onClick={() => setView('dna')}
        >
          <Icons.DNA /> <span>Business DNA</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'timemachine' ? 'active' : ''}`} 
          onClick={() => setView('timemachine')}
        >
          <Icons.TimeMachine /> <span>Time Machine</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        <div 
          className={`profile ${currentView === 'profile' ? 'active' : ''}`}
          onClick={() => setView('profile')}
          style={{ cursor: 'pointer' }}
        >
          <div className="avatar">RK</div>
          <div>
            <b>Ramesh Kumar</b>
            <small>Owner</small>
          </div>
          <Icons.Logout />
        </div>
      </div>
    </aside>
  );
}
