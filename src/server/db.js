// -----------------------------------------------------------------------------
// Supabase (Postgres) persistence layer for VyapaarOS.
//
// Responsibilities:
//   * Live-fetch a branch's full nested state from normalized Postgres tables.
//   * Persist every mutation made in the web app back to Postgres.
//   * Auto-seed the database from src/mockData.js on first load of a branch.
//   * Gracefully fall back to the in-memory mock when Supabase is not
//     configured, unreachable, or blocked by row-level security.
//
// Table shape (created by database/schema.sql, opened by database/rls.sql):
//   branches, products, invoices, invoice_items, receivables, payables,
//   bookings, alerts, business_memory, audits, inventory_transactions,
//   rate_limits, users, branch_users
// -----------------------------------------------------------------------------
import { createClient } from '@supabase/supabase-js';
import { createDefaultBranch } from '../mockData';

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })
  : null;

export const dbEnabled = () => supabase !== null;

// ---- Reconstruction constants (cosmetic / deterministic bits) ---------------
const CHART_DATA = [142, 101, 83, 65, 56, 51, 35, 48, 21, 8];
const DEFAULT_AUDITS = [
  { id: 'audit-1', severity: 'high', title: 'Possible duplicate supplier payment', desc: '₹28,500 was paid to Annapoorna Distributors twice, 11 minutes apart.', resolved: false },
  { id: 'audit-2', severity: 'med', title: 'Missing GST entry', desc: 'Invoice #SLT-2481 has no GST classification attached.', resolved: false },
  { id: 'audit-3', severity: 'low', title: 'Unusual refund volume', desc: 'Refunds are 18% higher than your normal weekly pattern.', resolved: false },
];

const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

const parseDate = (value) => {
  if (!value) return null;
  const match = /(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/.exec(String(value));
  if (match && MONTHS[match[2]] !== undefined) {
    return `${match[3]}-${String(MONTHS[match[2]] + 1).padStart(2, '0')}-${String(match[1]).padStart(2, '0')}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
  return null;
};

const fmtDate = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const num = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const buildOweChange = (receivables) => {
  const overdue = (receivables || []).filter((r) => r.status === 'overdue').length;
  return overdue > 0 ? `${overdue} invoices overdue` : 'reconciled';
};

const emptyMemory = () => ({
  customer: { title: '', details: [] },
  invoice: { title: '', details: [] },
  payment: { title: '', details: [] },
  product: { title: '', details: [] },
  supplier: { title: '', details: [] },
});

// -----------------------------------------------------------------------------
// Read: reconstruct the exact nested branch object the API/UI expects
// -----------------------------------------------------------------------------
const buildBranchFromDb = async (branchId) => {
  const [branchRow, products, invoices, items, receivables, payables, bookings, alerts, memories] =
    await Promise.all([
      supabase.from('branches').select('*').eq('id', branchId).maybeSingle(),
      supabase.from('products').select('*').eq('branch_id', branchId),
      supabase.from('invoices').select('*').eq('branch_id', branchId).order('created_at', { ascending: false }),
      supabase.from('invoice_items').select('*'),
      supabase.from('receivables').select('*').eq('branch_id', branchId),
      supabase.from('payables').select('*').eq('branch_id', branchId),
      supabase.from('bookings').select('*').eq('branch_id', branchId).order('created_at', { ascending: false }),
      supabase.from('alerts').select('*').eq('branch_id', branchId).order('created_at', { ascending: false }),
      supabase.from('business_memory').select('*').eq('branch_id', branchId),
    ]);

  if (branchRow.error || !branchRow.data) {
    throw new Error(branchRow.error?.message || `branch ${branchId} not found`);
  }

  const b = branchRow.data;
  const allItems = items.data || [];
  const itemMap = new Map();
  for (const item of allItems) {
    if (!itemMap.has(item.invoice_id)) itemMap.set(item.invoice_id, []);
    itemMap.get(item.invoice_id).push(item);
  }

  const productNames = new Map((products.data || []).map((p) => [p.id, p.name]));

  const appStateRow = (memories.data || []).find((m) => m.title === '__app_state__');
  const audits = appStateRow?.details?.audits || DEFAULT_AUDITS;
  const orders = appStateRow?.details?.orders || [];

  const memory = emptyMemory();
  for (const m of memories.data || []) {
    if (m.title === '__app_state__') continue;
    if (memory[m.category]) {
      memory[m.category] = { title: m.title, details: Array.isArray(m.details) ? m.details : [] };
    }
  }

  return {
    id: branchId,
    name: b.name,
    dna: {
      pricingMarkup: num(b.pricing_markup, 15),
      safetyStockDays: num(b.safety_stock_days, 8),
      supplierDelayDays: num(b.supplier_delay_days, 5),
      alertSensitivity: b.alert_sensitivity || 'high',
    },
    metrics: {
      cashInBank: num(b.cash_in_bank),
      salesThisMonth: num(b.sales_this_month),
      customersOwe: num(b.customers_owe),
      inventoryValue: num(b.inventory_value),
      cashInChange: '+12.4%',
      salesChange: '+8.1%',
      oweChange: buildOweChange(receivables.data || []),
      inventoryChange: '42 days of stock',
    },
    cashFlow: {
      inflow: num(b.inflow_ytd),
      outflow: num(b.outflow_ytd),
      net: num(b.net_ytd),
      chartData: CHART_DATA,
    },
    actions: (alerts.data || [])
      .filter((a) => !a.resolved)
      .map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        desc: a.description || '',
        severity: a.severity || 'med',
      })),
    audits,
    inventory: (products.data || []).map((p) => ({
      id: p.id,
      name: p.name,
      sector: p.sector,
      origin: p.origin || '',
      hsn: p.hsn || '',
      stock: num(p.stock),
      unit: p.unit || 'pcs',
      price: num(p.price),
      cost: num(p.cost),
      safetyLimit: num(p.safety_limit),
      gst: p.gst_rate || '5%',
    })),
    bills: (invoices.data || []).map((inv) => ({
      id: inv.id,
      date: fmtDate(inv.created_at),
      customer: inv.customer,
      paymentMode: inv.payment_mode,
      total: num(inv.total),
      status: inv.status,
      gst: num(inv.gst),
      items: (itemMap.get(inv.id) || []).map((line) => ({
        name: line.name,
        quantity: num(line.quantity),
        unit: line.unit || 'unit',
      })),
    })),
    receivables: (receivables.data || []).map((r) => ({
      id: r.id,
      name: r.customer,
      amount: num(r.amount),
      dueDate: fmtDate(r.due_date),
      phone: r.phone || '',
      status: r.status,
    })),
    payables: (payables.data || []).map((p) => ({
      id: p.id,
      name: p.supplier,
      amount: num(p.amount),
      dueDate: fmtDate(p.due_date),
      type: p.supplier_type || '',
    })),
    bookings: (bookings.data || []).map((bk) => ({
      id: bk.id,
      name: bk.customer,
      productId: bk.product_id,
      productName: productNames.get(bk.product_id) || '',
      quantity: num(bk.quantity),
      unit: bk.unit || 'unit',
      date: fmtDate(bk.booking_date),
      deliveryDate: fmtDate(bk.delivery_date),
      advance: num(bk.advance),
      status: bk.status,
    })),
    orders,
    memory,
  };
};

// -----------------------------------------------------------------------------
// Write: persist a full branch object back to Postgres (delete + re-insert in
// FK-safe order, wrapped per-request; small demo scale so this is cheap).
// -----------------------------------------------------------------------------
export async function saveBranchState(branch) {
  if (!supabase) return;
  const branchId = branch.id;
  const table = (name) => supabase.from(name);

  await table('receivables').delete().eq('branch_id', branchId);
  await table('payables').delete().eq('branch_id', branchId);
  await table('bookings').delete().eq('branch_id', branchId);
  await table('alerts').delete().eq('branch_id', branchId);
  await table('invoices').delete().eq('branch_id', branchId); // cascades invoice_items
  await table('products').delete().eq('branch_id', branchId);
  await table('business_memory').delete().eq('branch_id', branchId);

  const d = branch.dna || {};
  const m = branch.metrics || {};
  const cf = branch.cashFlow || {};

  await table('branches').upsert({
    id: branchId,
    name: branch.name || 'Sri Lakshmi Groceries (Main)',
    pricing_markup: num(d.pricingMarkup, 15),
    safety_stock_days: num(d.safetyStockDays, 8),
    supplier_delay_days: num(d.supplierDelayDays, 5),
    alert_sensitivity: d.alertSensitivity || 'high',
    cash_in_bank: num(m.cashInBank),
    sales_this_month: num(m.salesThisMonth),
    customers_owe: num(m.customersOwe),
    inventory_value: num(m.inventoryValue),
    inflow_ytd: num(cf.inflow),
    outflow_ytd: num(cf.outflow),
    net_ytd: num(cf.net),
  }, { onConflict: 'id' });

  const inventory = branch.inventory || [];
  if (inventory.length > 0) {
    await table('products').insert(
      inventory.map((p) => ({
        id: p.id,
        branch_id: branchId,
        name: p.name,
        sector: p.sector,
        origin: p.origin || '',
        hsn: p.hsn || '',
        unit: p.unit || 'pcs',
        stock: num(p.stock),
        price: num(p.price),
        cost: num(p.cost),
        safety_limit: num(p.safetyLimit),
        gst_rate: p.gst || '5%',
      }))
    );
  }

  const bills = branch.bills || [];
  if (bills.length > 0) {
    const invoiceRows = bills.map((bill) => ({
      id: bill.id,
      branch_id: branchId,
      invoice_no: bill.id,
      customer: bill.customer || 'Walk-in customer',
      payment_mode: bill.paymentMode || 'Cash',
      total: num(bill.total),
      gst: num(bill.gst),
      status: bill.status || 'Paid',
      created_at: parseDate(bill.date) || new Date().toISOString(),
    }));
    await table('invoices').insert(invoiceRows);

    const itemRows = [];
    for (const bill of bills) {
      for (const line of bill.items || []) {
        itemRows.push({
          invoice_id: bill.id,
          product_id: null,
          name: line.name || 'Product',
          quantity: num(line.quantity),
          unit: line.unit || 'unit',
          price: 0,
        });
      }
    }
    if (itemRows.length > 0) await table('invoice_items').insert(itemRows);
  }

  const receivables = branch.receivables || [];
  if (receivables.length > 0) {
    await table('receivables').insert(
      receivables.map((r) => ({
        id: r.id,
        branch_id: branchId,
        customer: r.name,
        amount: num(r.amount),
        due_date: parseDate(r.dueDate) || new Date().toISOString().slice(0, 10),
        phone: r.phone || '',
        status: r.status || 'pending',
      }))
    );
  }

  const payables = branch.payables || [];
  if (payables.length > 0) {
    await table('payables').insert(
      payables.map((p) => ({
        id: p.id,
        branch_id: branchId,
        supplier: p.name,
        amount: num(p.amount),
        due_date: parseDate(p.dueDate) || new Date().toISOString().slice(0, 10),
        supplier_type: p.type || '',
      }))
    );
  }

  const bookings = branch.bookings || [];
  if (bookings.length > 0) {
    await table('bookings').insert(
      bookings.map((bk) => ({
        id: bk.id,
        branch_id: branchId,
        customer: bk.name,
        product_id: bk.productId,
        quantity: num(bk.quantity),
        unit: bk.unit || 'unit',
        booking_date: parseDate(bk.date) || new Date().toISOString().slice(0, 10),
        delivery_date: parseDate(bk.deliveryDate) || new Date().toISOString().slice(0, 10),
        advance: num(bk.advance),
        status: bk.status || 'pending',
      }))
    );
  }

  const actions = branch.actions || [];
  if (actions.length > 0) {
    await table('alerts').insert(
      actions.map((a) => ({
        id: a.id,
        branch_id: branchId,
        type: a.type || 'other',
        title: a.title,
        description: a.desc || '',
        severity: a.severity || 'med',
        resolved: false,
      }))
    );
  }

  const memoryRows = Object.entries(branch.memory || {}).map(([category, mem]) => ({
    branch_id: branchId,
    category,
    title: mem.title,
    details: Array.isArray(mem.details) ? mem.details : [],
  }));
  memoryRows.push({
    branch_id: branchId,
    category: 'payment',
    title: '__app_state__',
    details: { audits: branch.audits || DEFAULT_AUDITS, orders: branch.orders || [] },
  });
  await table('business_memory').insert(memoryRows);
}

// -----------------------------------------------------------------------------
// Load: prefer live Postgres, fall back to in-memory mock
// -----------------------------------------------------------------------------
const seedFailCache = new Map(); // branchId -> last failed seed attempt (ms)
const SEED_RETRY_MS = 30_000;    // don't hammer a blocked/absent DB on every load

export async function loadBranchState(branchId) {
  if (!supabase) return null;

  try {
    const existing = await supabase.from('branches').select('id').eq('id', branchId).maybeSingle();
    if (existing.error || !existing.data) {
      if (Date.now() - (seedFailCache.get(branchId) || 0) < SEED_RETRY_MS) return null;
      const fresh = createDefaultBranch(branchId, branchId === 'branch-1' ? 'Sri Lakshmi Groceries (Main)' : 'New Branch');
      await saveBranchState(fresh);
    }
    return await buildBranchFromDb(branchId);
  } catch (err) {
    seedFailCache.set(branchId, Date.now());
    console.error(`[db] loadBranchState('${branchId}') failed, falling back to memory:`, err.message);
    return null;
  }
}

export async function listBranches() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('branches').select('id, name').order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[db] listBranches failed, falling back to memory:', err.message);
    return null;
  }
}
