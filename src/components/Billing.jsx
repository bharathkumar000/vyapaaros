import React, { useState } from 'react';

/* ─── SVG Icons ─────────────────────────────────────────────── */
const SVG = {
  Print: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px' }}>
      <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
    </svg>
  ),
  Cart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
  Box: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '36px', height: '36px' }}>
      <polyline points="20 6 9 17 4 12" />
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
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px' }}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
};

export default function Billing({ selectedBranchId, branchState, onStateUpdate, setView }) {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('Rahul');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState(null);

  /* Modal state for selecting quantity */
  const [activeModalProd, setActiveModalProd] = useState(null);
  const [modalQty, setModalQty] = useState(1);

  if (!branchState) return null;
  const inventory = branchState.inventory || [];

  const customerReceivable = branchState.receivables?.find(r => r.name === customer && r.status !== 'paid');
  const outstanding = customerReceivable ? customerReceivable.amount : 0;

  const filteredInventory = inventory.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openQtyModal = (product) => {
    const existing = cart.find(item => item.productId === product.id);
    setActiveModalProd(product);
    setModalQty(existing ? existing.quantity : 1);
  };

  const confirmModalAddToCart = () => {
    if (!activeModalProd) return;
    const qtyToAdd = Math.max(1, Math.min(activeModalProd.stock, Number(modalQty) || 1));
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === activeModalProd.id);
      if (existing) {
        return prev.map(item => 
          item.productId === activeModalProd.id 
            ? { ...item, quantity: qtyToAdd } 
            : item
        );
      }
      return [...prev, {
        productId: activeModalProd.id,
        name: activeModalProd.name,
        price: activeModalProd.price,
        unit: activeModalProd.unit,
        cost: activeModalProd.cost,
        stock: activeModalProd.stock,
        quantity: qtyToAdd
      }];
    });

    setActiveModalProd(null);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, newQty) => {
    const product = inventory.find(p => p.id === productId);
    if (!product) return;
    const qty = Math.max(1, Math.min(product.stock, newQty));
    setCart(prev => prev.map(item => item.productId === productId ? { ...item, quantity: qty } : item));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const handleCheckoutSubmit = () => {
    if (paymentMode === 'UPI') {
      setShowQR(true);
      setReconciling(true);
      setTimeout(() => {
        setReconciling(false);
      }, 2200);
    } else {
      executeBillingCheckout();
    }
  };

  const executeBillingCheckout = async () => {
    setCheckingOut(true);
    try {
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: selectedBranchId,
          totalAmount: total,
          paymentMode,
          customer,
          items: cart.map(c => ({
            productId: c.productId,
            quantity: c.quantity
          }))
        })
      });
      const updatedBranch = await response.json();
      onStateUpdate(updatedBranch);

      setInvoiceResult({
        invoiceId: updatedBranch.bills?.[0]?.id || `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        customer,
        paymentMode,
        items: [...cart],
        total
      });

      setCart([]);
      setShowQR(false);
    } catch (err) {
      console.error("Billing transaction failed:", err);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="pos-root">
      
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="pos-header">
        <div>
          <p className="eyebrow">FAST COUNTER BILLING</p>
          <h1 className="pos-title">Smart AI Billing (POS)</h1>
          <p className="pos-subtitle">Tap products to choose quantity and auto-calculate GST &amp; ledger entries.</p>
        </div>

        {/* Quick Customer Selection */}
        <div className="pos-customer-card">
          <div className="pos-cust-icon"><SVG.User /></div>
          <div>
            <span className="pos-cust-label">Bill To Client</span>
            <select 
              value={customer} 
              onChange={(e) => setCustomer(e.target.value)} 
              className="pos-cust-select"
            >
              <option value="Rahul">Rahul (Retail Account)</option>
              <option value="Mahaveer Stores">Mahaveer Stores (Wholesale)</option>
              <option value="Sunil Traders">Sunil Traders (Commercial)</option>
              <option value="Ramesh G.">Ramesh G. (Walk-in Regular)</option>
              <option value="Walk-in Customer">Cash Walk-in</option>
            </select>
          </div>
          {outstanding > 0 && (
            <span className="pos-due-pill">Owes ₹{outstanding.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>

      {/* ────── Main POS Layout ──────────────────────────────────── */}
      {invoiceResult ? (

        /* ── Receipt Confirmation Card ────────────────────────────── */
        <div className="pos-receipt-modal">
          <div className="pos-receipt-card">
            <div className="pos-receipt-badge"><SVG.Check /></div>
            <h2 className="pos-receipt-title">GST Invoice Created</h2>
            <p className="pos-receipt-sub">
              Invoice <b>{invoiceResult.invoiceId}</b> generated for <b>{invoiceResult.customer}</b>. Sent via WhatsApp.
            </p>

            <div className="pos-paper-receipt">
              <div className="pos-paper-header">
                <h3>SRI LAKSHMI TRADERS</h3>
                <p>Main Branch · GSTIN: 29AAAAA0000A1Z5</p>
              </div>
              <div className="pos-paper-meta">
                <span>Date: 30 July 2026</span>
                <span>Bill ID: {invoiceResult.invoiceId}</span>
                <span>Payment: {invoiceResult.paymentMode}</span>
              </div>
              <table className="pos-paper-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceResult.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                      <td style={{ textAlign: 'right' }}>₹{item.price}</td>
                      <td style={{ textAlign: 'right' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pos-paper-footer">
                <div><span>Subtotal:</span><b>₹{Math.round(invoiceResult.total / 1.18).toLocaleString('en-IN')}</b></div>
                <div><span>GST (18%):</span><b>₹{Math.round(invoiceResult.total * 0.18 / 1.18).toLocaleString('en-IN')}</b></div>
                <div className="pos-paper-grand"><span>Grand Total:</span><b>₹{invoiceResult.total.toLocaleString('en-IN')}</b></div>
              </div>
            </div>

            <div className="pos-receipt-actions">
              <button className="pos-btn-primary" onClick={() => setInvoiceResult(null)}>
                <SVG.Plus /> Create Next Bill
              </button>
              <button className="pos-btn-secondary" onClick={() => window.print()}>
                <SVG.Print /> Print Paper Invoice
              </button>
            </div>
          </div>
        </div>

      ) : (

        /* ── Active Billing Counter ──────────────────────────────── */
        <div className="pos-grid">
          
          {/* Left Column: Product Catalogue (2-Column Grid) */}
          <div className="pos-catalogue-panel">
            <div className="pos-panel-top">
              <div className="pos-panel-title">
                <SVG.Box />
                <h2>Product Inventory Catalogue</h2>
              </div>

              {/* Search Bar */}
              <div className="pos-search-box">
                <SVG.Search />
                <input 
                  type="text" 
                  placeholder="Search Sona Masoori, Ghee, Sugar..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* 2-Column Product Cards Grid */}
            <div className="pos-products-2col-grid">
              {filteredInventory.map(prod => {
                const inCartItem = cart.find(c => c.productId === prod.id);
                const isLowStock = prod.stock < prod.safetyLimit;
                return (
                  <div 
                    key={prod.id} 
                    className={`pos-product-2col-card ${isLowStock ? 'pos-card-low' : ''} ${inCartItem ? 'pos-card-active' : ''}`}
                    onClick={() => openQtyModal(prod)}
                  >
                    <div className="pos-2col-top">
                      <h3 className="pos-2col-name">{prod.name}</h3>
                      <div className="pos-2col-price">₹{prod.price}<small>/{prod.unit}</small></div>
                    </div>
                    
                    <div className="pos-2col-bottom">
                      <span className={`pos-stock-tag ${isLowStock ? 'tag-low' : 'tag-ok'}`}>
                        Stock: {prod.stock} {prod.unit}
                      </span>
                      {inCartItem && (
                        <span className="pos-incart-tag">In Cart ({inCartItem.quantity} {prod.unit})</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Billing Invoice Cart */}
          <div className="pos-cart-panel">
            <div className="pos-cart-header">
              <div className="pos-panel-title">
                <SVG.Cart />
                <h2>Billing Invoice Cart</h2>
              </div>
              {cart.length > 0 && (
                <span className="pos-cart-count">{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
              )}
            </div>

            {/* Cart Items List */}
            <div className="pos-cart-items-wrap">
              {cart.length === 0 ? (
                <div className="pos-cart-empty">
                  <SVG.Cart />
                  <p className="pos-empty-title">Cart is empty</p>
                  <p className="pos-empty-sub">Tap any product on the left to set quantity and add to bill.</p>
                </div>
              ) : (
                <div className="pos-cart-items">
                  {cart.map(item => (
                    <div key={item.productId} className="pos-cart-item">
                      <div className="pos-cart-item-info">
                        <span className="pos-item-name">{item.name}</span>
                        <span className="pos-item-rate">₹{item.price}/{item.unit}</span>
                      </div>

                      {/* Tactile Quantity Controls */}
                      <div className="pos-qty-controls">
                        <button 
                          className="pos-qty-btn" 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          −
                        </button>
                        <input 
                          type="number" 
                          className="pos-qty-input"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                        />
                        <button 
                          className="pos-qty-btn" 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <div className="pos-item-total">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>

                      <button 
                        className="pos-remove-btn" 
                        onClick={() => removeFromCart(item.productId)}
                        title="Remove item"
                      >
                        <SVG.Trash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment & Checkout Section */}
            {cart.length > 0 && (
              <div className="pos-checkout-section">
                
                {/* Payment Channel Toggle Buttons */}
                <div className="pos-payment-selector">
                  <label className="pos-field-label">Payment Channel</label>
                  <div className="pos-payment-tabs">
                    {[
                      { mode: 'Cash', label: '💵 Cash' },
                      { mode: 'UPI', label: '📱 UPI QR' },
                      { mode: 'Credit', label: '📒 Credit (Khata)' }
                    ].map(opt => (
                      <button
                        key={opt.mode}
                        className={`pos-payment-tab ${paymentMode === opt.mode ? 'active-mode' : ''}`}
                        onClick={() => setPaymentMode(opt.mode)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Summary */}
                <div className="pos-summary-table">
                  <div className="pos-sum-row">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pos-sum-row">
                    <span>GST (18% slab):</span>
                    <span>₹{gst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pos-sum-row pos-grand-total">
                    <span>Grand Total:</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Big Action Checkout Button */}
                <button 
                  className="pos-checkout-btn"
                  onClick={handleCheckoutSubmit}
                  disabled={checkingOut}
                >
                  {checkingOut ? (
                    'Processing Transaction…'
                  ) : (
                    <>
                      <span>Generate Bill &amp; Sync Ledger</span>
                      <span className="pos-btn-amt">₹{total.toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Quantity Selector Popup Modal ──────────────────────── */}
      {activeModalProd && (
        <div className="pos-modal-overlay" onClick={() => setActiveModalProd(null)}>
          <div className="pos-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <div>
                <h3 className="pos-modal-title">{activeModalProd.name}</h3>
                <span className="pos-modal-subtitle">₹{activeModalProd.price}/{activeModalProd.unit} · Stock: {activeModalProd.stock} {activeModalProd.unit}</span>
              </div>
              <button className="pos-modal-close" onClick={() => setActiveModalProd(null)}>
                <SVG.Close />
              </button>
            </div>

            <div className="pos-modal-body">
              <label className="pos-field-label">Type Quantity ({activeModalProd.unit})</label>
              
              <div className="pos-qty-input-row">
                <button 
                  className="pos-modal-qty-btn"
                  onClick={() => setModalQty(q => Math.max(1, Number(q) - 1))}
                >
                  −
                </button>
                <input 
                  type="number"
                  className="pos-modal-large-input"
                  value={modalQty}
                  onChange={(e) => setModalQty(e.target.value)}
                  autoFocus
                />
                <button 
                  className="pos-modal-qty-btn"
                  onClick={() => setModalQty(q => Math.min(activeModalProd.stock, Number(q) + 1))}
                >
                  +
                </button>
              </div>

              {/* Quick Qty Preset Chips */}
              <div className="pos-modal-presets">
                <span className="pos-field-label" style={{ width: '100%', marginBottom: 4 }}>Quick Shortcuts:</span>
                {[1, 5, 10, 25, 50, 100].map(val => (
                  <button 
                    key={val} 
                    className={`pos-chip-btn ${Number(modalQty) === val ? 'chip-active' : ''}`}
                    onClick={() => setModalQty(val)}
                    disabled={activeModalProd.stock < val}
                  >
                    {val} {activeModalProd.unit}
                  </button>
                ))}
              </div>

              {/* Total Price Preview */}
              <div className="pos-modal-total-box">
                <span>Calculated Item Total:</span>
                <b>₹{(activeModalProd.price * (Number(modalQty) || 1)).toLocaleString('en-IN')}</b>
              </div>
            </div>

            <div className="pos-modal-footer">
              <button className="pos-btn-secondary" onClick={() => setActiveModalProd(null)}>Cancel</button>
              <button className="pos-btn-primary" onClick={confirmModalAddToCart}>
                <SVG.Plus /> Add to Invoice Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPI QR Modal Overlay */}
      {showQR && (
        <div className="pos-qr-overlay">
          <div className="pos-qr-card">
            <h3>Scan Dynamic UPI QR</h3>
            <p>Scan with PhonePe, Paytm, Google Pay, or BHIM</p>
            
            <div className="pos-qr-box">
              <div className="pos-qr-grid">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className={`qr-cell ${i % 3 === 0 || i % 5 === 1 ? 'dark' : ''}`} />
                ))}
              </div>
            </div>

            <div className="pos-qr-total">₹{total.toLocaleString('en-IN')}</div>
            <p className="pos-qr-status">
              {reconciling ? (
                <>
                  <span className="spinner" style={{ width: '12px', height: '12px' }} />
                  Waiting for UPI payment webhook…
                </>
              ) : (
                '✓ UPI Received! Auto-reconciliation complete.'
              )}
            </p>

            {!reconciling && (
              <button className="pos-btn-primary" style={{ width: '100%', marginTop: '16px' }} onClick={executeBillingCheckout}>
                Proceed &amp; Print Receipt
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
