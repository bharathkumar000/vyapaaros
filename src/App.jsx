import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AskCard from './components/AskCard';
import Dashboard from './components/Dashboard';
import BusinessBrain from './components/BusinessBrain';
import Login from './components/Login';
import AIAuditor from './components/AIAuditor';
import BusinessDNA from './components/BusinessDNA';
import TimeMachine from './components/TimeMachine';
import Autopilot from './components/Autopilot';
import CommandCenter from './components/CommandCenter';
import Billing from './components/Billing';
import Inventory from './components/Inventory';
import Books from './components/Books';
import Profile from './components/Profile';
import Chatbot from './components/Chatbot';
import { api, getToken, clearToken, onUnauthorized } from './lib/api';

const VALID_VIEWS = new Set([
  'today', 'billing', 'brain', 'audit', 'dna', 'timemachine', 'autopilot',
  'inventory', 'books', 'ledger', 'profile', 'chatbot',
]);

const AuthIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
const NotFoundIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

/* ─── Global popup: loading / not-found / auth error (modal, not a screen) ─── */
function AppPopup({ popup, loading, onClose }) {
  if (!popup && !loading) return null;
  const active = loading
    ? { type: 'loading', title: 'Loading workspace', message: 'Fetching your latest business data…' }
    : popup;

  return (
    <div className="app-popup-overlay">
      <div className={`app-popup-card app-popup-${active.type}`}>
        {active.type === 'loading' ? (
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
        ) : (
          <div className="app-popup-icon">
            {active.type === 'auth' ? <AuthIcon /> : <NotFoundIcon />}
          </div>
        )}
        <h3>{active.title}</h3>
        {active.message && <p>{active.message}</p>}
        {active.type !== 'loading' && (
          <button className="app-popup-btn" onClick={onClose}>
            {active.action || 'Close'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setView] = useState('today');
  const [user, setUser] = useState(null);
  const [branches, setBranches] = useState([{ id: 'branch-1', name: 'Sri Lakshmi Groceries (Main)' }]);
  const [selectedBranchId, setSelectedBranchId] = useState('branch-1');
  const [branchState, setBranchState] = useState(null);
  const [aiAnswer, setAiAnswer] = useState(null);
  const [chatbotQuery, setChatbotQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);

  const closePopup = () => {
    const type = popup?.type;
    setPopup(null);
    if (type === 'notfound') {
      setView('today');
      fetchState(selectedBranchId);
    } else if (type === 'auth') {
      logout();
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setBranchState(null);
    setBranches([]);
    setView('today');
  };

  useEffect(() => {
    return onUnauthorized(() => {
      setUser(null);
      setBranchState(null);
      setPopup({
        type: 'auth',
        title: 'Authentication error',
        message: 'Your session has expired or is invalid. Please sign in again.',
        action: 'Sign in again',
      });
    });
  }, []);

  // Fetch branches and initial state
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    async function initData() {
      try {
        const branchesRes = await api('/api/branches');
        if (branchesRes.status === 401) {
          logout();
          return;
        }
        const branchesData = await branchesRes.json();
        setBranches(branchesData);
        if (!branchesData || branchesData.length === 0) {
          setPopup({
            type: 'notfound',
            title: 'No workspaces found',
            message: 'No branch workspaces exist yet. Contact your administrator.',
            action: 'Try again',
          });
          return;
        }
        fetchState(branchesData[0]?.id || 'branch-1');
      } catch (err) {
        console.error("Could not fetch branches list:", err);
        setPopup({
          type: 'notfound',
          title: 'Could not load workspace',
          message: 'We could not reach the server. Check your connection and try again.',
          action: 'Try again',
        });
      }
    }
    initData();
  }, [user]);

  const fetchState = async (branchId) => {
    setLoading(true);
    try {
      const stateRes = await api(`/api/state?branchId=${branchId}`);
      if (stateRes.status === 401 || stateRes.status === 403) {
        setBranchState(null);
        setPopup({
          type: 'auth',
          title: 'Authentication error',
          message: 'Your session is invalid or you do not have access to this workspace. Please sign in again.',
          action: 'Sign in again',
        });
        return;
      }
      const stateData = await stateRes.json();
      if (stateData?.error) {
        setBranchState(null);
        setPopup({
          type: 'notfound',
          title: 'Workspace not found',
          message: `Could not load workspace "${branchId}". It may have been removed or renamed.`,
          action: 'Go to Dashboard',
        });
        return;
      }
      setPopup(null);
      setBranchState(stateData);
    } catch (err) {
      console.error("Could not fetch state for branch:", branchId, err);
      setPopup({
        type: 'notfound',
        title: 'Could not load workspace',
        message: 'We could not reach the server. Check your connection and try again.',
        action: 'Try again',
      });
    } finally {
      setLoading(false);
    }
  };

  // Show a "page not found" popup for unknown views instead of a blank screen.
  useEffect(() => {
    if (user && !VALID_VIEWS.has(currentView)) {
      setPopup({
        type: 'notfound',
        title: 'Page not found',
        message: `"${currentView}" is not a valid section of VyapaarOS.`,
        action: 'Go to Dashboard',
      });
    }
  }, [currentView, user]);

  const handleBranchChange = (branchId) => {
    setSelectedBranchId(branchId);
    setAiAnswer(null); // Clear previous answers when switching context
    fetchState(branchId);
  };

  const handleResolveAction = async (actionId) => {
    try {
      const res = await api('/api/action/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: selectedBranchId,
          actionId
        })
      });
      const updatedState = await res.json();
      setBranchState(updatedState);
      
      // If we resolved duplicate payments, trigger success message in chat answer
      if (actionId === 'action-3' || actionId === 'audit-1') {
        setAiAnswer({
          title: "Audit Alert Resolved",
          body: "Reclaimed ₹28,500 duplicate payout from Annapoorna Distributors. Funds successfully credited back to Cash in Bank ledger."
        });
      }
    } catch (err) {
      console.error("Error resolving action:", err);
    }
  };

  const handleAskToChatbot = (query) => {
    setChatbotQuery(query);
    setView('chatbot');
  };

  const handleCloneComplete = (newBranchId, updatedBranchesList) => {
    setBranches(updatedBranchesList);
    setSelectedBranchId(newBranchId);
    setView('today');
    fetchState(newBranchId);
    setAiAnswer({
      title: "🧬 DNA Cloning Complete",
      body: `Successfully spun up new branch: "${updatedBranchesList.find(b => b.id === newBranchId).name}". Copied all pricing rules (markup margin, inventory safety thresholds, warning alert bounds). All systems are initialized and live.`
    });
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'today':
        return (
          <>
            <AskCard 
              onNavigateToChatbot={handleAskToChatbot}
            />
            <Dashboard 
              branchState={branchState}
              selectedBranchId={selectedBranchId}
              onStateUpdate={(state) => setBranchState(state)}
              onResolveAction={handleResolveAction}
              aiAnswer={aiAnswer}
              onCloseAnswer={() => setAiAnswer(null)}
              setView={setView}
            />
            <CommandCenter branchState={branchState} onAsk={(answer) => setAiAnswer(answer)} />
          </>
        );
      case 'billing':
        return (
          <Billing 
            selectedBranchId={selectedBranchId} 
            branchState={branchState} 
            onStateUpdate={(state) => setBranchState(state)} 
            setView={setView}
          />
        );
      case 'brain':
        return <BusinessBrain branchState={branchState} />;

      case 'audit':
        return <AIAuditor branchState={branchState} onResolveAction={handleResolveAction} />;
      case 'dna':
        return <BusinessDNA branchState={branchState} onCloneComplete={handleCloneComplete} />;
      case 'timemachine':
        return <TimeMachine />;
      case 'autopilot':
        return <Autopilot />;
      case 'inventory':
        return (
          <Inventory 
            selectedBranchId={selectedBranchId} 
            branchState={branchState} 
            onStateUpdate={(state) => setBranchState(state)} 
          />
        );
      case 'books':
      case 'ledger':
        return (
          <Books 
            selectedBranchId={selectedBranchId} 
            branchState={branchState} 
            onStateUpdate={(state) => setBranchState(state)} 
          />
        );
      case 'profile':
        return <Profile branchState={branchState} />;
      case 'chatbot':
        return (
          <Chatbot 
            selectedBranchId={selectedBranchId} 
            branchState={branchState} 
            initialQuery={chatbotQuery}
            onQueryHandled={() => setChatbotQuery(null)}
          />
        );
      default:
        return null;
    }
  };

  const popupElement = (
    <AppPopup
      popup={user ? popup : popup?.type === 'auth' ? popup : null}
      loading={loading && !!user && !branchState}
      onClose={closePopup}
    />
  );

  const getActiveViewTitle = () => {
    switch (currentView) {
      case 'today':
        return "Good morning, Ramesh";
      case 'billing':
        return "Smart AI Billing Counter";
      case 'brain':
        return "Business Connections";

      case 'audit':
        return "AI Audit Log";
      case 'dna':
        return "Operational DNA Manager";
      case 'timemachine':
        return "Business Time Machine";
      case 'autopilot':
        return "AI Agent Autopilot";
      case 'inventory':
        return "Inventory Control";
      case 'books':
      case 'ledger':
        return "Ledger & Books";
      case 'profile':
        return "Proprietor Profile & Settings";
      case 'chatbot':
        return "AI Assistant Chatbot";
      default:
        return "VyapaarOS";
    }
  };

  if (!user) {
    return (
      <>
        {popupElement}
        <Login onLogin={(loggedInUser) => setUser(loggedInUser)} />
      </>
    );
  }

  return (
    <div className="app-shell">
      {popupElement}
      <Sidebar 
        currentView={currentView}
        setView={setView}
        branches={branches}
        selectedBranchId={selectedBranchId}
        onBranchChange={handleBranchChange}
        actionCount={branchState ? branchState.actions.length : 0}
      />
      
      <main>
        <header>
          <div>
            <p className="eyebrow">WEDNESDAY, 30 JULY</p>
            <h1>{getActiveViewTitle()}</h1>
          </div>
          <div className="header-right">
            <span className="sync"><i></i> All systems live</span>
            <button className="icon-button" aria-label="Notifications">
              <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'none', stroke: 'currentColor', strokeWidth: '2px' }}>
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <em>{branchState ? branchState.actions.length : 0}</em>
            </button>
            <button className="logout" onClick={logout}>
              Sign out
            </button>
          </div>
        </header>

        {renderActiveView()}
      </main>
    </div>
  );
}
