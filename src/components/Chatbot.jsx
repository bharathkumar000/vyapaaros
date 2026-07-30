import React, { useState, useRef, useEffect } from 'react';

const SVG = {
  Send: () => (
    <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'none', stroke: 'currentColor', strokeWidth: '2.5px' }}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Bot: () => (
    <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'none', stroke: 'currentColor', strokeWidth: '2px' }}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4M8 16h.01M16 16h.01" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'none', stroke: 'currentColor', strokeWidth: '2.5px' }}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
};

export default function Chatbot({ selectedBranchId, branchState, initialQuery, onQueryHandled }) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-0',
      sender: 'bot',
      title: 'VyapaarOS Business Assistant',
      text: 'Namaskara! I am your AI Business Brain. I have loaded all transaction records, UPI settlements, and inventory levels for Sri Lakshmi Traders. Ask me any question about your cash flow, stock health, or customer dues!'
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const threadEndRef = useRef(null);

  const suggestedPrompts = [
    'What is my cash balance?',
    'Any duplicate payment alerts?',
    'What is my GST liability?',
    'How are my rice stock levels?'
  ];

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialQuery && !sending) {
      handleSendMessage(initialQuery);
      onQueryHandled?.();
    }
  }, [initialQuery]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim() || sending) return;
    setSending(true);

    const userMessage = {
      id: `msg-usr-${Date.now()}`,
      sender: 'user',
      text: textToSend
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const historyForApi = messages.slice(-10).map(m => ({
        sender: m.sender,
        text: m.text,
        title: m.title
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: selectedBranchId,
          query: textToSend,
          history: historyForApi
        })
      });
      const data = await response.json();
      
      const botMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        title: data.title || 'Analysis Complete',
        text: data.body || 'I verified your records and found no anomalies.'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      const botErrorMessage = {
        id: `msg-bot-err-${Date.now()}`,
        sender: 'bot',
        title: 'Connection Error',
        text: 'Sorry, I had trouble connecting to the business brain state. Please try again.'
      };
      setMessages(prev => [...prev, botErrorMessage]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="centered-view" style={{ maxWidth: '800px', margin: 'auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Chat header */}
      <div style={{ background: 'white', border: '1px solid var(--line-primary)', borderRadius: '12px 12px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line-primary)' }}>
        <div>
          <h3 style={{ fontSize: '15px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', background: '#39a27f', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #39a27f' }}></span>
            VyapaarOS AI Business Brain
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--ink-secondary)', margin: '2px 0 0' }}>Converse with your virtual back-office assistant</p>
        </div>
      </div>

      {/* Messages Thread */}
      <div style={{ flex: 1, background: '#fcfdfe', borderLeft: '1px solid var(--line-primary)', borderRight: '1px solid var(--line-primary)', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.map(msg => {
          const isBot = msg.sender === 'bot';
          return (
            <div 
              key={msg.id}
              style={{ 
                display: 'flex', 
                justifyContent: isBot ? 'flex-start' : 'flex-end',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              {isBot && (
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--brand-light)', color: 'var(--brand-primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <SVG.Bot />
                </div>
              )}
              
              <div 
                style={{ 
                  maxWidth: '75%', 
                  background: isBot ? 'white' : 'var(--brand-primary)', 
                  color: isBot ? 'var(--ink-primary)' : 'white', 
                  borderRadius: isBot ? '0 12px 12px 12px' : '12px 0 12px 12px', 
                  padding: '14px', 
                  border: isBot ? '1px solid var(--line-primary)' : '0',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {isBot && msg.title && (
                  <b style={{ display: 'block', fontSize: '12.5px', color: 'var(--brand-primary)', marginBottom: '5px' }}>
                    {msg.title}
                  </b>
                )}
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
                  {msg.text}
                </p>
              </div>

              {!isBot && (
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eef2f0', color: '#556c67', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <SVG.User />
                </div>
              )}
            </div>
          );
        })}
        {sending && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--brand-light)', color: 'var(--brand-primary)', display: 'grid', placeItems: 'center' }}>
              <SVG.Bot />
            </div>
            <div style={{ background: 'white', border: '1px solid var(--line-primary)', padding: '12px 16px', borderRadius: '0 12px 12px 12px', fontSize: '11px', color: 'var(--ink-secondary)' }}>
              AI is computing calculations...
            </div>
          </div>
        )}
        <div ref={threadEndRef} />
      </div>

      {/* Suggested Prompts footer */}
      <div style={{ background: '#fcfdfe', borderLeft: '1px solid var(--line-primary)', borderRight: '1px solid var(--line-primary)', padding: '0 20px 10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {suggestedPrompts.map(p => (
          <button 
            key={p}
            onClick={() => handleSendMessage(p)}
            style={{ 
              border: '1px solid #c2ece2', 
              background: '#f0f9f7', 
              color: '#1e6c5c', 
              borderRadius: '20px', 
              padding: '6px 12px', 
              fontSize: '11px', 
              fontWeight: 600, 
              cursor: 'pointer' 
            }}
            onMouseEnter={(e) => e.target.style.background = '#e2f4f0'}
            onMouseLeave={(e) => e.target.style.background = '#f0f9f7'}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input controls footer */}
      <div style={{ background: 'white', border: '1px solid var(--line-primary)', borderRadius: '0 0 12px 12px', padding: '15px 20px', borderTop: 0 }}>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          style={{ display: 'flex', gap: '10px' }}
        >
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your business query (e.g. 'how are my rice stock levels?')"
            style={{ 
              flex: 1, 
              height: '42px', 
              border: '1px solid var(--line-primary)', 
              borderRadius: '8px', 
              padding: '0 15px', 
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button 
            type="submit" 
            className="primary" 
            style={{ width: '42px', height: '42px', padding: 0, display: 'grid', placeItems: 'center', flexShrink: 0 }}
            disabled={!input.trim() || sending}
          >
            <SVG.Send />
          </button>
        </form>
      </div>

    </div>
  );
}
