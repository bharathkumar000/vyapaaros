import React from 'react';

export default function TimeMachine() {
  const flowSteps = [
    {
      node: "₹5,00,000",
      direction: "↓",
      title: "Initial Cash Outflow",
      desc: "Ramesh asks 'Where did my ₹5 Lakh go?' AI rewinds transactions over the last 14 days."
    },
    {
      node: "Supplier",
      direction: "↓",
      title: "Supplier Payment (₹3,20,000)",
      desc: "Paid to Annapoorna Distributors on July 18th to clear outstanding rice accounts."
    },
    {
      node: "Inventory",
      direction: "↓",
      title: "Stock Purchase (5,500 kg)",
      desc: "Restocked rice inventory (Sona Masoori) and premium sunflower oils ahead of festival season."
    },
    {
      node: "Customer Credit",
      direction: "↓",
      title: "Customer Credit Sales (₹1,40,706)",
      desc: "Outstanding credit invoices issued to 8 local retail accounts. Payment pending."
    },
    {
      node: "GST Ledger",
      direction: "↓",
      title: "GST Liability (₹39,294)",
      desc: "18% GST captured and locked in GST ledger for the monthly filing buffer."
    },
    {
      node: "Balance",
      direction: "✓",
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
          🔍 Query: "Where did my ₹5 lakh go?"
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
