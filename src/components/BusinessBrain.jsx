import React, { useState } from 'react';

const SVG = {
  Customer: () => (
    <svg viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Invoice: () => (
    <svg viewBox="0 0 24 24">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
    </svg>
  ),
  Payment: () => (
    <svg viewBox="0 0 24 24">
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  Product: () => (
    <svg viewBox="0 0 24 24">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    </svg>
  ),
  Supplier: () => (
    <svg viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  BrainCore: () => (
    <svg viewBox="0 0 24 24">
      <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.44 2.5 2.5 0 010-3.12 2.5 2.5 0 010-3.12 2.5 2.5 0 010-3.12A2.5 2.5 0 019.5 2zM14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 004.96-.44 2.5 2.5 0 000-3.12 2.5 2.5 0 000-3.12 2.5 2.5 0 000-3.12A2.5 2.5 0 0014.5 2z" />
    </svg>
  )
};

export default function BusinessBrain({ branchState }) {
  const [selectedNode, setSelectedNode] = useState(null);

  if (!branchState) return null;
  const { memory } = branchState;

  const nodes = [
    { key: 'customer', icon: <SVG.Customer />, label: 'Customer', count: '87 active', className: 'customer' },
    { key: 'invoice', icon: <SVG.Invoice />, label: 'Invoices', count: '₹12.6L', className: 'invoice' },
    { key: 'payment', icon: <SVG.Payment />, label: 'UPI & Bank', count: '156 matched', className: 'payment' },
    { key: 'product', icon: <SVG.Product />, label: 'Products', count: '342 SKUs', className: 'product' },
    { key: 'supplier', icon: <SVG.Supplier />, label: 'Suppliers', count: '24 active', className: 'supplier' }
  ];

  return (
    <div className="centered-view">
      <div className="view-title">
        <p className="eyebrow">HOW YOUR BUSINESS CONNECTS</p>
        <h2>Your Business Brain</h2>
        <p>Every invoice, payment, and product becomes a connected decision. Hover or click to read Business Memory.</p>
      </div>

      <div className="graph-card">
        {nodes.map(node => (
          <div 
            key={node.key}
            className={`graph-label ${node.className} ${selectedNode === node.key ? 'active-node' : ''}`}
            onClick={() => setSelectedNode(node.key)}
          >
            {node.icon}
            <div>
              {node.label}
              <b>{node.count}</b>
            </div>
          </div>
        ))}

        <svg viewBox="0 0 850 300" preserveAspectRatio="none">
          {/* Customer <-> Invoice */}
          <path 
            className={(selectedNode === 'customer' || selectedNode === 'invoice') ? 'active-path' : ''} 
            d="M120 150 Q180 90 260 60" 
          />
          {/* Invoice <-> Brain Core */}
          <path 
            className={(selectedNode === 'invoice') ? 'active-path' : ''} 
            d="M260 60 Q340 100 425 150" 
          />
          {/* Brain Core <-> Payment */}
          <path 
            className={(selectedNode === 'payment') ? 'active-path' : ''} 
            d="M425 150 Q510 100 600 65" 
          />
          {/* Payment <-> Product */}
          <path 
            className={(selectedNode === 'payment' || selectedNode === 'product') ? 'active-path' : ''} 
            d="M600 65 Q670 90 730 155" 
          />
          {/* Product <-> Supplier */}
          <path 
            className={(selectedNode === 'product' || selectedNode === 'supplier') ? 'active-path' : ''} 
            d="M730 155 Q500 270 200 245" 
          />
          {/* Supplier <-> Customer */}
          <path 
            className={(selectedNode === 'supplier' || selectedNode === 'customer') ? 'active-path' : ''} 
            d="M200 245 Q150 200 120 150" 
          />
          {/* Supplier <-> Invoice */}
          <path 
            className={(selectedNode === 'supplier' || selectedNode === 'invoice') ? 'active-path' : ''} 
            d="M200 245 Q230 150 260 60" 
          />
        </svg>

        <div className="brain-core" onClick={() => setSelectedNode(null)}>
          <SVG.BrainCore />
          <span>Business<br />Brain</span>
        </div>
      </div>

      {/* Slide-out Business Memory Details */}
      {selectedNode && memory[selectedNode] && (
        <div className="memory-drawer">
          <h3>
            <SVG.BrainCore /> {memory[selectedNode].title}
          </h3>
          <ul>
            {memory[selectedNode].details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
