import React, { useState } from 'react';

const SVG = {
  Book: () => (
    <svg viewBox="0 0 24 24" style={{ width: '15px', height: '15px', strokeWidth: '2.5px', fill: 'none', stroke: 'currentColor', marginRight: '6px', verticalAlign: 'middle' }}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" style={{ width: '15px', height: '15px', strokeWidth: '2.5px', fill: 'none', stroke: 'currentColor', marginRight: '6px', verticalAlign: 'middle' }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', strokeWidth: '2px', fill: 'none', stroke: 'currentColor', flexShrink: 0, marginTop: '2px' }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
};

export default function Bookings({ selectedBranchId, branchState, onStateUpdate }) {
  const [customer, setCustomer] = useState('Rahul');
  const [customerOpen, setCustomerOpen] = useState(false);
  const [productId, setProductId] = useState('p-1');
  const [productIdOpen, setProductIdOpen] = useState(false);
  const [quantity, setQuantity] = useState(50);
  const [deliveryDate, setDeliveryDate] = useState('05 Aug 2026');
  const [advance, setAdvance] = useState(1000);
  const [saving, setSaving] = useState(false);
  const [deliveringId, setDeliveringId] = useState(null);
  const [checkingAi, setCheckingAi] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleCheckAi = async () => {
    setCheckingAi(true);
    setAiResult(null);
    try {
      const response = await fetch('/api/bookings/check-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: selectedBranchId,
          productId,
          quantity
        })
      });
      const data = await response.json();
      if (data.success) {
        setAiResult(data);
      }
    } catch (err) {
      console.error("AI check error:", err);
    } finally {
      setCheckingAi(false);
    }
  };

  if (!branchState) return null;
  const inventory = branchState.inventory || [];
  const bookings = branchState.bookings || [];

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: selectedBranchId,
          name: customer,
          productId,
          quantity,
          deliveryDate,
          advance
        })
      });
      const data = await response.json();
      if (data.success) {
        onStateUpdate(data.branch);
        setQuantity(50);
        setAdvance(1000);
      }
    } catch (err) {
      console.error("Booking creation failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const deliverBooking = async (bookingId) => {
    setDeliveringId(bookingId);
    try {
      const response = await fetch('/api/bookings/deliver', {
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

  const selectedProductObj = inventory.find(p => p.id === productId);
  const totalEstimation = selectedProductObj ? (quantity * selectedProductObj.price) : 0;

  return (
    <div className="centered-view" style={{ maxWidth: '980px', margin: 'auto' }}>
      <div className="view-title" style={{ marginBottom: '20px' }}>
        <p className="eyebrow">ADVANCE BOOKINGS & STOCK RESERVATION</p>
        <h2>Advance Bookings</h2>
        <p style={{ fontSize: '13px', color: 'var(--ink-secondary)' }}>Book grain and flour quantities in advance for wholesale accounts, log partial advances, and dispatch stocks.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        
        {/* Left: Current Active Bookings */}
        <div style={{ background: 'white', border: '1px solid var(--line-primary)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '15px', color: '#194e47', display: 'flex', alignItems: 'center' }}>
            <SVG.Book /> Active Advance Bookings
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {bookings.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#889592', fontSize: '13px' }}>
                No active bookings recorded. Create one using the form on the right.
              </div>
            ) : (
              bookings.map(item => {
                const isDelivered = item.status === 'delivered';
                const isReady = item.status === 'ready';
                return (
                  <div 
                    key={item.id} 
                    style={{ 
                      border: '1px solid #eef2f0', 
                      borderRadius: '8px', 
                      padding: '15px', 
                      background: isDelivered ? '#f8faf9' : 'white',
                      opacity: isDelivered ? 0.7 : 1,
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div>
                        <b style={{ fontSize: '14.5px' }}>{item.name}</b>
                        <small style={{ display: 'block', fontSize: '11px', color: '#889592', marginTop: '2px' }}>
                          Booked: {item.date} · Scheduled: {item.deliveryDate}
                        </small>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', background: isDelivered ? '#e0ece8' : isReady ? '#fff2e0' : '#f0f4f2', color: isDelivered ? '#1c6856' : isReady ? '#c67e1a' : '#71807e', padding: '3px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderTop: '1px dashed #eef2f0', paddingTop: '10px', marginTop: '8px' }}>
                      <div>
                        Item: <b>{item.quantity} {item.unit} of {item.productName}</b>
                      </div>
                      <div>
                        Advance Paid: <b style={{ color: '#2b7c6c' }}>₹{item.advance.toLocaleString('en-IN')}</b>
                      </div>
                    </div>

                    {!isDelivered && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid #f9fbfb', paddingTop: '10px' }}>
                        <button 
                          onClick={() => deliverBooking(item.id)}
                          disabled={deliveringId === item.id}
                          className="primary" 
                          style={{ padding: '6px 14px', fontSize: '12px', height: '32px' }}
                        >
                          {deliveringId === item.id ? 'Processing...' : 'Deliver & Deduct Stock'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Create Booking Form */}
        <div style={{ background: 'white', border: '1px solid var(--line-primary)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '15px', color: '#194e47', display: 'flex', alignItems: 'center' }}>
            <SVG.Calendar /> Log Advance Booking
          </h3>

          <div className="dna-card-desc" style={{ marginBottom: '15px', fontSize: '11px', lineHeight: 1.4 }}>
            <SVG.Info />
            <div>
              <b>Pre-orders Allocation</b><br />
              Creates a reservation log. When dispatched, inventory stock levels decrement and outstanding payment amounts auto-sync to Khata Ledger.
            </div>
          </div>

          <form onSubmit={handleBookingSubmit}>
            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px', position: 'relative', zIndex: 10 }}>
              
              {/* Customer Custom Select */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#556c67', marginBottom: '4px' }}>Select Customer</label>
                <div 
                  onClick={() => { setProductIdOpen(false); setCustomerOpen(!customerOpen); }}
                  style={{ 
                    width: '100%', 
                    height: '38px', 
                    border: '1px solid var(--line-primary)', 
                    borderRadius: '6px', 
                    fontSize: '13px', 
                    padding: '0 12px', 
                    background: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: 'var(--ink-primary)'
                  }}
                >
                  <span>{customer}</span>
                  <span style={{ fontSize: '9px', color: 'var(--ink-secondary)' }}>▼</span>
                </div>
                {customerOpen && (
                  <div 
                    style={{ 
                      position: 'absolute', 
                      top: '42px', 
                      left: 0, 
                      right: 0, 
                      background: 'white', 
                      border: '1px solid var(--line-primary)', 
                      borderRadius: '6px', 
                      boxShadow: 'var(--shadow-md)', 
                      zIndex: 20
                    }}
                  >
                    {[
                      { val: 'Rahul', label: 'Rahul (Standard)' },
                      { val: 'Mahaveer Stores', label: 'Mahaveer Stores (Wholesale)' },
                      { val: 'Sunil Traders', label: 'Sunil Traders (Credit account)' },
                      { val: 'Walk-in Customer', label: 'Walk-in Customer' }
                    ].map(opt => (
                      <div 
                        key={opt.val}
                        onClick={() => {
                          setCustomer(opt.val);
                          setCustomerOpen(false);
                        }}
                        style={{ 
                          padding: '10px 12px', 
                          cursor: 'pointer', 
                          fontSize: '12.5px',
                          background: opt.val === customer ? 'var(--brand-light)' : 'transparent',
                          color: opt.val === customer ? 'var(--brand-primary)' : 'var(--ink-primary)',
                          fontWeight: opt.val === customer ? 700 : 500
                        }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Custom Select */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#556c67', marginBottom: '4px' }}>Select Product</label>
                <div 
                  onClick={() => { setCustomerOpen(false); setProductIdOpen(!productIdOpen); }}
                  style={{ 
                    width: '100%', 
                    height: '38px', 
                    border: '1px solid var(--line-primary)', 
                    borderRadius: '6px', 
                    fontSize: '13px', 
                    padding: '0 12px', 
                    background: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: 'var(--ink-primary)'
                  }}
                >
                  <span>{selectedProductObj ? `${selectedProductObj.name} (₹${selectedProductObj.price}/${selectedProductObj.unit})` : 'Select SKU'}</span>
                  <span style={{ fontSize: '9px', color: 'var(--ink-secondary)' }}>▼</span>
                </div>
                {productIdOpen && (
                  <div 
                    style={{ 
                      position: 'absolute', 
                      top: '42px', 
                      left: 0, 
                      right: 0, 
                      background: 'white', 
                      border: '1px solid var(--line-primary)', 
                      borderRadius: '6px', 
                      boxShadow: 'var(--shadow-md)', 
                      zIndex: 20
                    }}
                  >
                    {inventory.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          setProductId(p.id);
                          setProductIdOpen(false);
                        }}
                        style={{ 
                          padding: '10px 12px', 
                          cursor: 'pointer', 
                          fontSize: '12.5px',
                          background: p.id === productId ? 'var(--brand-light)' : 'transparent',
                          color: p.id === productId ? 'var(--brand-primary)' : 'var(--ink-primary)',
                          fontWeight: p.id === productId ? 700 : 500
                        }}
                      >
                        {p.name} (₹{p.price}/{p.unit})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dna-field">
                <label style={{ fontSize: '11.5px' }}>Quantity to Book</label>
                <div className="quantity" style={{ marginBottom: 0 }}>
                  <button type="button" onClick={() => setQuantity(q => Math.max(10, q - 10))}>−</button>
                  <b style={{ fontSize: '13px' }}>{quantity} {selectedProductObj?.unit}</b>
                  <button type="button" onClick={() => setQuantity(q => q + 10)}>+</button>
                </div>
              </div>

              <div className="dna-field">
                <label style={{ fontSize: '11.5px' }}>Target Delivery Date</label>
                <input 
                  type="text" 
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  style={{ width: '100%', height: '38px', border: '1px solid var(--line-primary)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }}
                />
              </div>

              <div className="dna-field">
                <label style={{ fontSize: '11.5px' }}>Advance Payment Paid (₹)</label>
                <input 
                  type="number" 
                  value={advance}
                  onChange={(e) => setAdvance(parseInt(e.target.value) || 0)}
                  style={{ width: '100%', height: '38px', border: '1px solid var(--line-primary)', borderRadius: '6px', padding: '0 12px', fontSize: '13px' }}
                />
              </div>

            </div>

            <div style={{ background: '#f7fbf9', border: '1px solid #e2ece8', borderRadius: '8px', padding: '12px', fontSize: '12.5px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span>Total Est. Order Value:</span>
              <b style={{ color: '#194e47' }}>₹{totalEstimation.toLocaleString('en-IN')}</b>
            </div>

            <button 
              type="button" 
              onClick={handleCheckAi} 
              disabled={checkingAi}
              style={{ 
                width: '100%', 
                height: '38px', 
                border: '1px solid #1e6c5c', 
                background: 'transparent', 
                color: '#1e6c5c', 
                borderRadius: '6px', 
                fontSize: '13px', 
                fontWeight: 700, 
                cursor: 'pointer',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'none', stroke: 'currentColor', strokeWidth: '2.5px' }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {checkingAi ? 'AI Analyzing...' : 'Check with AI'}
            </button>

            {aiResult && (
              <div 
                style={{ 
                  background: '#f4faf8', 
                  border: `1px solid ${aiResult.isSafe ? '#a5dccb' : '#f5c6cb'}`, 
                  borderRadius: '8px', 
                  padding: '14px', 
                  marginBottom: '15px', 
                  fontSize: '12px', 
                  lineHeight: 1.5,
                  color: '#12211e'
                }}
              >
                <div style={{ fontWeight: 700, color: aiResult.isSafe ? '#1b5e20' : '#b71c1c', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg viewBox="0 0 24 24" style={{ width: '13px', height: '13px', fill: 'none', stroke: 'currentColor', strokeWidth: '3px' }}>
                    {aiResult.isSafe ? <path d="M20 6L9 17l-5-5" /> : <path d="M18 6L6 18M6 6l12 12" />}
                  </svg>
                  <span>{aiResult.isSafe ? 'AI Inventory Clear' : 'AI Stock Warning'}</span>
                </div>
                <p style={{ margin: '0 0 8px', color: '#1a2e2a' }}>{aiResult.message}</p>
                <p style={{ margin: 0, paddingTop: '8px', borderTop: '1px dashed #cedbd6', color: '#314e48', fontSize: '11.5px' }}>{aiResult.dealerAdvice}</p>
              </div>
            )}

            <button type="submit" className="primary" style={{ width: '100%', height: '38px', fontSize: '13px' }} disabled={saving}>
              {saving ? 'Saving...' : 'Book Order & Allocate'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
