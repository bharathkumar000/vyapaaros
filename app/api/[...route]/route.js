import { createDefaultBranch, initialBranchesData } from '../../../src/mockData';

// This prototype keeps its sample business data in memory. Replace this module
// with a database-backed service when wiring up real customer accounts.
let branches = structuredClone(initialBranchesData);
let branchCounter = 1;

const json = (data, status = 200) => Response.json(data, { status });
const branchFor = (id) => branches[id || 'branch-1'];

export async function GET(request, { params }) {
  const { route } = await params;
  const pathname = route.join('/');
  const { searchParams } = new URL(request.url);

  if (pathname === 'branches') {
    return json(Object.entries(branches).map(([id, branch]) => ({ id, name: branch.name })));
  }
  if (pathname === 'state') {
    const branch = branchFor(searchParams.get('branchId'));
    return branch ? json(branch) : json({ error: 'Branch not found' }, 404);
  }
  return json({ error: 'Not found' }, 404);
}

export async function POST(request, { params }) {
  const { route } = await params;
  const pathname = route.join('/');
  const body = await request.json();
  const branch = branchFor(body.branchId);

  if (pathname === 'action/resolve') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const priorityIndex = branch.actions.findIndex((action) => action.id === body.actionId);
    if (priorityIndex !== -1) {
      const action = branch.actions.splice(priorityIndex, 1)[0];
      if (action.type === 'audit' || action.title.includes('duplicate')) {
        branch.metrics.cashInBank += 28500;
        const audit = branch.audits.find((item) => item.id === 'audit-1');
        if (audit) audit.resolved = true;
      }
      if (action.type === 'stock') {
        branch.metrics.inventoryValue += 29000;
        branch.metrics.cashInBank -= 29000;
      }
    }
    const audit = branch.audits.find((item) => item.id === body.actionId);
    if (audit) {
      audit.resolved = true;
      if (audit.id === 'audit-1') {
        branch.actions = branch.actions.filter((action) => action.type !== 'audit');
        branch.metrics.cashInBank += 28500;
      }
    }
    return json(branch);
  }

  if (pathname === 'simulate') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const qty = Number(body.qty);
    const cost = qty * 58;
    const stockCoverageDays = Math.round(qty / 26);
    let status = 'recommended';
    let message = `This purchase covers projected demand for ${stockCoverageDays} days and keeps your cash buffer healthy.`;
    if (cost > branch.metrics.cashInBank) {
      status = 'warning';
      message = `Investment of ₹${cost.toLocaleString('en-IN')} exceeds your current cash balance and would create a cash-flow deficit.`;
    } else if (stockCoverageDays > 60) {
      status = 'alert';
      message = `Purchasing ${qty}kg covers ${stockCoverageDays} days, above the usual 45-day inventory rotation threshold.`;
    }
    return json({ status, cost, margins: 12.8, stockCoverageDays, message });
  }

  if (pathname === 'clone') {
    branchCounter += 1;
    const id = `branch-${branchCounter}`;
    const cloned = createDefaultBranch(id, body.name, {
      pricingMarkup: Number(body.pricingMarkup), safetyStockDays: Number(body.safetyStockDays),
      supplierDelayDays: Number(body.supplierDelayDays), alertSensitivity: body.alertSensitivity,
      cashInBank: 250000, salesThisMonth: 150000, customersOwe: 45000, inventoryValue: 120000,
      inflow: 300000, outflow: 200000, net: 100000,
    });
    cloned.actions = [{ id: 'action-clone-1', type: 'stock', title: 'Safety stock check: OK', desc: `Safety stock maintained at ${body.safetyStockDays} days.`, severity: 'low' }];
    branches[id] = cloned;
    return json({ success: true, branchId: id, branches: Object.entries(branches).map(([branchId, value]) => ({ id: branchId, name: value.name })) });
  }

  if (pathname === 'upload') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const updates = {
      whatsapp: () => { branch.metrics.salesThisMonth += 35000; branch.metrics.customersOwe += 35000; return 'Extracted WhatsApp order: 600kg Sona Masoori Rice from Ramesh G. (₹35,000). Linked to product and invoice records.'; },
      upi: () => { branch.metrics.cashInBank += 47800; branch.metrics.customersOwe = Math.max(0, branch.metrics.customersOwe - 47800); return 'Reconciled UPI payment from Mahaveer Stores. Cash in Bank increased and the outstanding balance was updated.'; },
      invoice: () => { branch.metrics.inventoryValue += 88000; return 'Processed supplier bill from Annapoorna Distributors. Inventory value and payment terms have been updated.'; },
      bank: () => { branch.cashFlow.inflow += 120000; branch.cashFlow.net += 120000; branch.metrics.cashInBank += 120000; return 'Imported bank statement: 24 payments matched and your cash buffer has been updated.'; },
      excel: () => { branch.metrics.inventoryValue = 890000; branch.actions = branch.actions.filter((action) => action.type !== 'stock'); return 'Synced inventory sheet: 342 active items updated and the rice reorder warning was dismissed.'; },
    };
    return json({ message: updates[body.fileType]?.() || 'File processed.', branch });
  }

  if (pathname === 'chat') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const q = (body.query || '').toLowerCase();
    if (q.includes('gst') || q.includes('tax')) return json({ title: 'Estimated GST payable: ₹39,294', body: 'Based on invoices currently awaiting payment, your GST liability is ₹39,294 at the 18% slab. This is an operating estimate; review the final return with your accountant before filing.' });
    if (q.includes('profit') || q.includes('rice') || q.includes('margin') || q.includes('kannada')) return json({ title: 'Rice margins are down by 3.2%', body: `For ${branch.name}, Sona Masoori Rice purchase cost rose 8% while its retail price stayed flat. It is your highest-volume SKU, so it explains 64% of this month’s margin contraction. Recommendation: raise the retail price to ₹66/kg or unlock a supplier discount.` });
    if (q.includes('owe') || q.includes('due') || q.includes('money') || q.includes('customer')) return json({ title: `Outstanding debt: ₹${branch.metrics.customersOwe.toLocaleString('en-IN')}`, body: 'You have 8 overdue invoices. Mahaveer Stores is the largest at ₹47,800, overdue by 21 days. Three customers account for ₹84,200 overdue by more than 15 days.' });
    if (q.includes('cash') || q.includes('low') || q.includes('why') || q.includes('flow')) return json({ title: 'Cash flow and upcoming dues', body: `Inflow is ₹${branch.cashFlow.inflow.toLocaleString('en-IN')} and outflow is ₹${branch.cashFlow.outflow.toLocaleString('en-IN')}, leaving +₹${branch.cashFlow.net.toLocaleString('en-IN')}. You have ₹3.1L of supplier payments due in five days and ₹${branch.metrics.customersOwe.toLocaleString('en-IN')} locked in receivables.` });
    return json({ title: 'Business Brain active', body: `I’m connecting customers, invoices, UPI settlements, products, suppliers and GST for ${branch.name}. Ask about cash flow, receivables, profit, or your next stock decision.` });
  }

  return json({ error: 'Not found' }, 404);
}
