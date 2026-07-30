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
    inventory: overrides.inventory || [
      { id: "p-1", name: "Sona Masoori Rice", sector: "Agriculture & Grains", origin: "Karnataka", hsn: "1006", stock: 420, unit: "kg", price: 60, cost: 52, safetyLimit: 300, gst: "5%" },
      { id: "p-2", name: "Gir Cow A2 Desi Ghee", sector: "Dairy & Cattle", origin: "Gujarat", hsn: "0405", stock: 45, unit: "liters", price: 850, cost: 720, safetyLimit: 15, gst: "12%" },
      { id: "p-3", name: "Kashmiri Mongra Saffron", sector: "Spices & Spices Board", origin: "Jammu & Kashmir", hsn: "0910", stock: 120, unit: "grams", price: 450, cost: 380, safetyLimit: 30, gst: "5%" },
      { id: "p-4", name: "Assam CTC Orthodox Tea", sector: "Plantation & Beverages", origin: "Assam", hsn: "0902", stock: 250, unit: "kg", price: 340, cost: 280, safetyLimit: 50, gst: "5%" },
      { id: "p-5", name: "Kanjeevaram Handloom Silk Saree", sector: "Textiles & Handloom", origin: "Tamil Nadu", hsn: "5007", stock: 28, unit: "pcs", price: 4800, cost: 3900, safetyLimit: 10, gst: "5%" },
      { id: "p-6", name: "Moradabad Brass Pooja Lamp", sector: "Metalware & Handicrafts", origin: "Uttar Pradesh", hsn: "8306", stock: 65, unit: "sets", price: 380, cost: 290, safetyLimit: 15, gst: "18%" },
      { id: "p-7", name: "Ayurvedic Neem & Tulsi Soap", sector: "Ayurveda & Wellness", origin: "Kerala", hsn: "3401", stock: 500, unit: "bars", price: 45, cost: 32, safetyLimit: 100, gst: "18%" },
      { id: "p-8", name: "Kachi Ghani Mustard Oil", sector: "Edible Oils & Processing", origin: "Rajasthan", hsn: "1514", stock: 320, unit: "liters", price: 195, cost: 160, safetyLimit: 80, gst: "5%" },
      { id: "p-9", name: "Jaipur Blue Pottery Craft Vase", sector: "Cottage & Artisan Goods", origin: "Rajasthan", hsn: "6913", stock: 40, unit: "units", price: 650, cost: 480, safetyLimit: 10, gst: "12%" },
      { id: "p-10", name: "Tamra Pure Copper Water Bottle", sector: "Household & Hardware", origin: "Maharashtra", hsn: "7418", stock: 85, unit: "units", price: 580, cost: 450, safetyLimit: 20, gst: "18%" }
    ],
    bills: overrides.bills || [
      { id: 'INV-2481', date: '30 Jul 2026', customer: 'Mahaveer Stores', paymentMode: 'UPI', total: 47800, status: 'Paid', gst: 7292, items: [{ name: 'Sona Masoori Rice', quantity: 600, unit: 'kg' }] },
      { id: 'INV-2480', date: '29 Jul 2026', customer: 'Rahul', paymentMode: 'Credit', total: 12640, status: 'Due', gst: 1928, items: [{ name: 'Premium Ghee', quantity: 16, unit: 'liters' }] }
    ],
    receivables: overrides.receivables || [
      { id: "rec-1", name: "Mahaveer Stores", amount: 47800, dueDate: "15 Jul 2026", phone: "+91 98450 12345", status: "overdue" },
      { id: "rec-2", name: "Sunil Traders", amount: 84200, dueDate: "20 Jul 2026", phone: "+91 99001 88776", status: "overdue" },
      { id: "rec-3", name: "Ramesh G.", amount: 35000, dueDate: "05 Aug 2026", phone: "+91 98455 22334", status: "pending" },
      { id: "rec-4", name: "Rahul (Standard Retail)", amount: 51300, dueDate: "12 Aug 2026", phone: "+91 91234 56789", status: "pending" }
    ],
    payables: overrides.payables || [
      { id: "pay-1", name: "Annapoorna Distributors", amount: 112000, dueDate: "05 Aug 2026", type: "Rice Supplier" },
      { id: "pay-2", name: "Sri Ghee Packers", amount: 85000, dueDate: "08 Aug 2026", type: "Ghee Supplier" },
      { id: "pay-3", name: "Golden Sugar Mill", amount: 48000, dueDate: "15 Aug 2026", type: "Sugar Supplier" }
    ],
    bookings: overrides.bookings || [
      { id: "bk-1", name: "Mahaveer Stores", productId: "p-1", productName: "Sona Masoori Rice", quantity: 150, unit: "kg", date: "30 Jul 2026", deliveryDate: "05 Aug 2026", advance: 2000, status: "pending" },
      { id: "bk-2", name: "Sunil Traders", productId: "p-2", productName: "Premium Ghee", quantity: 10, unit: "liters", date: "29 Jul 2026", deliveryDate: "02 Aug 2026", advance: 3000, status: "ready" }
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
