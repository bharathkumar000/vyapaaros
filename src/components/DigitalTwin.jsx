import React, { useState } from 'react';
import { api } from '../lib/api';

const SVG = {
  Twin: () => (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Restock: () => (
    <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', strokeWidth: '2.5px', display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    </svg>
  ),
  Price: () => (
    <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', strokeWidth: '2.5px', display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Hire: () => (
    <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', strokeWidth: '2.5px', display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  )
};

export default function DigitalTwin({ selectedBranchId, branchState }) {
  const [activeTab, setActiveTab] = useState('restock'); // 'restock' | 'price' | 'hire'
  const [qty, setQty] = useState(500);
  const [leadTime, setLeadTime] = useState('5 days');
  const [priceIncrease, setPriceIncrease] = useState(5);
  const [salary, setSalary] = useState(12000);
  const [leadOpen, setLeadOpen] = useState(false);
  
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const response = await api('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: selectedBranchId,
          scenario: activeTab,
          qty,
          leadTime,
          priceIncrease,
          salary
        })
      });
      const data = await response.json();
      setSimulationResult(data);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSimulationResult(null);
  };

  return (
    <div className="centered-view">
      <div className="view-title">
        <p className="eyebrow">TEST A DECISION BEFORE YOU MAKE IT</p>
        <h2>Digital Twin Simulator</h2>
        <p>Simulate stock, price hikes, or staffing impact using real transaction data of {branchState?.name || 'this branch'}.</p>
      </div>

      {/* Tab selectors */}
      <div style={{ maxWidth: '780px', margin: '0 auto 10px', display: 'flex', justifyContent: 'center' }}>
        <div className="sim-tabs">
          <button 
            className={`sim-tab-btn ${activeTab === 'restock' ? 'active' : ''}`}
            onClick={() => handleTabChange('restock')}
          >
            <SVG.Restock /> Restock Grains
          </button>
          <button 
            className={`sim-tab-btn ${activeTab === 'price' ? 'active' : ''}`}
            onClick={() => handleTabChange('price')}
          >
            <SVG.Price /> Price Hike (5%)
          </button>
          <button 
            className={`sim-tab-btn ${activeTab === 'hire' ? 'active' : ''}`}
            onClick={() => handleTabChange('hire')}
          >
            <SVG.Hire /> Hire Assistant
          </button>
        </div>
      </div>

      <div className="simulation">
        <div>
          {activeTab === 'restock' && (
            <>
              <label>Reorder Quantity: Buy India Gate Sona Masoori Rice</label>
              <div className="quantity">
                <button onClick={() => setQty(q => Math.max(100, q - 100))}>−</button>
                <b>{qty} kg</b>
                <button onClick={() => setQty(q => q + 100)}>+</button>
              </div>

              <label>Supplier Lead Time</label>
              <div style={{ position: 'relative', width: '100%', marginBottom: '22px' }}>
                <div 
                  onClick={() => setLeadOpen(!leadOpen)}
                  style={{ 
                    width: '100%', 
                    height: '42px', 
                    border: '1px solid var(--line-primary)', 
                    borderRadius: '7px', 
                    padding: '0 12px', 
                    background: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--ink-primary)'
                  }}
                >
                  <span>
                    {leadTime === '5 days' ? '5 days (Annapoorna Standard)' : ''}
                    {leadTime === '8 days' ? '8 days (Backup Supplier - Delayed)' : ''}
                    {leadTime === '12 days' ? '12 days (Logistics delay)' : ''}
                  </span>
                  <span style={{ fontSize: '8px', color: 'var(--ink-secondary)' }}>▼</span>
                </div>
                {leadOpen && (
                  <div 
                    style={{ 
                      position: 'absolute', 
                      top: '46px', 
                      left: 0, 
                      right: 0, 
                      background: 'white', 
                      border: '1px solid var(--line-primary)', 
                      borderRadius: '7px', 
                      boxShadow: 'var(--shadow-md)', 
                      zIndex: 20
                    }}
                  >
                    {[
                      { val: '5 days', label: '5 days (Annapoorna Standard)' },
                      { val: '8 days', label: '8 days (Backup Supplier - Delayed)' },
                      { val: '12 days', label: '12 days (Logistics delay)' }
                    ].map(opt => (
                      <div 
                        key={opt.val}
                        onClick={() => {
                          setLeadTime(opt.val);
                          setLeadOpen(false);
                        }}
                        style={{ 
                          padding: '10px 12px', 
                          cursor: 'pointer', 
                          fontSize: '11px',
                          background: opt.val === leadTime ? 'var(--brand-light)' : 'transparent',
                          color: opt.val === leadTime ? 'var(--brand-primary)' : 'var(--ink-primary)',
                          fontWeight: opt.val === leadTime ? 700 : 500
                        }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'price' && (
            <>
              <label>Target Price Increase (%)</label>
              <div className="quantity">
                <button onClick={() => setPriceIncrease(p => Math.max(1, p - 1))}>−</button>
                <b>{priceIncrease} %</b>
                <button onClick={() => setPriceIncrease(p => Math.min(25, p + 1))}>+</button>
              </div>
              <p style={{ fontSize: '9.5px', color: 'var(--ink-secondary)', lineHeight: 1.4, marginBottom: '22px' }}>
                Simulates grain price increase. The AI models customer volume retention curves and competitor price matches in Bangalore region.
              </p>
            </>
          )}

          {activeTab === 'hire' && (
            <>
              <label>Monthly Salary Budget (₹)</label>
              <div className="quantity">
                <button onClick={() => setSalary(s => Math.max(5000, s - 1000))}>−</button>
                <b>₹ {salary.toLocaleString('en-IN')}</b>
                <button onClick={() => setSalary(s => s + 1000)}>+</button>
              </div>
              <p style={{ fontSize: '9.5px', color: 'var(--ink-secondary)', lineHeight: 1.4, marginBottom: '22px' }}>
                Hires a local runner to fulfill online WhatsApp home-delivery requests. Simulates delivery coverage and sales runway.
              </p>
            </>
          )}

          <button className="primary" onClick={runSimulation} disabled={loading}>
            {loading ? 'Running simulation...' : 'Run Twin Simulation'}
          </button>
        </div>

        <div className="sim-result">
          {simulationResult ? (
            <>
              <div className="sim-icon">
                <SVG.Twin />
              </div>
              <h3>Projected Results</h3>
              <p className="result-stat">
                {activeTab === 'restock' ? `₹${simulationResult.cost.toLocaleString('en-IN')} cost` : ''}
                {activeTab === 'price' ? `+₹24,500/mo net gain` : ''}
                {activeTab === 'hire' ? `₹${simulationResult.cost.toLocaleString('en-IN')}/mo budget` : ''}
              </p>
              <p style={{ marginBottom: '10px', fontSize: '11px' }}>
                {activeTab === 'restock' && (
                  <>Covers demand for <b>{simulationResult.stockCoverageDays} days</b>. Expected profit margin: <b>{simulationResult.margins}%</b>.</>
                )}
                {activeTab === 'price' && (
                  <>New margin: <b>{simulationResult.margins}%</b>. Competitor reaction index: <b>Healthy</b>.</>
                )}
                {activeTab === 'hire' && (
                  <>Projected Sales margin: <b>{simulationResult.margins}%</b>. Delivery coverage: <b>3.5km radius</b>.</>
                )}
              </p>
              <p style={{ color: simulationResult.status === 'warning' ? 'var(--state-danger)' : 'var(--state-success)', fontWeight: 700, fontSize: '10.5px' }}>
                {simulationResult.message}
              </p>
            </>
          ) : (
            <>
              <div className="sim-icon">
                <SVG.Twin />
              </div>
              <h3>Ready to simulate</h3>
              <p>Choose a target scenario to forecast margins, cash runways, and business growth before you spend real capital.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
