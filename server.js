import express from 'express';
import cors from 'cors';
import { initialBranchesData, createDefaultBranch } from './src/mockData.js';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory data store for branches
let branches = { ...initialBranchesData };
let branchCounter = 1;

// GET all branches list
app.get('/api/branches', (req, res) => {
  const list = Object.keys(branches).map(id => ({
    id,
    name: branches[id].name
  }));
  res.json(list);
});

// GET state of a specific branch
app.get('/api/state', (req, res) => {
  const { branchId } = req.query;
  const id = branchId || 'branch-1';
  if (!branches[id]) {
    return res.status(404).json({ error: 'Branch not found' });
  }
  res.json(branches[id]);
});

// POST resolve an audit action or general priority action
app.post('/api/action/resolve', (req, res) => {
  const { branchId, actionId } = req.body;
  const bId = branchId || 'branch-1';
  const branch = branches[bId];

  if (!branch) {
    return res.status(404).json({ error: 'Branch not found' });
  }

  // Find action in priorities
  const priorityIndex = branch.actions.findIndex(a => a.id === actionId);
  if (priorityIndex !== -1) {
    const action = branch.actions[priorityIndex];
    branch.actions.splice(priorityIndex, 1);

    // Apply side-effects for demo feedback
    if (action.type === 'audit' || action.title.includes('duplicate')) {
      // Resolving duplicate payment returns ₹28,500 to cash
      branch.metrics.cashInBank += 28500;
      // Resolve the matching audit issue too
      const audit = branch.audits.find(a => a.id === 'audit-1');
      if (audit) audit.resolved = true;
    } else if (action.type === 'stock') {
      // Ordered rice, safety stock replenished, increase inventory value
      branch.metrics.inventoryValue += 29000; // 500kg * 58
      branch.metrics.cashInBank -= 29000;
    }
  }

  // Find action in audits
  const audit = branch.audits.find(a => a.id === actionId);
  if (audit) {
    audit.resolved = true;
    if (audit.id === 'audit-1') {
      // Also resolve matching priority action if not done
      const pIdx = branch.actions.findIndex(a => a.type === 'audit');
      if (pIdx !== -1) {
        branch.actions.splice(pIdx, 1);
      }
      branch.metrics.cashInBank += 28500;
    }
  }

  res.json(branch);
});

// POST simulate stock, price or hiring decisions
app.post('/api/simulate', (req, res) => {
  const { branchId, qty, leadTime, scenario, priceIncrease, salary } = req.body;
  const bId = branchId || 'branch-1';
  const branch = branches[bId];

  if (!branch) {
    return res.status(404).json({ error: 'Branch not found' });
  }

  if (scenario === 'price') {
    const increase = priceIncrease || 5;
    const margins = 16.0;
    const gain = 24500;
    res.json({
      status: 'recommended',
      cost: 0,
      margins,
      stockCoverageDays: 0,
      message: `Proceed: A ${increase}% price increase on grains is projected to yield an extra ${formatCurrency(gain)} net monthly profit. This accounts for a simulated 6% price-elasticity volume drop, but the margin increase offsets it.`
    });
  } else if (scenario === 'hire') {
    const pay = salary || 12000;
    const roi = 2.3;
    const margins = 14.2;
    res.json({
      status: 'recommended',
      cost: pay,
      margins,
      stockCoverageDays: 0,
      message: `Proceed: Hiring a delivery runner at ${formatCurrency(pay)}/month expands local delivery reach, projecting a 15% increase in commercial grain orders (net +₹28,000 revenue, ROI: ${roi}x).`
    });
  } else {
    // Default restock grains scenario
    const quantity = qty || 500;
    const costPerKg = 58;
    const cost = quantity * costPerKg;
    const margins = 12.8;
    const stockCoverageDays = Math.round(quantity / 26); // assuming 26kg daily sale average

    let status = 'recommended';
    let message = `This purchase covers projected demand for ${stockCoverageDays} days and keeps your cash buffer healthy.`;

    if (cost > branch.metrics.cashInBank) {
      status = 'warning';
      message = `Warning: Investment of ₹${cost.toLocaleString('en-IN')} exceeds your current cash balance of ₹${branch.metrics.cashInBank.toLocaleString('en-IN')}. This will cause cash-flow deficits.`;
    } else if (stockCoverageDays > 60) {
      status = 'alert';
      message = `Note: Purchasing ${quantity}kg covers demand for ${stockCoverageDays} days. This exceeds typical inventory rotation guidelines (max 45 days), increasing holding costs.`;
    }

    res.json({
      status,
      cost,
      margins,
      stockCoverageDays,
      message
    });
  }
});

// Simple internal helper for currency formatting on backend responses
function formatCurrency(val) {
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

// POST clone DNA to a new branch
app.post('/api/clone', (req, res) => {
  const { name, pricingMarkup, safetyStockDays, supplierDelayDays, alertSensitivity } = req.body;
  
  branchCounter += 1;
  const newId = `branch-${branchCounter}`;

  // Create customized branch with some variation in initial values
  const newBranch = createDefaultBranch(newId, name, {
    pricingMarkup: parseFloat(pricingMarkup),
    safetyStockDays: parseInt(safetyStockDays),
    supplierDelayDays: parseInt(supplierDelayDays),
    alertSensitivity,
    cashInBank: 250000, // New branch starts with smaller float
    salesThisMonth: 150000,
    customersOwe: 45000,
    inventoryValue: 120000,
    inflow: 300000,
    outflow: 200000,
    net: 100000
  });

  // Customize new branch actions based on DNA rules
  newBranch.actions = [
    {
      id: `action-clone-1`,
      type: "stock",
      title: `Safety stock check: OK`,
      desc: `Safety stock maintained at ${safetyStockDays} days markup limit.`,
      severity: "low"
    }
  ];

  branches[newId] = newBranch;

  res.json({
    success: true,
    branchId: newId,
    branches: Object.keys(branches).map(id => ({ id, name: branches[id].name }))
  });
});

// POST file upload (simulated OCR & links engine)
app.post('/api/upload', (req, res) => {
  const { branchId, fileType } = req.body;
  const bId = branchId || 'branch-1';
  const branch = branches[bId];

  if (!branch) {
    return res.status(404).json({ error: 'Branch not found' });
  }

  let resultMessage = '';
  
  if (fileType === 'whatsapp') {
    // WhatsApp Order Screenshot
    const orderValue = 35000;
    branch.metrics.salesThisMonth += orderValue;
    branch.metrics.customersOwe += orderValue;
    
    // Add AI action
    const newAction = {
      id: `action-upload-${Date.now()}`,
      type: 'overdue',
      title: 'Approve WhatsApp Order: ₹35,000',
      desc: 'Extracted order for 600kg Sona Masoori Rice from Ramesh G.',
      severity: 'high'
    };
    branch.actions.unshift(newAction);
    resultMessage = 'Extracted WhatsApp order: 600kg Sona Masoori Rice from Ramesh G. (₹35,000 value). Linked to Product and Invoice databases.';

  } else if (fileType === 'upi') {
    // UPI Screenshot
    const paymentRecv = 47800;
    branch.metrics.cashInBank += paymentRecv;
    branch.metrics.customersOwe = Math.max(0, branch.metrics.customersOwe - paymentRecv);
    
    // Check if we can resolve the Mahaveer Stores alert
    const pIdx = branch.actions.findIndex(a => a.title.includes('Follow up'));
    if (pIdx !== -1) {
      branch.actions[pIdx].title = 'Follow up on ₹36,400';
      branch.actions[pIdx].desc = 'Outstanding balance decreased. 2 customers remaining.';
    }

    resultMessage = 'Reconciled UPI payment: Received ₹47,800 from Mahaveer Stores. Outstanding balance cleared, Cash in Bank increased.';

  } else if (fileType === 'invoice') {
    // Supplier Invoice PDF
    const invoiceAmount = 88000;
    branch.metrics.inventoryValue += invoiceAmount;
    
    const newAction = {
      id: `action-upload-${Date.now()}`,
      type: 'audit',
      title: 'Approve Supplier Bill: ₹88,000',
      desc: 'Invoice #AP-9081 from Annapoorna Distributors. Due in 15 days.',
      severity: 'med'
    };
    branch.actions.push(newAction);
    resultMessage = 'Processed Supplier Bill: ₹88,000 from Annapoorna. Added to inventory value, payment term tracked (Net 15).';

  } else if (fileType === 'bank') {
    // Bank Statement
    branch.cashFlow.inflow += 120000;
    branch.cashFlow.net += 120000;
    branch.metrics.cashInBank += 120000;

    resultMessage = 'Imported Bank Statement: Matched 24 payments. Reconciliation score: 100%. Cash buffer updated.';

  } else if (fileType === 'excel') {
    // Inventory Excel sheet
    branch.metrics.inventoryValue = 890000;
    
    // Safety check updated
    const stockIdx = branch.actions.findIndex(a => a.type === 'stock');
    if (stockIdx !== -1) {
      branch.actions.splice(stockIdx, 1); // Stock alert solved!
    }

    resultMessage = 'Synced Inventory Excel: Found 342 active items. Updated stock levels. Sona Masoori Rice reorder warning dismissed.';
  }

  res.json({
    message: resultMessage,
    branch
  });
});

// POST chat/voice search
app.post('/api/chat', (req, res) => {
  const { branchId, query } = req.body;
  const bId = branchId || 'branch-1';
  const branch = branches[bId];

  if (!branch) {
    return res.status(404).json({ error: 'Branch not found' });
  }

  const q = query.toLowerCase();
  
  // Custom smart responses mapping
  let title = '';
  let body = '';
  
  if (q.includes('profit') || q.includes('rice') || q.includes('margin') || q.includes('kannada')) {
    title = 'Rice Margins are Down by 3.2%';
    body = `For ${branch.name}, overall profit margins contracted this month. Sona Masoori Rice purchase cost increased 8% (from ₹54/kg to ₹58/kg) from Annapoorna Distributors, while your retail selling price remained flat. Because rice is your highest volume SKU (representing 38% of revenue), this flat retail pricing explains 64% of your total margin contraction. Recommendation: raise your retail rice price to ₹66/kg, or unlock supplier discount.`;
  } else if (q.includes('owe') || q.includes('due') || q.includes('money') || q.includes('customer')) {
    const totalOwe = branch.metrics.customersOwe;
    title = `Outstanding Debt: ₹${totalOwe.toLocaleString('en-IN')}`;
    body = `You have 8 overdue invoices. The largest account is Mahaveer Stores (₹47,800, overdue by 21 days). Three customers account for ₹84,200 of your overdue balance by more than 15 days. I have prepared automated WhatsApp reminder messages for these 3 accounts. Would you like me to send them?`;
  } else if (q.includes('cash') || q.includes('low') || q.includes('why') || q.includes('flow')) {
    title = 'Cash Flow Statement & Buffer Dues';
    body = `Inflow was ₹${branch.cashFlow.inflow.toLocaleString('en-IN')} and Outflow was ₹${branch.cashFlow.outflow.toLocaleString('en-IN')}, leaving a net positive flow of +₹${branch.cashFlow.net.toLocaleString('en-IN')}. However, your upcoming cash drain includes: ₹3,10,000 in supplier payments (due in 5 days) and ₹39,294 in GST payable. With ₹${branch.metrics.customersOwe.toLocaleString('en-IN')} locked in credit, your immediate buffer is narrow.`;
  } else if (q.includes('do') || q.includes('suggest') || q.includes('happen') || q.includes('what should i do')) {
    title = 'AI Autopilot Recommendations';
    body = `Based on current metrics of ${branch.name}, here is your action plan:
1. Collect ₹84,200: Trigger the 3 prepared WhatsApp payment reminders.
2. Optimize Cash: Delay the ₹1,12,000 supplier payout to Annapoorna by 3 days (negotiable since safety score is high).
3. Purchase Rice: Place order for 500kg rice since current stock is low.
4. Stop stock: Halt purchase of premium oils (volume has decreased by 22% this month).`;
  } else {
    title = 'Business Brain Active';
    body = `I'm analyzing the relationships for ${branch.name}. I see active links between Customers, Invoices, UPI Settlements, Products, Suppliers, and GST filings. Ask me: "Why is cash flow low?", "Who owes me money?", "What should I do?" or run stock simulations in the Digital Twin view.`;
  }

  res.json({
    title,
    body
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`VyapaarOS backend running on http://localhost:${PORT}`);
});
