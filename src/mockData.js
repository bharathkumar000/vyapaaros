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
        title: "Restock India Gate Rice",
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
      { id: "p-1", name: "India Gate Sona Masoori Rice (5 kg)", sector: "Staples & Grains", origin: "Karnataka", hsn: "1006", stock: 420, unit: "kg", price: 75, cost: 62, safetyLimit: 300, gst: "5%" },
      { id: "p-2", name: "Fortune Sunflower Oil (1 L)", sector: "Edible Oils", origin: "Maharashtra", hsn: "1512", stock: 180, unit: "L", price: 150, cost: 135, safetyLimit: 80, gst: "5%" },
      { id: "p-3", name: "Aashirvaad Sharbati Atta (5 kg)", sector: "Staples & Grains", origin: "Madhya Pradesh", hsn: "1101", stock: 520, unit: "kg", price: 56, cost: 48, safetyLimit: 300, gst: "5%" },
      { id: "p-4", name: "Tata Sampann Toor Dal (1 kg)", sector: "Staples & Grains", origin: "Maharashtra", hsn: "0713", stock: 60, unit: "kg", price: 185, cost: 163, safetyLimit: 80, gst: "5%" },
      { id: "p-5", name: "Madhur Refined Sugar (1 kg)", sector: "Staples & Grains", origin: "Uttar Pradesh", hsn: "1701", stock: 340, unit: "kg", price: 47, cost: 41, safetyLimit: 150, gst: "5%" },
      { id: "p-6", name: "Tata Salt (1 kg)", sector: "Staples & Grains", origin: "Gujarat", hsn: "2501", stock: 620, unit: "pcs", price: 30, cost: 25, safetyLimit: 200, gst: "5%" },
      { id: "p-7", name: "Fresh Onion (loose)", sector: "Fruits & Vegetables", origin: "Maharashtra", hsn: "0703", stock: 150, unit: "kg", price: 45, cost: 38, safetyLimit: 50, gst: "5%" },
      { id: "p-8", name: "Fresh Potato (loose)", sector: "Fruits & Vegetables", origin: "Uttar Pradesh", hsn: "0701", stock: 210, unit: "kg", price: 32, cost: 27, safetyLimit: 60, gst: "5%" },
      { id: "p-9", name: "Fresh Tomato (loose)", sector: "Fruits & Vegetables", origin: "Karnataka", hsn: "0702", stock: 30, unit: "kg", price: 42, cost: 35, safetyLimit: 40, gst: "5%" },
      { id: "p-10", name: "Banana (Robusta, dozen)", sector: "Fruits & Vegetables", origin: "Tamil Nadu", hsn: "0803", stock: 140, unit: "dozen", price: 48, cost: 40, safetyLimit: 40, gst: "5%" },
      { id: "p-11", name: "Amul Taaza Milk (1 L)", sector: "Dairy & Beverages", origin: "Gujarat", hsn: "0401", stock: 130, unit: "L", price: 66, cost: 59, safetyLimit: 40, gst: "5%" },
      { id: "p-12", name: "Amul Masti Curd (400 g)", sector: "Dairy & Beverages", origin: "Gujarat", hsn: "0403", stock: 85, unit: "pcs", price: 55, cost: 48, safetyLimit: 30, gst: "5%" },
      { id: "p-13", name: "Amul Butter (500 g)", sector: "Dairy & Beverages", origin: "Gujarat", hsn: "0405", stock: 12, unit: "pcs", price: 285, cost: 258, safetyLimit: 15, gst: "12%" },
      { id: "p-14", name: "Everest Red Chilli Powder (100 g)", sector: "Spices & Masala", origin: "Andhra Pradesh", hsn: "0904", stock: 320, unit: "pcs", price: 58, cost: 49, safetyLimit: 100, gst: "5%" },
      { id: "p-15", name: "Everest Turmeric Powder (100 g)", sector: "Spices & Masala", origin: "Tamil Nadu", hsn: "0910", stock: 260, unit: "pcs", price: 48, cost: 40, safetyLimit: 90, gst: "5%" },
      { id: "p-16", name: "Maggi Masala Noodles (12-pack)", sector: "Snacks & Instant", origin: "Delhi", hsn: "1902", stock: 50, unit: "pcs", price: 168, cost: 144, safetyLimit: 80, gst: "18%" },
      { id: "p-17", name: "Parle-G Gold Biscuits (10-pack)", sector: "Snacks & Instant", origin: "West Bengal", hsn: "1905", stock: 800, unit: "pcs", price: 30, cost: 25, safetyLimit: 300, gst: "18%" },
      { id: "p-18", name: "Surf Excel Matic Detergent (1 kg)", sector: "Household & Personal Care", origin: "Maharashtra", hsn: "3402", stock: 140, unit: "pcs", price: 175, cost: 158, safetyLimit: 50, gst: "18%" },
      { id: "p-19", name: "Lifebuoy Bath Soap (155 g)", sector: "Household & Personal Care", origin: "Maharashtra", hsn: "3401", stock: 520, unit: "pcs", price: 38, cost: 32, safetyLimit: 150, gst: "18%" },
      { id: "p-20", name: "Tata Tea Gold (250 g)", sector: "Beverages", origin: "Assam", hsn: "0902", stock: 200, unit: "pcs", price: 115, cost: 98, safetyLimit: 70, gst: "5%" },
      { id: "p-21", name: "Nescafé Classic (100 g)", sector: "Beverages", origin: "Karnataka", hsn: "0901", stock: 45, unit: "pcs", price: 265, cost: 232, safetyLimit: 60, gst: "18%" },
      { id: "p-22", name: "Colgate MaxFresh Toothpaste (200 g)", sector: "Household & Personal Care", origin: "Delhi", hsn: "3306", stock: 180, unit: "pcs", price: 99, cost: 85, safetyLimit: 60, gst: "18%" }
    ],
    bills: overrides.bills || [
      { id: 'INV-2481', date: '30 Jul 2026', customer: 'Mahaveer Stores', paymentMode: 'UPI', total: 47800, status: 'Paid', gst: 7292, items: [{ name: 'India Gate Sona Masoori Rice', quantity: 600, unit: 'kg' }] },
      { id: 'INV-2480', date: '29 Jul 2026', customer: 'Rahul', paymentMode: 'Credit', total: 12640, status: 'Due', gst: 1928, items: [{ name: 'Fortune Sunflower Oil', quantity: 80, unit: 'L' }, { name: 'Aashirvaad Sharbati Atta', quantity: 40, unit: 'kg' }] }
    ],
    receivables: overrides.receivables || [
      { id: "rec-1", name: "Mahaveer Stores", amount: 47800, dueDate: "15 Jul 2026", phone: "+91 98450 12345", status: "overdue" },
      { id: "rec-2", name: "Sunil Traders", amount: 84200, dueDate: "20 Jul 2026", phone: "+91 99001 88776", status: "overdue" },
      { id: "rec-3", name: "Ramesh G.", amount: 35000, dueDate: "05 Aug 2026", phone: "+91 98455 22334", status: "pending" },
      { id: "rec-4", name: "Rahul (Standard Retail)", amount: 51300, dueDate: "12 Aug 2026", phone: "+91 91234 56789", status: "pending" }
    ],
    payables: overrides.payables || [
      { id: "pay-1", name: "Annapoorna Distributors", amount: 112000, dueDate: "05 Aug 2026", type: "Rice & Staples Supplier" },
      { id: "pay-2", name: "Sunrise Edible Oils", amount: 85000, dueDate: "08 Aug 2026", type: "Oil Supplier" },
      { id: "pay-3", name: "Golden Sugar Mill", amount: 48000, dueDate: "15 Aug 2026", type: "Sugar Supplier" }
    ],
    bookings: overrides.bookings || [
      { id: "bk-1", name: "Mahaveer Stores", productId: "p-1", productName: "India Gate Sona Masoori Rice", quantity: 150, unit: "kg", date: "30 Jul 2026", deliveryDate: "05 Aug 2026", advance: 2000, status: "pending" },
      { id: "bk-2", name: "Sunil Traders", productId: "p-2", productName: "Fortune Sunflower Oil", quantity: 30, unit: "L", date: "29 Jul 2026", deliveryDate: "02 Aug 2026", advance: 3000, status: "ready" }
    ],
    orders: overrides.orders || [],
    // Business Memory and Graph Info
    memory: {
      customer: {
        title: "Customer Memory: Rahul",
        details: [
          "Rahul purchases India Gate Sona Masoori Rice and Fortune Sunflower Oil every month.",
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
        title: "Product Profitability: India Gate Rice",
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
  "branch-1": createDefaultBranch("branch-1", "Sri Lakshmi Groceries (Main)")
};
