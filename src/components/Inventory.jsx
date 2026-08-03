import React, { useState } from 'react';
import { api } from '../lib/api';

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
  ),
  Book: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
};

export default function Inventory({ selectedBranchId, branchState, onStateUpdate }) {
  const [selectedSector, setSelectedSector] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [purchaseProdId, setPurchaseProdId] = useState('p-1');
  const [purchaseQty, setPurchaseQty] = useState(50);
  const [cart, setCart] = useState([]);
  const [aiVerdict, setAiVerdict] = useState(null);
  const [checking, setChecking] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);

  const [bookingCustomer, setBookingCustomer] = useState('Rahul');
  const [bookingProductId, setBookingProductId] = useState('p-1');
  const [bookingQty, setBookingQty] = useState(50);
  const [bookingDeliveryDate, setBookingDeliveryDate] = useState('05 Aug 2026');
  const [bookingAdvance, setBookingAdvance] = useState(1000);
  const [bookingSaving, setBookingSaving] = useState(false);
  const [deliveringId, setDeliveringId] = useState(null);
  const [checkingBookingAi, setCheckingBookingAi] = useState(false);
  const [bookingAi, setBookingAi] = useState(null);

  if (!branchState) return null;
  const inventory = branchState.inventory || [];
  const orders = branchState.orders || [];
  const bookings = branchState.bookings || [];

  const bookingProduct = inventory.find(p => p.id === bookingProductId) || inventory[0];
  const bookingEstimate = bookingProduct ? (bookingQty * bookingProduct.price) : 0;

  const sectors = ['All', ...new Set(inventory.map(p => p.sector || 'General'))];

  const filteredInventory = inventory.filter(prod => {
    const matchesSector = selectedSector === 'All' || prod.sector === selectedSector;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (prod.origin && prod.origin.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSector && matchesSearch;
  });

  const sortedInventory = [...filteredInventory].sort((a, b) => a.stock - b.stock);

  const selectedProd = inventory.find(p => p.id === purchaseProdId) || inventory[0];
  const lineCost = selectedProd ? (purchaseQty * selectedProd.cost) : 0;

  const addToCart = () => {
    const product = inventory.find(p => p.id === purchaseProdId);
    if (!product || purchaseQty <= 0) return;
    setCart(prev => {
      const existing = prev.find(c => c.productId === product.id);
      if (existing) {
        return prev.map(c => (c.productId === product.id ? { ...c, quantity: c.quantity + purchaseQty } : c));
      }
      return [...prev, { productId: product.id, quantity: purchaseQty }];
    });
    setPurchaseQty(50);
  };

  const removeFromCart = (productId) => setCart(prev => prev.filter(c => c.productId !== productId));

  const cartTotal = cart.reduce((sum, c) => {
    const p = inventory.find(prod => prod.id === c.productId);
    return sum + (p ? p.cost * c.quantity : 0);
  }, 0);

  const checkOrder = async () => {
    if (cart.length === 0) return;
    setChecking(true);
    setAiVerdict(null);
    try {
      const res = await api('/api/orders/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId: selectedBranchId, items: cart })
      });
      const data = await res.json();
      setAiVerdict(data);
    } catch (err) {
      console.error("AI order check failed:", err);
    } finally {
      setChecking(false);
    }
  };

  const confirmOrder = async () => {
    if (cart.length === 0) return;
    setConfirming(true);
    try {
      const res = await api('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId: selectedBranchId, items: cart })
      });
      const data = await res.json();
      if (data.success) {
        onStateUpdate(data.branch);
        setCart([]);
        setAiVerdict(null);
        setShowOrders(true);
      }
    } catch (err) {
      console.error("Order create failed:", err);
    } finally {
      setConfirming(false);
    }
  };

  const advanceOrder = async (orderId) => {
    try {
      const res = await api('/api/orders/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId: selectedBranchId, orderId })
      });
      const data = await res.json();
      if (data.success) onStateUpdate(data.branch);
    } catch (err) {
      console.error("Order advance failed:", err);
    }
  };

  const checkBookingAi = async () => {
    setCheckingBookingAi(true);
    setBookingAi(null);
    try {
      const response = await api('/api/bookings/check-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: selectedBranchId,
          productId: bookingProductId,
          quantity: bookingQty
        })
      });
      const data = await response.json();
      if (data.success) {
        setBookingAi(data);
      }
    } catch (err) {
      console.error("AI check error:", err);
    } finally {
      setCheckingBookingAi(false);
    }
  };

  const createBooking = async (e) => {
    if (e) e.preventDefault();
    setBookingSaving(true);
    try {
      const response = await api('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: selectedBranchId,
          name: bookingCustomer,
          productId: bookingProductId,
          quantity: bookingQty,
          deliveryDate: bookingDeliveryDate,
          advance: bookingAdvance
        })
      });
      const data = await response.json();
      if (data.success) {
        onStateUpdate(data.branch);
        setBookingQty(50);
        setBookingAdvance(1000);
        setBookingAi(null);
      }
    } catch (err) {
      console.error("Booking creation failed:", err);
    } finally {
      setBookingSaving(false);
    }
  };

  const deliverBooking = async (bookingId) => {
    setDeliveringId(bookingId);
    try {
      const response = await api('/api/bookings/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: selectedBranchId,
          bookingId
        })
      });
      const data = await response.json();
      if (data.success) {
        onStateUpdate(data.branch);
      }
    } catch (err) {
      console.error("Booking delivery failed:", err);
    } finally {
      setDeliveringId(null);
    }
  };

  const totalAssetValue = inventory.reduce((sum, item) => sum + (item.stock * item.cost), 0);

  const statusColor = (status) => {
    switch (status) {
      case 'placed': return '#2563eb';
      case 'confirmed': return '#4f46e5';
      case 'packed': return '#d97706';
      case 'in_transit': return '#7c3aed';
      case 'delivered': return '#16a34a';
      default: return '#64748b';
    }
  };
  const statusLabel = (status) => status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const ORDER_STEPS = ['placed', 'confirmed', 'packed', 'in_transit', 'delivered'];

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
                  placeholder="Search products, sectors or states..."
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
            {sortedInventory.map(prod => {
              const isLow = prod.stock < prod.safetyLimit;
              const stockPercent = Math.min(100, Math.round((prod.stock / (prod.safetyLimit * 4)) * 100));
              const marginAmt = prod.price - prod.cost;
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
                      <span className="inv-cost-price">Buying Price: ₹{prod.cost}/{prod.unit}</span>
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
                    <span>Unit Margin: <b style={{ color: '#16a34a' }}>+₹{marginAmt} (+{marginPct}%)</b></span>
                    <button 
                      className="inv-quick-buy-btn"
                      onClick={() => {
                        setPurchaseProdId(prod.id);
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
            <p className="inv-info-title">📦 Stack a Multi-Item Purchase Order</p>
            <p className="inv-info-desc">
              Add items to your order, let AI review the price &amp; stock picture, then confirm. Track each order's journey from placed → delivered.
            </p>
          </div>

          {/* ── Cart Builder ─────────────────────────────────────── */}
          <div className="inv-cart-builder">
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
              <span>This line costs:</span>
              <b className="inv-total-cost">₹{lineCost.toLocaleString('en-IN')}</b>
            </div>

            <button type="button" className="inv-buy-submit-btn" onClick={addToCart} disabled={!selectedProd || purchaseQty <= 0}>
              <SVG.Plus /> Add to Order
            </button>
          </div>

          {/* ── Cart Stack ───────────────────────────────────────── */}
          <div className="inv-cart-box">
            <div className="inv-cart-head">
              <span>🛒 Order Stack ({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
              <b>₹{cartTotal.toLocaleString('en-IN')}</b>
            </div>
            {cart.length === 0 ? (
              <p className="inv-cart-empty">Your order stack is empty. Add items above.</p>
            ) : (
              <div className="inv-cart-list">
                {cart.map((line) => {
                  const p = inventory.find(prod => prod.id === line.productId);
                  if (!p) return null;
                  return (
                    <div key={line.productId} className="inv-cart-line">
                      <div className="inv-cart-line-info">
                        <b>{p.name}</b>
                        <span>{line.quantity} {p.unit} × ₹{p.cost} = ₹{(line.quantity * p.cost).toLocaleString('en-IN')}</span>
                      </div>
                      <button className="inv-cart-remove" onClick={() => removeFromCart(line.productId)} title="Remove">✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── AI Order Review ──────────────────────────────────── */}
          <button type="button" className="inv-ai-check-btn" onClick={checkOrder} disabled={cart.length === 0 || checking}>
            {checking ? '🤖 AI is reviewing your order…' : '🤖 AI Review: Is this order good?'}
          </button>

          {aiVerdict && aiVerdict.success && (
            <div className={`inv-verdict inv-verdict-${aiVerdict.status}`}>
              <div className="inv-verdict-top">
                <span className="inv-verdict-score">{aiVerdict.score}/100</span>
                <span className="inv-verdict-status">{statusLabel(aiVerdict.status)}</span>
              </div>
              <p className="inv-verdict-summary">{aiVerdict.summary}</p>
              <div className="inv-verdict-cost">
                <span>Order cost: <b>₹{aiVerdict.totalCost.toLocaleString('en-IN')}</b></span>
                <span>Cash in bank: <b>₹{aiVerdict.cash.toLocaleString('en-IN')}</b></span>
                <span className={aiVerdict.budgetOk ? 'inv-ok' : 'inv-warn'}>
                  {aiVerdict.budgetOk ? '✓ Within budget' : `✗ Over budget by ₹${Math.max(0, aiVerdict.totalCost - aiVerdict.cash).toLocaleString('en-IN')}`}
                </span>
              </div>
              {aiVerdict.issues.length > 0 && (
                <ul className="inv-verdict-issues">
                  {aiVerdict.issues.map((issue, i) => <li key={i}>⚠️ {issue}</li>)}
                </ul>
              )}
              {aiVerdict.supplierTips.length > 0 && (
                <div className="inv-supplier-tips">
                  <b>🏷️ Supplier tips</b>
                  {aiVerdict.supplierTips.map((tip, i) => <p key={i}>{tip}</p>)}
                </div>
              )}
            </div>
          )}

          {aiVerdict && aiVerdict.error && (
            <div className="inv-verdict inv-verdict-error">
              <p>{aiVerdict.error}</p>
            </div>
          )}

          {/* ── Confirm Purchase ─────────────────────────────────── */}
          <button type="button" className="inv-confirm-btn" onClick={confirmOrder} disabled={cart.length === 0 || confirming}>
            {confirming ? 'Confirming order…' : `✓ Confirm Purchase Order (₹${cartTotal.toLocaleString('en-IN')})`}
          </button>

          {/* ── Orders & Tracking ────────────────────────────────── */}
          <div className="inv-orders-head">
            <h3>📦 Purchase Orders</h3>
            <button className="inv-orders-toggle" onClick={() => setShowOrders(s => !s)}>
              {showOrders ? 'Hide' : `Show (${orders.length})`}
            </button>
          </div>

          {showOrders && (
            <div className="inv-orders-list">
              {orders.length === 0 ? (
                <p className="inv-cart-empty">No purchase orders yet. Stack and confirm your first order.</p>
              ) : orders.map((order) => {
                const stepIdx = ORDER_STEPS.indexOf(order.status);
                const isTracking = trackingOrderId === order.id;
                return (
                  <div key={order.id} className="inv-order-card">
                    <div className="inv-order-top">
                      <div>
                        <b className="inv-order-id">{order.id}</b>
                        <span className="inv-order-meta">{order.date} · {order.supplier}</span>
                      </div>
                      <span className="inv-order-status" style={{ background: statusColor(order.status) }}>
                        {statusLabel(order.status)}
                      </span>
                    </div>
                    <div className="inv-order-lines">
                      {order.items.slice(0, 3).map((it, i) => (
                        <span key={i}>{it.quantity} {it.unit} × {it.name}</span>
                      ))}
                      {order.items.length > 3 && <span>+{order.items.length - 3} more</span>}
                    </div>
                    <div className="inv-order-foot">
                      <b>₹{order.totalCost.toLocaleString('en-IN')}</b>
                      <div className="inv-order-actions">
                        <button className="inv-track-toggle" onClick={() => setTrackingOrderId(isTracking ? null : order.id)}>
                          {isTracking ? 'Hide tracking' : '📍 Track order'}
                        </button>
                        {order.status !== 'delivered' && (
                          <button className="inv-advance-btn" onClick={() => advanceOrder(order.id)}>Advance →</button>
                        )}
                      </div>
                    </div>

                    {isTracking && (
                      <div className="inv-track-timeline">
                        {ORDER_STEPS.map((step, i) => {
                          const done = i <= stepIdx;
                          const current = i === stepIdx;
                          return (
                  <div key={step} className={`inv-track-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                              <span className="inv-track-dot" style={{ background: done ? statusColor(step) : '#e2e8f0' }} />
                              <span className="inv-track-label">{statusLabel(step)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Advance Bookings Station */}
        <div className="inv-procure-panel" style={{ marginTop: '24px' }}>
          <div className="inv-panel-title" style={{ marginBottom: '16px' }}>
            <SVG.Book />
            <h2>Advance Bookings &amp; Stock Reservation</h2>
          </div>

          <div className="inv-info-card">
            <p className="inv-info-title">🧾 Pre-orders from Your Customers</p>
            <p className="inv-info-desc">
              Log customer advance bookings, check stock safety with AI, and dispatch on delivery. Advance payments add to cash; stock deducts on delivery and unpaid balances sync to Khata Ledger.
            </p>
          </div>

          {/* ── Booking Form ─────────────────────────── */}
          <form onSubmit={createBooking}>
            <div className="inv-form-field">
              <label>Customer</label>
              <select value={bookingCustomer} onChange={(e) => setBookingCustomer(e.target.value)} className="inv-select">
                <option value="Rahul">Rahul (Standard)</option>
                <option value="Mahaveer Stores">Mahaveer Stores (Wholesale)</option>
                <option value="Sunil Traders">Sunil Traders (Credit account)</option>
                <option value="Walk-in Customer">Walk-in Customer</option>
              </select>
            </div>

            <div className="inv-form-field">
              <label>Product to Book</label>
              <select value={bookingProductId} onChange={(e) => setBookingProductId(e.target.value)} className="inv-select">
                {inventory.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.origin}) — ₹{p.price}/{p.unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="inv-form-field">
              <label>Quantity to Book ({bookingProduct?.unit})</label>
              <div className="inv-qty-stepper">
                <button type="button" onClick={() => setBookingQty(q => Math.max(10, q - 10))}>−</button>
                <input type="number" value={bookingQty} onChange={(e) => setBookingQty(Number(e.target.value) || 10)} className="inv-qty-input" />
                <button type="button" onClick={() => setBookingQty(q => q + 10)}>+</button>
              </div>
            </div>

            <div className="inv-form-field">
              <label>Target Delivery Date</label>
              <input type="text" value={bookingDeliveryDate} onChange={(e) => setBookingDeliveryDate(e.target.value)} className="inv-qty-input" style={{ width: '100%', height: '38px' }} />
            </div>

            <div className="inv-form-field">
              <label>Advance Payment Paid (₹)</label>
              <input type="number" value={bookingAdvance} onChange={(e) => setBookingAdvance(parseInt(e.target.value) || 0)} className="inv-qty-input" style={{ width: '100%', height: '38px' }} />
            </div>

            <div className="inv-cost-summary">
              <span>Total Est. Order Value:</span>
              <b className="inv-total-cost">₹{bookingEstimate.toLocaleString('en-IN')}</b>
            </div>
          </form>

          <button type="button" className="inv-ai-check-btn" onClick={checkBookingAi} disabled={checkingBookingAi}>
            {checkingBookingAi ? '🤖 AI analyzing…' : '🤖 AI Check: Enough stock?'}
          </button>

          {bookingAi && bookingAi.success && (
            <div className={`inv-verdict ${bookingAi.isSafe ? 'inv-verdict-ok' : 'inv-verdict-warn'}`}>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>
                {bookingAi.isSafe ? '✓ AI Inventory Clear' : '⚠ AI Stock Warning'}
              </div>
              <p className="inv-verdict-summary" style={{ margin: 0 }}>{bookingAi.message}</p>
              <p className="inv-supplier-tips" style={{ margin: '8px 0 0' }}>{bookingAi.dealerAdvice}</p>
            </div>
          )}

          <button type="button" className="inv-confirm-btn" onClick={createBooking} disabled={bookingSaving || !bookingProduct || bookingQty <= 0}>
            {bookingSaving ? 'Saving booking…' : `✓ Book Order & Allocate (₹${bookingEstimate.toLocaleString('en-IN')})`}
          </button>

          {/* ── Active Bookings List ─────────────────── */}
          <div className="inv-orders-head">
            <h3>🧾 Active Advance Bookings</h3>
            <span className="inv-order-meta">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="inv-orders-list">
            {bookings.length === 0 ? (
              <p className="inv-cart-empty">No advance bookings yet. Create one above.</p>
            ) : bookings.map((bk) => (
              <div key={bk.id} className="inv-order-card">
                <div className="inv-order-top">
                  <div>
                    <b className="inv-order-id">{bk.name}</b>
                    <span className="inv-order-meta">Booked {bk.date} · Deliver {bk.deliveryDate}</span>
                  </div>
                  <span className="inv-order-status" style={{ background: bk.status === 'delivered' ? '#16a34a' : '#d97706' }}>
                    {statusLabel(bk.status)}
                  </span>
                </div>
                <div className="inv-order-lines">
                  <span>{bk.quantity} {bk.unit} × {bk.productName}</span>
                  <span>Advance: <b>₹{bk.advance.toLocaleString('en-IN')}</b></span>
                </div>
                <div className="inv-order-foot">
                  <b>₹{(bk.quantity * (inventory.find(p => p.id === bk.productId)?.price || 0)).toLocaleString('en-IN')}</b>
                  <div className="inv-order-actions">
                    {bk.status !== 'delivered' && (
                      <button className="inv-advance-btn" onClick={() => deliverBooking(bk.id)} disabled={deliveringId === bk.id}>
                        {deliveringId === bk.id ? 'Delivering…' : 'Deliver & Deduct Stock'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
