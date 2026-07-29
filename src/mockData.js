// Mock data for VyapaarOS branches
export const createDefaultBranch = (id, name, overrides = {}) => {
  const dna = {
    pricingMarkup: overrides.pricingMarkup || 15,
    safetyStockDays: overrides.safetyStockDays || 8,
    supplierDelayDays: overrides.supplierDelayDays || 5,
    alertSensitivity: overrides.alertSensitivity || "high"
  };

  return {
    id,
    name,
    dna,
    metrics: {
      cashInBank: overrides.cashInBank || 482450,
      salesThisMonth: overrides.salesThisMonth || 1264800,
      customersOwe: overrides.customersOwe || 218300,
      inventoryValue: overrides.inventoryValue || 845600,
      cashInChange: "+12.4%",
      salesChange: "+8.1%",
      oweChange: "8 invoices overdue",
      inventoryChange: "42 days of stock"
    },
    cashFlow: {
      inflow: overrides.inflow || 1680000,
      outflow: overrides.outflow || 1120000,
      net: overrides.net || 560000,
      chartData: [142, 101, 83, 65, 56, 51, 35, 48, 21, 8] // SVG chart paths
    },
    actions: [
      {
        id: "action-1",
        type: "overdue",
        title: "Follow up on ₹84,200",
        desc: "3 customers are overdue by 15+ days",
        severity: "high"
      },
      {
        id: "action-2",
        type: "stock",
        title: "Restock Sona Masoori Rice",
        desc: `Only ${dna.safetyStockDays - 2} days of stock remaining (below safety limit of ${dna.safetyStockDays} days)`,
        severity: "med"
      },
      {
        id: "action-3",
        type: "audit",
        title: "Review unusual payment",
        desc: "₹28,500 paid twice to one vendor",
        severity: "high"
      }
    ],
    audits: [
      {
        id: "audit-1",
        severity: "high",
        title: "Possible duplicate supplier payment",
        desc: "₹28,500 was paid to Annapoorna Distributors twice, 11 minutes apart.",
        resolved: false
      },
      {
        id: "audit-2",
        severity: "med",
        title: "Missing GST entry",
        desc: "Invoice #SLT-2481 has no GST classification attached.",
        resolved: false
      },
      {
        id: "audit-3",
        severity: "low",
        title: "Unusual refund volume",
        desc: "Refunds are 18% higher than your normal weekly pattern.",
        resolved: false
      }
    ],
    // Business Memory and Graph Info
    memory: {
      customer: {
        title: "Customer Memory: Rahul",
        details: [
          "Rahul purchases Sona Masoori Rice and Sunflower Oil every month.",
          "Prefers premium products; responds well to early-bird festival discounts.",
          "Negotiates discounts often; delayed payment twice (average 9 days late).",
          "Spikes purchase volumes around Diwali and Pongal festivals."
        ]
      },
      invoice: {
        title: "Invoice Memory: GST Outstandings",
        details: [
          "Total unpaid invoices: 12 invoices totaling ₹2,18,300.",
          "GST liability on these invoices is ₹39,294 (18% slab).",
          "Automated reminders sent to 4 clients yesterday. 1 payment pending review."
        ]
      },
      payment: {
        title: "UPI & Bank Settlement Logs",
        details: [
          "156 UPI transactions successfully reconciled this week.",
          "Average settlement time: 2.1 hours from bank gateway.",
          "Anomaly detected: double transaction (₹28,500) at 10:14 AM and 10:25 AM."
        ]
      },
      product: {
        title: "Product Profitability: Sona Masoori Rice",
        details: [
          "Top selling SKU by volume. Monthly margin: 12.8%.",
          "Purchase price increased by 8% from supplier (Annapoorna).",
          "Recommendation: raise retail price by ₹3/kg to maintain margin, or switch to supplier B."
        ]
      },
      supplier: {
        title: "Supplier Performance: Annapoorna Distributors",
        details: [
          "Primary supplier for rice and grains. Total purchases this month: ₹4,20,000.",
          "Lead time: 5 days average. Delivery accuracy: 98%.",
          "Payment terms: Net 15. Standard price markup is 1.1x cost."
        ]
      }
    }
  };
};

export const initialBranchesData = {
  "branch-1": createDefaultBranch("branch-1", "Sri Lakshmi Traders (Main)")
};
