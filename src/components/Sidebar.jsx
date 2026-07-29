import React from 'react';

export default function Sidebar({
  currentView,
  setView,
  branches,
  selectedBranchId,
  onBranchChange,
  actionCount
}) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#" onClick={(e) => { e.preventDefault(); setView('today'); }}>
        <span className="brand-mark">V</span>
        <span>Vyapaar<span>OS</span></span>
      </a>
      
      <p className="business">Sri Lakshmi Traders</p>
      
      <select 
        className="branch-select"
        value={selectedBranchId}
        onChange={(e) => onBranchChange(e.target.value)}
      >
        {branches.map(b => (
          <option key={b.id} value={b.id}>
            🏢 {b.name}
          </option>
        ))}
      </select>

      <nav>
        <button 
          className={`nav-item ${currentView === 'today' ? 'active' : ''}`} 
          onClick={() => setView('today')}
        >
          <span>◈</span> Today
        </button>
        
        <button 
          className={`nav-item ${currentView === 'brain' ? 'active' : ''}`} 
          onClick={() => setView('brain')}
        >
          <span>✦</span> Business Brain
        </button>
        
        <button 
          className={`nav-item ${currentView === 'twin' ? 'active' : ''}`} 
          onClick={() => setView('twin')}
        >
          <span>◌</span> Digital Twin
        </button>
        
        <button 
          className={`nav-item ${currentView === 'audit' ? 'active' : ''}`} 
          onClick={() => setView('audit')}
        >
          <span>◉</span> AI Auditor {actionCount > 0 && <i>{actionCount}</i>}
        </button>

        <button 
          className={`nav-item ${currentView === 'dna' ? 'active' : ''}`} 
          onClick={() => setView('dna')}
        >
          <span>🧬</span> Business DNA
        </button>

        <button 
          className={`nav-item ${currentView === 'timemachine' ? 'active' : ''}`} 
          onClick={() => setView('timemachine')}
        >
          <span>⏳</span> Time Machine
        </button>

        <button 
          className={`nav-item ${currentView === 'autopilot' ? 'active' : ''}`} 
          onClick={() => setView('autopilot')}
        >
          <span>🤖</span> Autopilot
        </button>
        
        <button 
          className={`nav-item ${currentView === 'books' ? 'active' : ''}`} 
          onClick={() => setView('books')}
        >
          <span>▤</span> Books
        </button>
      </nav>

      <div className="sidebar-bottom">
        <div className="language">
          <span>अ</span>
          <div>
            <b>Kannada + English</b>
            <small>Voice language</small>
          </div>
          <span className="chevron">⌄</span>
        </div>
        <div className="profile">
          <div className="avatar">RK</div>
          <div>
            <b>Ramesh Kumar</b>
            <small>Owner</small>
          </div>
          <span>⋮</span>
        </div>
      </div>
    </aside>
  );
}
