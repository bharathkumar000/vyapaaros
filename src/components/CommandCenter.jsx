import React, { useMemo, useState } from 'react';

const SVG = {
  Rupee: () => (
    <svg viewBox="0 0 24 24">
      <path d="M6 3h12M6 8h12M6 13h8.5c2.5 0 4.5-2 4.5-4.5S17 4 14.5 4H6M6 13l9 9M9 3v10" />
    </svg>
  ),
  Box: () => (
    <svg viewBox="0 0 24 24">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 11l2 2 4-4" />
    </svg>
  ),
  Trending: () => (
    <svg viewBox="0 0 24 24">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Package: () => (
    <svg viewBox="0 0 24 24">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Truck: () => (
    <svg viewBox="0 0 24 24">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
};

export default function CommandCenter({ branchState, onAsk }) {
  const [expanded, setExpanded] = useState(false);

  const agents = useMemo(() => {
    if (!branchState) return [];

    const { metrics, cashFlow, actions, audits, inventory, receivables, payables, bookings } = branchState;

    const unresolvedAudits = (audits || []).filter(a => !a.resolved);
    const overdueRecs = (receivables || []).filter(r => r.status === 'overdue');
    const lowStockItems = (inventory || []).filter(p => p.stock < p.safetyLimit);
    const activeBookings = (bookings || []).filter(b => b.status !== 'delivered');
    const deliveredBookings = (bookings || []).filter(b => b.status === 'delivered');

    return [
      {
        id: 'cfo',
        icon: <SVG.Rupee />,
        name: 'AI CFO',
        job: 'Cash flow & margins',
        tone: 'mint',
        explain: () => {
          const totalPayables = (payables || []).filter(p => p.status !== 'paid').reduce((s, p) => s + p.amount, 0);
          return {
            title: `AI CFO: Cash Position Analysis`,
            body: `Cash in Bank: ₹${(metrics.cashInBank || 0).toLocaleString('en-IN')}. Monthly inflow ₹${(cashFlow?.inflow || 0).toLocaleString('en-IN')}, outflow ₹${(cashFlow?.outflow || 0).toLocaleString('en-IN')}, net ₹${(cashFlow?.net || 0).toLocaleString('en-IN')}. ${totalPayables > 0 ? `Upcoming supplier payments total ₹${totalPayables.toLocaleString('en-IN')}. ` : ''}Sales this month: ₹${(metrics.salesThisMonth || 0).toLocaleString('en-IN')} (${metrics.salesChange || '0%'}). Margin pressure from rising purchase costs. Recommend delaying non-urgent payables by 3-5 days to preserve buffer.`
          };
        }
      },
      {
        id: 'proc',
        icon: <SVG.Box />,
        name: 'AI Procurement',
        job: 'Stock & suppliers',
        tone: 'amber',
        explain: () => {
          const needsRestock = lowStockItems.map(p =>
            `${p.name}: ${p.stock} ${p.unit} remaining (limit ${p.safetyLimit} ${p.unit})`
          ).join('. ');
          const topSupplier = (payables || [])[0];
          return {
            title: `AI Procurement: Restock Recommendations`,
            body: lowStockItems.length > 0
              ? `Low stock alerts: ${needsRestock}. ${topSupplier ? `Primary supplier ${topSupplier.name} has ₹${topSupplier.amount.toLocaleString('en-IN')} due by ${topSupplier.dueDate}. ` : ''}Total inventory value: ₹${(metrics.inventoryValue || 0).toLocaleString('en-IN')}. Restock highest-margin items first to maximise working capital efficiency.`
              : `All ${inventory?.length || 0} products are above safety limits. Total inventory value ₹${(metrics.inventoryValue || 0).toLocaleString('en-IN')}. No urgent procurement needed this week.`
          };
        }
      },
      {
        id: 'audit',
        icon: <SVG.Shield />,
        name: 'AI Auditor',
        job: 'Risk & compliance',
        tone: 'rose',
        explain: () => {
          const auditDetails = unresolvedAudits.map(a =>
            `[${a.severity.toUpperCase()}] ${a.title}: ${a.desc}`
          ).join('. ');
          return {
            title: `AI Auditor: Risk Assessment`,
            body: unresolvedAudits.length > 0
              ? `${unresolvedAudits.length} unresolved audit ${unresolvedAudits.length === 1 ? 'item' : 'items'}: ${auditDetails}. Resolving these will improve your business health score and prevent financial leakage.`
              : `All ${audits?.length || 0} audit checks passed. No duplicate payments, missing entries, or anomalies detected. Business processes are running clean.`
          };
        }
      },
      {
        id: 'sales',
        icon: <SVG.Trending />,
        name: 'AI Sales',
        job: 'Revenue & growth',
        tone: 'mint',
        explain: () => {
          const topProduct = (inventory || []).sort((a, b) => (b.price - b.cost) * b.stock - (a.price - a.cost) * a.stock)[0];
          return {
            title: `AI Sales: Revenue Overview`,
            body: `Monthly sales ₹${(metrics.salesThisMonth || 0).toLocaleString('en-IN')} (${metrics.salesChange || '0%'}). ${topProduct ? `Top-value product: ${topProduct.name} at ₹${topProduct.price}/${topProduct.unit} (margin: ${Math.round((topProduct.price - topProduct.cost) / topProduct.price * 100)}%). ` : ''}Cash sales + credit sales combined. Festival season approaching — consider bundled offers on high-margin items to boost revenue.`
          };
        }
      },
      {
        id: 'collections',
        icon: <SVG.Users />,
        name: 'AI Collections',
        job: 'Receivables recovery',
        tone: 'amber',
        explain: () => {
          const recDetails = receivables?.filter(r => r.status !== 'paid').map(r =>
            `${r.name}: ₹${r.amount.toLocaleString('en-IN')} (${r.status}, due ${r.dueDate})`
          ).join('. ') || 'None';
          return {
            title: `AI Collections: Recovery Status`,
            body: `Total outstanding: ₹${(metrics.customersOwe || 0).toLocaleString('en-IN')}. ${recDetails}. ${overdueRecs.length > 0 ? `Top overdue: ${overdueRecs[0].name} at ₹${overdueRecs[0].amount.toLocaleString('en-IN')} (${overdueRecs[0].dueDate}). Send reminders and offer 2% early-payment discount to accelerate collections.` : 'All receivables are current. No urgent collection actions needed.'}`
          };
        }
      },
      {
        id: 'inventory',
        icon: <SVG.Package />,
        name: 'AI Inventory Analyst',
        job: 'Stock health & coverage',
        tone: 'mint',
        explain: () => {
          const totalStock = inventory?.reduce((s, p) => s + p.stock, 0) || 0;
          const totalValue = metrics.inventoryValue || 0;
          return {
            title: `AI Inventory Analyst: Stock Health`,
            body: `Tracking ${inventory?.length || 0} products totalling ${totalStock} units valued at ₹${totalValue.toLocaleString('en-IN')}. ${lowStockItems.length > 0 ? `${lowStockItems.length} product${lowStockItems.length > 1 ? 's' : ''} below safety limit: ${lowStockItems.map(p => `${p.name} (${p.stock}/${p.safetyLimit} ${p.unit})`).join(', ')}. ` : 'All products above safety thresholds. '}Average inventory coverage is healthy. Review slow-moving items for potential discounting to free up working capital.`
          };
        }
      },
      {
        id: 'compliance',
        icon: <SVG.FileText />,
        name: 'AI Compliance',
        job: 'GST & tax filing',
        tone: 'rose',
        explain: () => {
          const gstAudits = unresolvedAudits.filter(a => a.title.toLowerCase().includes('gst') || a.title.toLowerCase().includes('tax'));
          const gstLiability = Math.round(metrics.salesThisMonth * 0.18);
          return {
            title: `AI Compliance: GST Readiness`,
            body: gstAudits.length > 0
              ? `Compliance flags: ${gstAudits.map(a => a.desc).join('. ')}. Estimated GST liability this month: ₹${gstLiability.toLocaleString('en-IN')}. Resolve missing classifications before filing deadline to avoid penalties.`
              : `All GST records are clean. Estimated liability this month: ₹${gstLiability.toLocaleString('en-IN')}. No missing entries or classification errors. Set aside funds before the 20th for smooth filing.`
          };
        }
      },
      {
        id: 'operations',
        icon: <SVG.Truck />,
        name: 'AI Operations',
        job: 'Bookings & delivery',
        tone: 'amber',
        explain: () => {
          const bkDetails = activeBookings.map(b =>
            `${b.name}: ${b.quantity} ${b.unit} ${b.productName} (${b.status})`
          ).join('. ');
          return {
            title: `AI Operations: Fulfillment Status`,
            body: activeBookings.length > 0
              ? `Active orders: ${bkDetails}. ${deliveredBookings.length > 0 ? `${deliveredBookings.length} order${deliveredBookings.length > 1 ? 's' : ''} completed today. ` : ''}Ensure delivery timelines are met to maintain customer satisfaction and cash flow consistency.`
              : `No active bookings. ${deliveredBookings.length > 0 ? `${deliveredBookings.length} order${deliveredBookings.length > 1 ? 's' : ''} delivered today. ` : ''}Operations are running smoothly with no pending fulfillment.`
          };
        }
      }
    ];
  }, [branchState]);

  const score = useMemo(() => {
    if (!branchState) return 82;
    const { metrics, actions, audits } = branchState;
    let s = 91;

    const unresolvedAudits = (audits || []).filter(a => !a.resolved).length;
    s -= unresolvedAudits * 4;

    s -= (actions || []).length * 2;

    const overdueRecs = (branchState.receivables || []).filter(r => r.status === 'overdue').length;
    s -= overdueRecs * 3;

    const lowStockCount = (branchState.inventory || []).filter(p => p.stock < p.safetyLimit).length;
    if (lowStockCount > 0) s -= 3;

    if ((metrics.cashInBank || 0) < 100000) s -= 5;

    return Math.max(10, Math.min(100, s));
  }, [branchState]);

  const explain = (agent) => {
    const result = agent.explain();
    onAsk({ title: result.title, body: result.body });
  };

  return (
    <section className="command-center" aria-label="AI employee command center">
      <div className="health-card">
        <div className="health-ring" style={{ '--score': `${score * 3.6}deg` }}>
          <b>{score}</b>
          <span>/100</span>
        </div>
        <div>
          <p className="eyebrow">BUSINESS HEALTH</p>
          <h3>{score >= 85 ? 'Healthy' : score >= 60 ? 'Needs attention' : 'At risk'}, with {branchState ? branchState.actions.length : 0} priorities</h3>
          <p>
            {score >= 85 ? 'Cash is stable. All key metrics on track.' :
             score >= 60 ? 'Resolve audit flags and overdue accounts to improve.' :
             'Immediate action needed on cash flow and compliance.'}
          </p>
        </div>
      </div>
      
      <div className="employees">
        <div className="employee-head">
          <div>
            <p className="eyebrow">YOUR AI EMPLOYEES</p>
            <h3>Working in the background</h3>
          </div>
          <button onClick={() => setExpanded((value) => !value)}>
            {expanded ? 'Collapse Work' : 'View Work'} <SVG.ArrowRight />
          </button>
        </div>
        <div className={`employee-list ${expanded ? 'expanded' : ''}`}>
          {agents.map((agent) => (
            <button className="employee" key={agent.id} onClick={() => explain(agent)}>
              <span className={`employee-icon ${agent.tone}`}>{agent.icon}</span>
              <span>
                <b>{agent.name}</b>
                <small>{agent.job}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
