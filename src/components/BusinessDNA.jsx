import React, { useState } from 'react';

export default function BusinessDNA({ branchState, onCloneComplete }) {
  const [name, setName] = useState('');
  const [pricingMarkup, setPricingMarkup] = useState(15);
  const [safetyStockDays, setSafetyStockDays] = useState(10);
  const [supplierDelayDays, setSupplierDelayDays] = useState(5);
  const [alertSensitivity, setAlertSensitivity] = useState('high');
  const [cloning, setCloning] = useState(false);

  if (!branchState) return null;

  const handleCloneSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCloning(true);

    try {
      const response = await fetch('/api/clone', {
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
          💡 <b>What is Business DNA cloning?</b>
          <br />
          Instead of manually setting up inventory safety levels, invoice markup rules, GST codes, and payment guidelines from scratch, the Business Brain bundles Ramesh's current operational rules. Select 'Clone' to instantly copy this operational DNA to a new branch without reconfiguring anything.
        </div>

        <form onSubmit={handleCloneSubmit}>
          <div className="dna-grid">
            <div className="dna-field">
              <label>New Branch Name</label>
              <input 
                type="text" 
                placeholder="e.g. Sri Lakshmi Traders - Branch 2"
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

            <div className="dna-field">
              <label>AI Alert Sensitivity</label>
              <select 
                value={alertSensitivity}
                onChange={(e) => setAlertSensitivity(e.target.value)}
              >
                <option value="high">High (Audits duplicate transactions & refunds)</option>
                <option value="med">Medium (Audits standard errors only)</option>
                <option value="low">Low (Audits severe accounting failures only)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="primary" style={{ width: '100%' }} disabled={cloning}>
            {cloning ? 'Cloning Business Brain DNA...' : '🧬 Clone My Business Now'}
          </button>
        </form>
      </div>
    </div>
  );
}
