import React, { useState } from 'react';

export default function Dashboard({
  branchState,
  selectedBranchId,
  onStateUpdate,
  onResolveAction,
  aiAnswer,
  onCloseAnswer
}) {
  const [uploading, setUploading] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'm1',
      sender: 'Ramesh G (Customer)',
      text: '📱 Ramesh anna, need 500kg Sona Masoori Rice and 2 tins Ghee, deliver to shop by 4pm.',
      time: '10:04 AM',
      type: 'inbound',
      actionType: 'whatsapp',
      actionLabel: '📥 Ingest Order via AI',
      resolved: false
    },
    {
      id: 'm2',
      sender: 'Mahaveer Stores',
      text: '💰 Sent ₹47,800 for last month\'s pending bill. Match payment screenshot below.',
      time: '10:15 AM',
      type: 'inbound',
      actionType: 'upi',
      actionLabel: '🔍 Reconcile UPI',
      resolved: false
    },
    {
      id: 'm3',
      sender: 'Annapoorna Distributors',
      text: '📄 Bill #AP-9081 for monthly supplies: ₹88,000. Terms Net-15.',
      time: '10:32 AM',
      type: 'inbound',
      actionType: 'invoice',
      actionLabel: '📝 Parse Bill & GST',
      resolved: false
    }
  ]);

  if (!branchState) {
    return <div className="spinner" style={{ margin: '40px auto' }}></div>;
  }

  const { metrics, cashFlow, actions } = branchState;

  const handleSimulatedUpload = async (fileType, msgId = null) => {
    setUploading(fileType);
    setUploadMessage('Ingesting document via AI OCR...');
    
    // Add processing message from AI to WhatsApp thread
    if (msgId) {
      setChatMessages(prev => [
        ...prev,
        {
          id: `ai-wait-${Date.now()}`,
          sender: 'VyapaarOS AI',
          text: `🤖 Analyzing ${fileType} document... Checking matching records in Business Brain.`,
          time: 'Just now',
          type: 'outbound'
        }
      ]);
    }

    setTimeout(async () => {
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            branchId: selectedBranchId,
            fileType
          })
        });
        const data = await response.json();
        
        setUploadMessage(data.message);
        onStateUpdate(data.branch);

        // Add reconciliation summary message to WhatsApp thread
        setChatMessages(prev => {
          const updated = prev.map(m => m.id === msgId ? { ...m, resolved: true } : m);
          return [
            ...updated,
            {
              id: `ai-done-${Date.now()}`,
              sender: 'VyapaarOS AI',
              text: `✓ Reconciled! ${data.message}`,
              time: 'Just now',
              type: 'outbound'
            }
          ];
        });

        setTimeout(() => {
          setUploading(null);
          setUploadMessage('');
        }, 3000);
      } catch (err) {
        console.error("Upload error:", err);
        setUploading(null);
        setUploadMessage('');
      }
    }, 1500);
  };

  const formatCurrency = (val) => {
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  return (
    <>
      {/* Top Section: Left Dropzone, Right WhatsApp simulator */}
      <div className="dashboard-top-section">
        <section 
          className="upload-dropzone" 
          style={{ marginBottom: 0 }}
          onClick={() => {
            if (!uploading) {
              handleSimulatedUpload('whatsapp');
            }
          }}
        >
          {uploading ? (
            <div className="upload-loading">
              <span className="spinner"></span>
              <span>{uploadMessage}</span>
            </div>
          ) : (
            <>
              <p>📥 AI Ingestion Dropzone</p>
              <small>Drag-and-drop bills, bank sheets, UPI receipts, or choose manual uploads below:</small>
              <div className="upload-options" onClick={(e) => e.stopPropagation()}>
                <button className="upload-btn" onClick={() => handleSimulatedUpload('whatsapp')}>📱 WhatsApp Screenshot</button>
                <button className="upload-btn" onClick={() => handleSimulatedUpload('upi')}>💰 UPI Payment</button>
                <button className="upload-btn" onClick={() => handleSimulatedUpload('invoice')}>📄 Supplier Invoice</button>
                <button className="upload-btn" onClick={() => handleSimulatedUpload('bank')}>🏦 Bank Statement</button>
                <button className="upload-btn" onClick={() => handleSimulatedUpload('excel')}>📦 Inventory Excel</button>
              </div>
            </>
          )}
        </section>

        {/* WhatsApp Mobile Simulation Chassis */}
        <section className="whatsapp-widget">
          <div className="whatsapp-header">
            <span>💬 VyapaarOS WhatsApp Inbox</span>
            <span className="whatsapp-status-dot"></span>
          </div>
          <div className="whatsapp-chat">
            {chatMessages.map(msg => (
              <div 
                key={msg.id} 
                className={`chat-bubble ${msg.type === 'inbound' ? 'chat-inbound' : 'chat-outbound'}`}
              >
                <strong style={{ display: 'block', fontSize: '8px', color: '#075e54', marginBottom: '2px' }}>
                  {msg.sender}
                </strong>
                {msg.text}
                {msg.type === 'inbound' && !msg.resolved && (
                  <button 
                    className="chat-action-btn"
                    onClick={() => handleSimulatedUpload(msg.actionType, msg.id)}
                    disabled={uploading !== null}
                  >
                    {msg.actionLabel}
                  </button>
                )}
                <small>{msg.time}</small>
              </div>
            ))}
          </div>
          <div className="whatsapp-footer">
            <input placeholder="Type message in Kannada/English..." disabled />
            <button style={{ border: 0, background: 'none', fontStyle: 'normal', cursor: 'pointer' }}>🎙</button>
          </div>
        </section>
      </div>

      {/* Metric Cards */}
      <section className="metrics">
        <article className="metric-card">
          <div className="metric-icon mint">₹</div>
          <p>Cash in bank</p>
          <h3>{formatCurrency(metrics.cashInBank)}</h3>
          <small className="positive">{metrics.cashInChange} <span>vs last week</span></small>
          <div className="spark mint-line">
            <svg viewBox="0 0 130 35" preserveAspectRatio="none">
              <path d="M0 28 L12 25 L23 27 L36 17 L50 22 L63 12 L78 16 L90 6 L105 14 L117 4 L130 8" />
            </svg>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-icon lilac">↗</div>
          <p>Sales this month</p>
          <h3>{formatCurrency(metrics.salesThisMonth)}</h3>
          <small className="positive">{metrics.salesChange} <span>vs last month</span></small>
          <div className="spark purple-line">
            <svg viewBox="0 0 130 35" preserveAspectRatio="none">
              <path d="M0 28 L12 20 L24 23 L38 13 L50 19 L66 8 L79 14 L92 5 L105 11 L117 2 L130 8" />
            </svg>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-icon peach">◴</div>
          <p>Customers owe you</p>
          <h3>{formatCurrency(metrics.customersOwe)}</h3>
          <small className="warning">● {metrics.oweChange}</small>
          <div className="spark orange-line">
            <svg viewBox="0 0 130 35" preserveAspectRatio="none">
              <path d="M0 11 L15 17 L28 12 L42 23 L54 18 L68 26 L82 22 L94 30 L108 21 L120 25 L130 16" />
            </svg>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-icon blue">◫</div>
          <p>Inventory value</p>
          <h3>{formatCurrency(metrics.inventoryValue)}</h3>
          <small className="neutral">↔ {metrics.inventoryChange}</small>
          <div className="spark blue-line">
            <svg viewBox="0 0 130 35" preserveAspectRatio="none">
              <path d="M0 25 L12 22 L25 24 L37 16 L48 20 L61 12 L73 17 L85 10 L98 15 L114 7 L130 12" />
            </svg>
          </div>
        </article>
      </section>

      {/* Main Grid: Cash Flow + AI Priorities */}
      <section className="dashboard-grid">
        <article className="panel cash-flow">
          <div className="panel-title">
            <div>
              <p className="eyebrow">MONEY MOVEMENT</p>
              <h2>Cash flow</h2>
            </div>
            <button className="period">This month ⌄</button>
          </div>
          
          <div className="cash-stats">
            <div>
              <small>IN</small>
              <b className="in">₹{(cashFlow.inflow / 100000).toFixed(1)}L</b>
            </div>
            <div>
              <small>OUT</small>
              <b className="out">₹{(cashFlow.outflow / 100000).toFixed(1)}L</b>
            </div>
            <div>
              <small>NET</small>
              <b className={cashFlow.net >= 0 ? "in" : "out"}>
                {cashFlow.net >= 0 ? '+' : ''}₹{(cashFlow.net / 100000).toFixed(1)}L
              </b>
            </div>
          </div>

          <div className="chart">
            <div className="axis">
              <span>₹8L</span>
              <span>₹4L</span>
              <span>₹0</span>
            </div>
            
            <svg viewBox="0 0 600 175" preserveAspectRatio="none">
              <defs>
                <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#78d7bd" stopOpacity=".27" />
                  <stop offset="1" stopColor="#78d7bd" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                className="area" 
                d="M0 142 C30 122 42 125 70 101 S112 119 137 83 S184 95 205 65 S249 88 270 56 S312 82 338 51 S378 65 400 35 S442 64 466 48 S510 50 534 21 S574 31 600 8 V175 H0Z"
              />
              <path 
                className="chart-line" 
                d="M0 142 C30 122 42 125 70 101 S112 119 137 83 S184 95 205 65 S249 88 270 56 S312 82 338 51 S378 65 400 35 S442 64 466 48 S510 50 534 21 S574 31 600 8"
              />
            </svg>
            <div className="months">
              <span>Jul 1</span>
              <span>Jul 7</span>
              <span>Jul 14</span>
              <span>Jul 21</span>
              <span>Jul 30</span>
            </div>
          </div>
        </article>

        <article className="panel actions">
          <div className="panel-title">
            <div>
              <p className="eyebrow">AI PRIORITIES</p>
              <h2>Needs your attention</h2>
            </div>
            <span className="count">{actions.length}</span>
          </div>

          <div className="action-list">
            {actions.length === 0 ? (
              <p style={{ fontSize: '11px', color: '#71807e', textAlign: 'center', padding: '30px 0' }}>
                🎉 All priorities clear!
              </p>
            ) : (
              actions.map((act) => (
                <button 
                  key={act.id} 
                  className={`action ${act.type}`}
                  onClick={() => onResolveAction(act.id)}
                >
                  <span className="alert-icon">
                    {act.type === 'overdue' ? '!' : act.type === 'stock' ? '◒' : '⌘'}
                  </span>
                  <div>
                    <b>{act.title}</b>
                    <p>{act.desc}</p>
                  </div>
                  <span>→</span>
                </button>
              ))
            )}
          </div>
          <button className="view-all">View all actions <span>→</span></button>
        </article>
      </section>

      {/* AI Answer Card Panel */}
      {aiAnswer && (
        <section id="answer" className="answer-card">
          <div className="answer-ai">✦</div>
          <div>
            <p className="eyebrow">VYAPAAROS ANSWER</p>
            <h3 id="answer-title">{aiAnswer.title}</h3>
            <p id="answer-body" style={{ whiteSpace: 'pre-wrap' }}>{aiAnswer.body}</p>
          </div>
          <button className="close-answer" onClick={onCloseAnswer} aria-label="Close">×</button>
        </section>
      )}
    </>
  );
}
