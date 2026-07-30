import React, { useState } from 'react';

const SVG = {
  Mic: () => (
    <svg viewBox="0 0 24 24">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
};

export default function AskCard({ onNavigateToChatbot }) {
  const [query, setQuery] = useState('');

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;
    onNavigateToChatbot(searchQuery);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const triggerVoiceSimulation = () => {
    setQuery("How much money do I need to pay suppliers this week?");
    handleSearch("How much money do I need to pay suppliers this week?");
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
            title="Ask by voice (Kannada/English)" 
            onClick={triggerVoiceSimulation}
           >
             <SVG.Mic />
           </button>
           
           <input 
             id="question" 
             placeholder="Ask anything about your business in Kannada or English..." 
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             onKeyDown={handleKeyDown}
           />
          
          <button 
            id="send" 
            aria-label="Send"
            onClick={() => handleSearch(query)}
          >
            <SVG.Send />
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
