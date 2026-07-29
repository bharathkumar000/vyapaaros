import React, { useState } from 'react';

export default function BusinessBrain({ branchState }) {
  const [selectedNode, setSelectedNode] = useState(null);

  if (!branchState) return null;
  const { memory } = branchState;

  const nodes = [
    { key: 'customer', label: 'Customer', count: '87 active', className: 'customer' },
    { key: 'invoice', label: 'Invoices', count: '₹12.6L outstanding', className: 'invoice' },
    { key: 'payment', label: 'UPI & Bank', count: '156 matched', className: 'payment' },
    { key: 'product', label: 'Products', count: '342 SKUs', className: 'product' },
    { key: 'supplier', label: 'Suppliers', count: '24 active', className: 'supplier' }
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
            {node.label}
            <b>{node.count}</b>
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
          ✦
          <span>Business<br />Brain</span>
        </div>
      </div>

      {/* Slide-out Business Memory Details */}
      {selectedNode && memory[selectedNode] && (
        <div className="memory-drawer">
          <h3>
            <span>🧠</span> {memory[selectedNode].title}
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
