import React, { useState } from 'react';

export default function DigitalTwin({ selectedBranchId, branchState }) {
  const [activeTab, setActiveTab] = useState('restock'); // 'restock' | 'price' | 'hire'
  const [qty, setQty] = useState(500);
  const [leadTime, setLeadTime] = useState('5 days');
  const [priceIncrease, setPriceIncrease] = useState(5);
  const [salary, setSalary] = useState(12000);
  
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/simulate', {
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
    setSimulationResult(null); // Reset outputs when changing tabs
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
            📦 Restock Grains
          </button>
          <button 
            className={`sim-tab-btn ${activeTab === 'price' ? 'active' : ''}`}
            onClick={() => handleTabChange('price')}
          >
            📈 Price Hike (5%)
          </button>
          <button 
            className={`sim-tab-btn ${activeTab === 'hire' ? 'active' : ''}`}
            onClick={() => handleTabChange('hire')}
          >
            💼 Hire Assistant
          </button>
        </div>
      </div>

      <div className="simulation">
        <div>
          {activeTab === 'restock' && (
            <>
              <label>Reorder Quantity: Buy Sona Masoori Rice</label>
              <div className="quantity">
                <button onClick={() => setQty(q => Math.max(100, q - 100))}>−</button>
                <b>{qty} kg</b>
                <button onClick={() => setQty(q => q + 100)}>+</button>
              </div>

              <label>Supplier Lead Time</label>
              <select value={leadTime} onChange={(e) => setLeadTime(e.target.value)}>
                <option value="5 days">⚡ 5 days (Annapoorna Standard)</option>
                <option value="8 days">⏳ 8 days (Backup Supplier - Delayed)</option>
                <option value="12 days">🐢 12 days (Monsoon / Logistics delay)</option>
              </select>
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
              <p style={{ fontSize: '9px', color: '#71807e', lineHeight: 1.4, marginBottom: '22px' }}>
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
              <p style={{ fontSize: '9px', color: '#71807e', lineHeight: 1.4, marginBottom: '22px' }}>
                Hires a local runner to fulfill online WhatsApp home-delivery requests. Simulates delivery coverage and sales runway.
              </p>
            </>
          )}

          <button className="primary" onClick={runSimulation} disabled={loading}>
            {loading ? 'Running simulation...' : '📊 Run Twin Simulation'}
          </button>
        </div>

        <div className="sim-result">
          {simulationResult ? (
            <>
              <span className="sim-icon">
                {simulationResult.status === 'recommended' ? '✦' : '⚠️'}
              </span>
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
              <p style={{ color: simulationResult.status === 'warning' ? '#d9534f' : '#2e7d32', fontWeight: 600, fontSize: '10.5px' }}>
                {simulationResult.message}
              </p>
            </>
          ) : (
            <>
              <span className="sim-icon">◌</span>
              <h3>Ready to simulate</h3>
              <p>Choose a target scenario to forecast margins, cash runways, and business growth before you spend real capital.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
