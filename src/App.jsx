import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AskCard from './components/AskCard';
import Dashboard from './components/Dashboard';
import BusinessBrain from './components/BusinessBrain';
import DigitalTwin from './components/DigitalTwin';
import AIAuditor from './components/AIAuditor';
import BusinessDNA from './components/BusinessDNA';
import TimeMachine from './components/TimeMachine';
import Autopilot from './components/Autopilot';
import CommandCenter from './components/CommandCenter';

export default function App() {
  const [currentView, setView] = useState('today');
  const [branches, setBranches] = useState([{ id: 'branch-1', name: 'Sri Lakshmi Traders (Main)' }]);
  const [selectedBranchId, setSelectedBranchId] = useState('branch-1');
  const [branchState, setBranchState] = useState(null);
  const [aiAnswer, setAiAnswer] = useState(null);
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
              selectedBranchId={selectedBranchId} 
              onAnswerReceived={(answer) => setAiAnswer(answer)} 
            />
            <CommandCenter branchState={branchState} onAsk={(answer) => setAiAnswer(answer)} />
            <Dashboard 
              branchState={branchState}
              selectedBranchId={selectedBranchId}
              onStateUpdate={(state) => setBranchState(state)}
              onResolveAction={handleResolveAction}
              aiAnswer={aiAnswer}
              onCloseAnswer={() => setAiAnswer(null)}
            />
          </>
        );
      case 'brain':
        return <BusinessBrain branchState={branchState} />;
      case 'twin':
        return <DigitalTwin selectedBranchId={selectedBranchId} branchState={branchState} />;
      case 'audit':
        return <AIAuditor branchState={branchState} onResolveAction={handleResolveAction} />;
      case 'dna':
        return <BusinessDNA branchState={branchState} onCloneComplete={handleCloneComplete} />;
      case 'timemachine':
        return <TimeMachine />;
      case 'autopilot':
        return <Autopilot />;
      case 'books':
        return (
          <section className="centered-view">
            <div className="empty-books">
              <span>▤</span>
              <h2>Books, without the bookkeeping</h2>
              <p>Your invoices, payments and GST records are kept continuously up to date by the Business Brain.</p>
              <button className="primary" onClick={() => setView('today')}>View financial summary</button>
            </div>
          </section>
        );
      default:
        return <div>View not found</div>;
    }
  };

  const getActiveViewTitle = () => {
    switch (currentView) {
      case 'today':
        return "Good morning, Ramesh";
      case 'brain':
        return "Business Connections";
      case 'twin':
        return "Digital Twin Dashboard";
      case 'audit':
        return "AI Audit Log";
      case 'dna':
        return "Operational DNA Manager";
      case 'timemachine':
        return "Business Time Machine";
      case 'autopilot':
        return "AI Agent Autopilot";
      case 'books':
        return "Financial Books";
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
            <h1>
              {getActiveViewTitle()} <span className="wave">✳</span>
            </h1>
          </div>
          <div className="header-right">
            <span className="sync"><i></i> All systems live</span>
            <button className="icon-button" aria-label="Notifications">
              ♢<em>{branchState ? branchState.actions.length : 0}</em>
            </button>
          </div>
        </header>

        {renderActiveView()}
      </main>
    </div>
  );
}
