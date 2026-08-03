import React, { useMemo, useState } from 'react';
import { api } from '../lib/api';

const money = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

const SVG = {
  Reconcile: () => (
    <svg viewBox="0 0 24 24" style={{ width: '13px', height: '13px', strokeWidth: '2.5px', fill: 'none', stroke: 'currentColor', marginRight: '6px', verticalAlign: 'middle' }}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  UserCheck: () => (
    <svg viewBox="0 0 24 24" style={{ width: '13px', height: '13px', strokeWidth: '2.5px', fill: 'none', stroke: 'currentColor', marginRight: '6px', verticalAlign: 'middle' }}>
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  ),
  CreditCard: () => (
    <svg viewBox="0 0 24 24" style={{ width: '13px', height: '13px', strokeWidth: '2.5px', fill: 'none', stroke: 'currentColor', marginRight: '6px', verticalAlign: 'middle' }}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
};

export default function Books({ selectedBranchId, branchState, onStateUpdate }) {
  const [activeTab, setActiveTab] = useState('dues'); // 'summary' | 'dues'
  const [matched, setMatched] = useState(false);
  const [period, setPeriod] = useState('July 2026');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [ledgerActionId, setLedgerActionId] = useState(null);
  const { metrics, cashFlow } = branchState || { metrics: {}, cashFlow: {} };
  const profit = useMemo(() => Math.max(0, (cashFlow.inflow || 0) - (cashFlow.outflow || 0)), [cashFlow]);

  if (!branchState) return null;

  const receivables = branchState.receivables || [];
  const payables = branchState.payables || [];

  const entries = [
    ['30 Jul', 'UPI collection · Mahaveer Stores', '+₹47,800', 'credit'],
    ['30 Jul', 'Supplier bill · Annapoorna Distributors', '−₹29,000', 'debit'],
    ['29 Jul', 'GST input credit · Supplier invoice', '+₹5,220', 'credit'],
    ['29 Jul', 'Cash sale · Counter billing', '+₹12,640', 'credit'],
  ];

  const collectReceivable = async (receivableId) => {
    setLedgerActionId(receivableId);
    try {
      const response = await api('/api/receivables/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: selectedBranchId,
          receivableId
        })
      });
      const data = await response.json();
      if (data.success) {
        onStateUpdate(data.branch);
      }
    } catch (err) {
      console.error("Receivables collection error:", err);
    } finally {
      setLedgerActionId(null);
    }
  };

  const paySupplier = async (payableId) => {
    setLedgerActionId(payableId);
    try {
      const response = await api('/api/payables/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: selectedBranchId,
          payableId
        })
      });
      const data = await response.json();
      if (data.success) {
        onStateUpdate(data.branch);
      }
    } catch (err) {
      console.error("Payables processing error:", err);
    } finally {
      setLedgerActionId(null);
    }
  };

  const sendWhatsAppReminder = (item) => {
    alert(
      `💬 VyapaarOS Auto-Compiler Reminder:\n\n` +
      `Compiled warning for ${item.name} (${item.phone}):\n` +
      `"Namaskara, Sri Lakshmi Groceries here. An invoice of ₹${item.amount.toLocaleString('en-IN')} remains outstanding (due: ${item.dueDate}). Please settle at your earliest convenience via UPI. Thank you."`
    );
  };

  return (
    <div className="books-view" style={{ maxWidth: '980px', margin: 'auto' }}>
      
      {/* Sub-tabs header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid var(--line-primary)', paddingBottom: '12px' }}>
        <div>
          <p className="eyebrow">AUTOMATIC LEDGERS & OUTSTANDING KHATA</p>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Ledger & Books</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('summary')}
            className={`sim-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', border: '1px solid var(--line-primary)', cursor: 'pointer' }}
          >
            <SVG.Reconcile /> Cash Flow & Reconcile
          </button>
          <button 
            onClick={() => setActiveTab('dues')}
            className={`sim-tab-btn ${activeTab === 'dues' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', border: '1px solid var(--line-primary)', cursor: 'pointer' }}
          >
            <SVG.UserCheck /> Outstanding Dues (Khata)
          </button>
        </div>
      </div>

      {activeTab === 'summary' && (
        <>
          <section className="books-summary" style={{ marginBottom: '25px' }}>
            <article><span className="book-icon green">₹</span><div><small>Cash & bank balance</small><b>{money(metrics.cashInBank)}</b><em>Matched daily</em></div></article>
            <article><span className="book-icon violet">▤</span><div><small>Net cash flow</small><b className="positive-text">+{money(cashFlow.net)}</b><em>{period}</em></div></article>
            <article><span className="book-icon amber">%</span><div><small>Estimated GST payable</small><b>{money(39294)}</b><em>Due 20 Aug</em></div></article>
            <article><span className="book-icon blue">↗</span><div><small>Operating surplus</small><b>{money(profit)}</b><em>Before tax & drawings</em></div></article>
          </section>

          <section className="books-grid">
            <article className="book-panel ledger-panel">
              <div className="book-panel-head">
                <div>
                  <p className="eyebrow">LIVE LEDGER</p>
                  <h3>Recent entries</h3>
                </div>
                <div style={{ position: 'relative', width: '100px', zIndex: 10 }}>
                  <div 
                    onClick={() => setPeriodOpen(!periodOpen)}
                    style={{ 
                      border: '1px solid var(--line-primary)', 
                      background: 'var(--paper-card)', 
                      borderRadius: '8px', 
                      padding: '6px 10px', 
                      color: 'var(--ink-secondary)', 
                      font: '700 9px var(--font-sans)', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{period}</span>
                    <span style={{ fontSize: '6px', marginLeft: '4px' }}>▼</span>
                  </div>
                  {periodOpen && (
                    <div 
                      style={{ 
                        position: 'absolute', 
                        top: '28px', 
                        left: 0, 
                        right: 0, 
                        background: 'white', 
                        border: '1px solid var(--line-primary)', 
                        borderRadius: '8px', 
                        boxShadow: 'var(--shadow-md)', 
                        zIndex: 20
                      }}
                    >
                      {['July 2026', 'June 2026'].map(p => (
                        <div 
                          key={p}
                          onClick={() => {
                            setPeriod(p);
                            setPeriodOpen(false);
                          }}
                          style={{ 
                            padding: '6px 10px', 
                            cursor: 'pointer', 
                            fontSize: '9px',
                            fontWeight: 700,
                            color: p === period ? 'var(--brand-primary)' : 'var(--ink-secondary)',
                            background: p === period ? 'var(--brand-light)' : 'transparent'
                          }}
                        >
                          {p}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="ledger-table">
                <div className="ledger-head"><span>Date</span><span>Entry</span><span>Amount</span></div>
                {entries.map(([date, name, amount, type]) => (
                  <div className="ledger-row" key={name}><span>{date}</span><b>{name}</b><strong className={type}>{amount}</strong></div>
                ))}
              </div>
              <button className="ledger-link" onClick={() => setActiveTab('dues')}>Open full ledger <span>→</span></button>
            </article>

            <article className="book-panel reconcile-panel">
              <p className="eyebrow">AI RECONCILIATION</p>
              <h3>{matched ? 'Everything is matched' : 'One payment needs review'}</h3>
              <div className={`reconcile-orb ${matched ? 'done' : ''}`}>{matched ? '✓' : '97%'}</div>
              <p>{matched ? 'UPI, bank and invoice records are fully reconciled for today.' : '₹28,500 may have been paid twice to Annapoorna Distributors. The AI found the same vendor and amount 11 minutes apart.'}</p>
              <button className="primary" onClick={() => setMatched(true)}>{matched ? 'Reconciliation complete' : 'Review & match payment'}</button>
            </article>
          </section>

          <section className="tax-strip" style={{ marginTop: '20px' }}>
            <div>
              <span>%</span>
              <div>
                <b>GST filing assistant</b>
                <p>39 invoices classified · ₹39,294 estimated payable · 1 entry needs a GST code</p>
              </div>
            </div>
            <button>Prepare GSTR-3B →</button>
          </section>
        </>
      )}

      {activeTab === 'dues' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginTop: '10px' }}>
          
          {/* Receivables (Debtors / Who owes Ramesh money) */}
          <div style={{ background: 'white', border: '1px solid var(--line-primary)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: '#194e47', display: 'flex', alignItems: 'center' }}>
              <SVG.UserCheck /> Receivables (Customers Owe You)
            </h3>
            <p style={{ fontSize: '10px', color: 'var(--ink-secondary)', marginBottom: '15px', lineHeight: 1.4 }}>
              Outstanding credit sales. Reconcile invoices when clients settle payments, or send payment reminders.
            </p>

            <div style={{ display: 'grid', gap: '10px' }}>
              {receivables.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#889592', fontSize: '11px' }}>
                  No outstanding receivables recorded.
                </div>
              ) : (
                receivables.map(item => {
                  const isPaid = item.status === 'paid';
                  return (
                    <div 
                      key={item.id} 
                      style={{ 
                        border: '1px solid #eef2f0', 
                        borderRadius: '8px', 
                        padding: '12px 15px', 
                        background: isPaid ? '#f8faf9' : 'white',
                        opacity: isPaid ? 0.7 : 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <b style={{ fontSize: '12px' }}>{item.name}</b>
                          {item.status === 'overdue' && (
                            <span style={{ fontSize: '8px', background: '#fce8e6', color: '#a82c14', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>OVERDUE</span>
                          )}
                        </div>
                        <small style={{ display: 'block', fontSize: '9.5px', color: '#889592', marginTop: '2px' }}>Due by: {item.dueDate}</small>
                      </div>
                      
                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div>
                          <b style={{ display: 'block', fontSize: '12.5px', color: isPaid ? '#71807e' : '#194e47' }}>
                            ₹{item.amount.toLocaleString('en-IN')}
                          </b>
                          {isPaid && <small style={{ color: '#2b7c6c', fontSize: '8px', fontWeight: 'bold' }}>COLLECTED</small>}
                        </div>
                        
                        {!isPaid && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                              onClick={() => sendWhatsAppReminder(item)}
                              style={{ 
                                padding: '6px 8px', 
                                border: '1px solid #bce1da', 
                                background: '#f0f9f7', 
                                color: '#1e6c5c', 
                                borderRadius: '5px', 
                                fontSize: '10px', 
                                fontWeight: 700, 
                                cursor: 'pointer' 
                              }}
                            >
                              Remind
                            </button>
                            <button 
                              onClick={() => collectReceivable(item.id)}
                              disabled={ledgerActionId === item.id}
                              style={{ 
                                padding: '6px 10px', 
                                background: '#1e6c5c', 
                                color: 'white', 
                                border: 0, 
                                borderRadius: '5px', 
                                fontSize: '10px', 
                                fontWeight: 700, 
                                cursor: 'pointer' 
                              }}
                            >
                              {ledgerActionId === item.id ? '...' : 'Settle'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Payables (Creditors / Who Ramesh owes money) */}
          <div style={{ background: 'white', border: '1px solid var(--line-primary)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: '#194e47', display: 'flex', alignItems: 'center' }}>
              <SVG.CreditCard /> Payables (Supplier Accounts Due)
            </h3>
            <p style={{ fontSize: '10px', color: 'var(--ink-secondary)', marginBottom: '15px', lineHeight: 1.4 }}>
              Active distributor invoices. Settling these processes bank balance payments and resolves supplier alert tasks.
            </p>

            <div style={{ display: 'grid', gap: '10px' }}>
              {payables.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#889592', fontSize: '11px' }}>
                  No outstanding supplier balances.
                </div>
              ) : (
                payables.map(item => {
                  const isPaid = item.status === 'paid';
                  return (
                    <div 
                      key={item.id} 
                      style={{ 
                        border: '1px solid #eef2f0', 
                        borderRadius: '8px', 
                        padding: '12px 15px', 
                        background: isPaid ? '#f8faf9' : 'white',
                        opacity: isPaid ? 0.7 : 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <b style={{ fontSize: '12px', display: 'block' }}>{item.name}</b>
                        <small style={{ display: 'block', fontSize: '9px', color: '#889592', marginTop: '2px' }}>{item.type} · Due by {item.dueDate}</small>
                      </div>
                      
                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div>
                          <b style={{ display: 'block', fontSize: '12.5px', color: isPaid ? '#71807e' : '#a82c14' }}>
                            ₹{item.amount.toLocaleString('en-IN')}
                          </b>
                          {isPaid && <small style={{ color: '#2b7c6c', fontSize: '8px', fontWeight: 'bold' }}>SETTLED</small>}
                        </div>
                        
                        {!isPaid && (
                          <button 
                            onClick={() => paySupplier(item.id)}
                            disabled={ledgerActionId === item.id}
                            style={{ 
                              padding: '6px 12px', 
                              background: '#1e6c5c', 
                              color: 'white', 
                              border: 0, 
                              borderRadius: '5px', 
                              fontSize: '10px', 
                              fontWeight: 700, 
                              cursor: 'pointer' 
                            }}
                          >
                            {ledgerActionId === item.id ? '...' : 'Pay Supplier'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
