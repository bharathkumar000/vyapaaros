import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AskCard from './components/AskCard';
import Dashboard from './components/Dashboard';
import BusinessBrain from './components/BusinessBrain';

import AIAuditor from './components/AIAuditor';
import BusinessDNA from './components/BusinessDNA';
import TimeMachine from './components/TimeMachine';
import Autopilot from './components/Autopilot';
import CommandCenter from './components/CommandCenter';
import Billing from './components/Billing';
import Inventory from './components/Inventory';
import Books from './components/Books';
import Bookings from './components/Bookings';
import Profile from './components/Profile';
import Chatbot from './components/Chatbot';

export default function App() {
  const [currentView, setView] = useState('today');
  const [branches, setBranches] = useState([{ id: 'branch-1', name: 'Sri Lakshmi Traders (Main)' }]);
  const [selectedBranchId, setSelectedBranchId] = useState('branch-1');
  const [branchState, setBranchState] = useState(null);
  const [aiAnswer, setAiAnswer] = useState(null);
  const [chatbotQuery, setChatbotQuery] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch branches and initial state
  useEffect(() => {
    async function initData() {
      try {
        const branchesRes = await fetch('/api/branches');
        const branchesData = await branchesRes.json();
        setBranches(branchesData);
      } catch (err) {
        console.error("Could not fetch branches list:", err);
      }
      fetchState(selectedBranchId);
    }
    initData();
  }, []);

  const fetchState = async (branchId) => {
    setLoading(true);
    try {
      const stateRes = await fetch(`/api/state?branchId=${branchId}`);
      const stateData = await stateRes.json();
      setBranchState(stateData);
    } catch (err) {
      console.error("Could not fetch state for branch:", branchId, err);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchChange = (branchId) => {
    setSelectedBranchId(branchId);
    setAiAnswer(null); // Clear previous answers when switching context
    fetchState(branchId);
  };

  const handleResolveAction = async (actionId) => {
    try {
      const res = await fetch('/api/action/resolve', {
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
    if (loading) {
      return (
        <div style={{ display: 'grid', placeItems: 'center', height: '300px' }}>
          <div className="spinner"></div>
        </div>
      );
    }

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
      case 'bookings':
        return (
          <Bookings 
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
        return <div>View not found</div>;
    }
  };

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
      case 'bookings':
        return "Advance Bookings";
      case 'profile':
        return "Proprietor Profile & Settings";
      case 'chatbot':
        return "AI Assistant Chatbot";
      default:
        return "VyapaarOS";
    }
  };

  return (
    <div className="app-shell">
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
          </div>
        </header>

        {renderActiveView()}
      </main>
    </div>
  );
}
