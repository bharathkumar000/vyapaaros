import React, { useState } from 'react';

export default function AskCard({ selectedBranchId, onAnswerReceived }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: selectedBranchId,
          query: searchQuery
        })
      });
      const data = await response.json();
      onAnswerReceived(data);
    } catch (err) {
      console.error("Error querying Business Brain: ", err);
      onAnswerReceived({
        title: "Connection Error",
        body: "Could not connect to the VyapaarOS Business Brain server. Please verify the backend is running."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const triggerVoiceSimulation = () => {
    // Simulated Voice prompt (mix of Kannada and English)
    const voiceQuery = "Ramesh: How much money do I need to pay suppliers this week? (Kannada translation input)";
    setQuery("How much money do I need to pay suppliers this week?");
    handleSearch("cash flow"); // queries cash flow endpoint trigger
  };

  return (
    <section className="ask-card">
      <div className="ai-orb"><span></span></div>
      <div className="ask-content">
        <p className="eyebrow">YOUR AI BUSINESS EMPLOYEE</p>
        <h2>What would you like to know?</h2>
        
        <div className="ask-box">
          <button 
            id="mic" 
            title="Ask by voice (Kannada, Hindi, Tamil, Telugu, Marathi or English)" 
            onClick={triggerVoiceSimulation}
            disabled={loading}
          >
            {loading ? '◴' : '⌁'}
          </button>
          
          <input 
            id="question" 
            placeholder="Ask anything about your business in Kannada/English..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          
          <button 
            id="send" 
            aria-label="Send"
            onClick={() => handleSearch(query)}
            disabled={loading}
          >
            ↗
          </button>
        </div>
        
        <div className="suggestions">
          <button onClick={() => { setQuery("Who owes me money?"); handleSearch("Who owes me money?"); }}>
            Who owes me money?
          </button>
          <button onClick={() => { setQuery("How is cash flow?"); handleSearch("How is cash flow?"); }}>
            How is cash flow?
          </button>
          <button onClick={() => { setQuery("Why is profit down?"); handleSearch("Why is profit down?"); }}>
            Why is profit down?
          </button>
          <button onClick={() => { setQuery("What should I do?"); handleSearch("What should I do?"); }}>
            What should I do?
          </button>
          <button onClick={() => { setQuery("ಎಷ್ಟು GST ಕೊಡಬೇಕು?"); handleSearch("GST payable"); }}>
            ಎಷ್ಟು GST ಕೊಡಬೇಕು?
          </button>
        </div>
      </div>
      
      <div className="ask-art">
        <div className="arc a1"></div>
        <div className="arc a2"></div>
        <div className="art-dot d1"></div>
        <div className="art-dot d2"></div>
      </div>
    </section>
  );
}
