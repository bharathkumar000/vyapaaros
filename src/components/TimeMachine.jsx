import React from 'react';

const SVG = {
  Search: () => (
    <svg viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  ArrowDown: () => (
    <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', strokeWidth: '2.5px' }}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', strokeWidth: '2.5px' }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
};

export default function TimeMachine() {
  const flowSteps = [
    {
      node: "₹5,00,000",
      direction: <SVG.ArrowDown />,
      title: "Initial Cash Outflow",
      desc: "Ramesh asks 'Where did my ₹5 Lakh go?' AI rewinds transactions over the last 14 days."
    },
    {
      node: "Supplier",
      direction: <SVG.ArrowDown />,
      title: "Supplier Payment (₹3,20,000)",
      desc: "Paid to Annapoorna Distributors on July 18th to clear outstanding rice accounts."
    },
    {
      node: "Inventory",
      direction: <SVG.ArrowDown />,
      title: "Stock Purchase (5,500 kg)",
      desc: "Restocked rice inventory (Sona Masoori) and premium sunflower oils ahead of festival season."
    },
    {
      node: "Credit",
      direction: <SVG.ArrowDown />,
      title: "Customer Credit Sales (₹1,40,706)",
      desc: "Outstanding credit invoices issued to 8 local retail accounts. Payment pending."
    },
    {
      node: "GST Ledger",
      direction: <SVG.ArrowDown />,
      title: "GST Liability (₹39,294)",
      desc: "18% GST captured and locked in GST ledger for the monthly filing buffer."
    },
    {
      node: "Balance",
      direction: <SVG.Check />,
      title: "Remaining Cash (₹0)",
      desc: "Fully reconciled. Every single rupee is trace-linked to assets or receivables."
    }
  ];

  return (
    <div className="centered-view">
      <div className="view-title">
        <p className="eyebrow">RECONCILE EVERY SINGLE RUPEE</p>
        <h2>Business Time Machine</h2>
        <p>Trace the historical flows of cash and assets to understand where funds are deployed.</p>
      </div>

      <div className="time-machine-container">
        <div className="time-machine-query">
          <SVG.Search /> Query: "Where did my ₹5 lakh go?"
        </div>

        <div className="time-flow">
          {flowSteps.map((step, idx) => (
            <div key={idx} className="flow-step">
              <div className="flow-node">{step.node}</div>
              <div className="flow-direction">{step.direction}</div>
              <div className="flow-card">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
