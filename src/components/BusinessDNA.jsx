import React, { useState } from 'react';
import { api } from '../lib/api';

const SVG = {
  Info: () => (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
};

export default function BusinessDNA({ branchState, onCloneComplete }) {
  const [name, setName] = useState('');
  const [pricingMarkup, setPricingMarkup] = useState(15);
  const [safetyStockDays, setSafetyStockDays] = useState(10);
  const [supplierDelayDays, setSupplierDelayDays] = useState(5);
  const [alertSensitivity, setAlertSensitivity] = useState('high');
  const [cloning, setCloning] = useState(false);
  const [sensitivityOpen, setSensitivityOpen] = useState(false);

  if (!branchState) return null;

  const handleCloneSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCloning(true);

    try {
      const response = await api('/api/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          pricingMarkup,
          safetyStockDays,
          supplierDelayDays,
          alertSensitivity
        })
      });
      const data = await response.json();
      if (data.success) {
        setName('');
        onCloneComplete(data.branchId, data.branches);
      }
    } catch (err) {
      console.error("Cloning branch failed:", err);
    } finally {
      setCloning(false);
    }
  };

  return (
    <div className="centered-view">
      <div className="view-title">
        <p className="eyebrow">PORTABLE OPERATIONAL LOGIC</p>
        <h2>AI Business DNA</h2>
        <p>Every business learns pricing styles, inventory pattern margins, and behavior patterns. Clone them instantly to a new branch.</p>
      </div>

      <div className="dna-container">
        <div className="dna-card-desc">
          <SVG.Info />
          <div>
            <b>What is Business DNA cloning?</b>
            <br />
            Instead of manually setting up inventory safety levels, invoice markup rules, GST codes, and payment guidelines from scratch, the Business Brain bundles Ramesh's current operational rules. Select 'Clone' to instantly copy this operational DNA to a new branch without reconfiguring anything.
          </div>
        </div>

        <form onSubmit={handleCloneSubmit}>
          <div className="dna-grid">
            <div className="dna-field">
              <label>New Branch Name</label>
              <input 
                type="text" 
                placeholder="e.g. Sri Lakshmi Groceries - Branch 2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="dna-field">
              <label>Pricing Markup (%)</label>
              <input 
                type="number" 
                value={pricingMarkup}
                onChange={(e) => setPricingMarkup(e.target.value)}
                min="0"
                max="100"
              />
            </div>

            <div className="dna-field">
              <label>Safety Stock Threshold (Days)</label>
              <input 
                type="number" 
                value={safetyStockDays}
                onChange={(e) => setSafetyStockDays(e.target.value)}
                min="1"
                max="30"
              />
            </div>

            <div className="dna-field">
              <label>Preferred Supplier Term Delay (Days)</label>
              <input 
                type="number" 
                value={supplierDelayDays}
                onChange={(e) => setSupplierDelayDays(e.target.value)}
                min="0"
                max="60"
              />
            </div>

            <div className="dna-field" style={{ position: 'relative' }}>
              <label>AI Alert Sensitivity</label>
              <div 
                onClick={() => setSensitivityOpen(!sensitivityOpen)}
                style={{ 
                  width: '100%', 
                  height: '42px', 
                  border: '1px solid var(--line-primary)', 
                  borderRadius: '8px', 
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
                  {alertSensitivity === 'high' ? 'High (Audits duplicate transactions & refunds)' : ''}
                  {alertSensitivity === 'med' ? 'Medium (Audits standard errors only)' : ''}
                  {alertSensitivity === 'low' ? 'Low (Audits severe accounting failures only)' : ''}
                </span>
                <span style={{ fontSize: '8px', color: 'var(--ink-secondary)' }}>▼</span>
              </div>
              {sensitivityOpen && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '64px', 
                    left: 0, 
                    right: 0, 
                    background: 'white', 
                    border: '1px solid var(--line-primary)', 
                    borderRadius: '8px', 
                    boxShadow: 'var(--shadow-md)', 
                    zIndex: 20
                  }}
                >
                  {[
                    { val: 'high', label: 'High (Audits duplicate transactions & refunds)' },
                    { val: 'med', label: 'Medium (Audits standard errors only)' },
                    { val: 'low', label: 'Low (Audits severe accounting failures only)' }
                  ].map(opt => (
                    <div 
                      key={opt.val}
                      onClick={() => {
                        setAlertSensitivity(opt.val);
                        setSensitivityOpen(false);
                      }}
                      style={{ 
                        padding: '10px 12px', 
                        cursor: 'pointer', 
                        fontSize: '11px',
                        background: opt.val === alertSensitivity ? 'var(--brand-light)' : 'transparent',
                        color: opt.val === alertSensitivity ? 'var(--brand-primary)' : 'var(--ink-primary)',
                        fontWeight: opt.val === alertSensitivity ? 700 : 500
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="primary" style={{ width: '100%' }} disabled={cloning}>
            {cloning ? 'Cloning Business Brain DNA...' : 'Clone My Business Now'}
          </button>
        </form>
      </div>
    </div>
  );
}
