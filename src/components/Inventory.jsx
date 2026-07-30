import React, { useState } from 'react';

/* ─── SVG Icons ─────────────────────────────────────────────── */
const SVG = {
  List: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Truck: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
      <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16" />
      <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  IndiaFlag: () => (
    <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', borderRadius: '2px' }}>
      <rect width="24" height="8" fill="#FF9933" />
      <rect y="8" width="24" height="8" fill="#FFFFFF" />
      <rect y="16" width="24" height="8" fill="#128807" />
      <circle cx="12" cy="12" r="3" fill="none" stroke="#000080" strokeWidth="1" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ width: '14px', height: '14px' }}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px' }}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
};

export default function Inventory({ selectedBranchId, branchState, onStateUpdate }) {
  const [selectedSector, setSelectedSector] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [purchaseProdId, setPurchaseProdId] = useState('p-1');
  const [purchaseQty, setPurchaseQty] = useState(50);
  const [purchasing, setPurchasing] = useState(false);

  if (!branchState) return null;
  const inventory = branchState.inventory || [];

  const sectors = ['All', ...new Set(inventory.map(p => p.sector || 'General'))];

  const filteredInventory = inventory.filter(prod => {
    const matchesSector = selectedSector === 'All' || prod.sector === selectedSector;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (prod.origin && prod.origin.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSector && matchesSearch;
  });

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setPurchasing(true);

    try {
      const response = await fetch('/api/inventory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: selectedBranchId,
          productId: purchaseProdId,
          quantity: purchaseQty
        })
      });
      const data = await response.json();
      if (data.success) {
        onStateUpdate(data.branch);
        setPurchaseQty(50);
      }
    } catch (err) {
      console.error("Restocking transaction failed:", err);
    } finally {
      setPurchasing(false);
    }
  };

  const selectedProd = inventory.find(p => p.id === purchaseProdId) || inventory[0];
  const totalPurchaseCost = selectedProd ? (purchaseQty * selectedProd.cost) : 0;

  const totalAssetValue = inventory.reduce((sum, item) => sum + (item.stock * item.cost), 0);

  return (
    <div className="inv-root">

      {/* ── Make in India Banner Header ──────────────────────────── */}
      <div className="inv-header">
        <div className="inv-header-left">
          <div className="inv-flag-badge">
            <SVG.IndiaFlag />
            <span>MAKE IN BHARAT · 10 SECTORS VERIFIED</span>
          </div>
          <h1 className="inv-title">Swadeshi Inventory Operations</h1>
          <p className="inv-subtitle">
            Tracking authentic Indian-manufactured commodities &amp; artisan goods across 10 core national economic sectors.
          </p>
        </div>

        <div className="inv-header-stats">
          <div className="inv-stat-chip">
            <span className="inv-stat-label">Total Swadeshi SKUs</span>
            <b className="inv-stat-val">{inventory.length} Sectors</b>
          </div>
          <div className="inv-stat-chip">
            <span className="inv-stat-label">Inventory Asset Valuation</span>
            <b className="inv-stat-val">₹{totalAssetValue.toLocaleString('en-IN')}</b>
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Inventory Layout ────────────────────────── */}
      <div className="inv-grid">

        {/* Left Column: Sector Catalogue */}
        <div className="inv-catalogue-panel">
          <div className="inv-panel-top">
            <div className="inv-panel-title">
              <SVG.List />
              <h2>Bharat Sector Inventory Catalogue</h2>
            </div>

            {/* Search & Sector Filters */}
            <div className="inv-search-row">
              <div className="inv-search-box">
                <SVG.Search />
                <input 
                  type="text" 
                  placeholder="Search products or states (e.g. Gujarat, Assam, Silk, Saffron)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Sector Tabs */}
            <div className="inv-sector-tabs">
              {sectors.map(sec => (
                <button
                  key={sec}
                  className={`inv-sector-tab ${selectedSector === sec ? 'active-sector' : ''}`}
                  onClick={() => setSelectedSector(sec)}
                >
                  {sec === 'All' ? '🇮🇳 All 10 Sectors' : sec}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards List */}
          <div className="inv-products-list">
            {filteredInventory.map(prod => {
              const isLow = prod.stock < prod.safetyLimit;
              const stockPercent = Math.min(100, Math.round((prod.stock / (prod.safetyLimit * 4)) * 100));
              const marginPct = Math.round(((prod.price - prod.cost) / prod.price) * 100);

              return (
                <div key={prod.id} className={`inv-prod-card ${isLow ? 'inv-card-low' : ''}`}>
                  <div className="inv-card-header">
                    <div>
                      <div className="inv-tags-row">
                        <span className="inv-sector-badge">🇮🇳 {prod.sector || 'Bharat Sector'}</span>
                        <span className="inv-origin-badge">📍 {prod.origin || 'India'}</span>
                        <span className="inv-hsn-badge">HSN: {prod.hsn || '1000'} · GST {prod.gst || '5%'}</span>
                      </div>
                      <h3 className="inv-prod-name">{prod.name}</h3>
                    </div>

                    <div className="inv-price-block">
                      <b className="inv-sell-price">₹{prod.price}<small>/{prod.unit}</small></b>
                      <span className="inv-cost-price">Cost: ₹{prod.cost}/{prod.unit}</span>
                    </div>
                  </div>

                  {/* Stock meter */}
                  <div className="inv-stock-meter-block">
                    <div className="inv-stock-labels">
                      <span>Available Stock: <b>{prod.stock} {prod.unit}</b></span>
                      <span className={`inv-status-tag ${isLow ? 'tag-alert' : 'tag-healthy'}`}>
                        {isLow ? '⚠️ Below Safety Threshold' : '✓ Healthy Stock'}
                      </span>
                    </div>
                    <div className="inv-meter-bg">
                      <div 
                        className={`inv-meter-fill ${isLow ? 'fill-alert' : 'fill-ok'}`} 
                        style={{ width: `${stockPercent}%` }} 
                      />
                    </div>
                  </div>

                  <div className="inv-card-footer">
                    <span>Safety Margin: <b>{prod.safetyLimit} {prod.unit}</b></span>
                    <span>Unit Margin: <b style={{ color: '#16a34a' }}>+{marginPct}%</b></span>
                    <button 
                      className="inv-quick-buy-btn"
                      onClick={() => {
                        setPurchaseProdId(prod.id);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                    >
                      <SVG.Plus /> Restock SKU
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Supplier Procurement (Restock) Station */}
        <div className="inv-procure-panel">
          <div className="inv-panel-title" style={{ marginBottom: '16px' }}>
            <SVG.Truck />
            <h2>Supplier Restocking Station</h2>
          </div>

          <div className="inv-info-card">
            <p className="inv-info-title">📦 Swadeshi Direct Procurement</p>
            <p className="inv-info-desc">
              Purchasing stock deducts outlay from Cash in Bank, updates the Inventory Asset ledger, and resolves safety limit warnings automatically.
            </p>
          </div>

          <form onSubmit={handlePurchaseSubmit} className="inv-restock-form">
            <div className="inv-form-field">
              <label>Select Indian Product to Restock</label>
              <select
                value={purchaseProdId}
                onChange={(e) => setPurchaseProdId(e.target.value)}
                className="inv-select"
              >
                {inventory.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.origin}) — Cost: ₹{p.cost}/{p.unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="inv-form-field">
              <label>Purchase Quantity ({selectedProd?.unit})</label>
              <div className="inv-qty-stepper">
                <button type="button" onClick={() => setPurchaseQty(q => Math.max(10, q - 25))}>−</button>
                <input 
                  type="number" 
                  value={purchaseQty}
                  onChange={(e) => setPurchaseQty(Number(e.target.value) || 10)}
                  className="inv-qty-input"
                />
                <button type="button" onClick={() => setPurchaseQty(q => q + 25)}>+</button>
              </div>
            </div>

            <div className="inv-cost-summary">
              <span>Total Procurement Cost:</span>
              <b className="inv-total-cost">₹{totalPurchaseCost.toLocaleString('en-IN')}</b>
            </div>

            <button type="submit" className="inv-buy-submit-btn" disabled={purchasing}>
              {purchasing ? 'Procuring Stock…' : `Purchase ${purchaseQty} ${selectedProd?.unit || 'units'} & Sync`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
