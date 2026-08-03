import { createDefaultBranch, initialBranchesData } from '../../../src/mockData';
import {
  seedUsers,
  findByUsername,
  verifyPassword,
  signToken,
  authenticate,
  isAdmin,
  guardBranchAccess,
} from '../../../src/server/auth';
import { auditRoute } from '../../../src/server/audit';
import { loadBranchState, saveBranchState, listBranches } from '../../../src/server/db';

// This prototype keeps its sample business data in memory. Refreshed: 2026-07-30
// When Supabase is configured (SUPABASE_URL + SUPABASE_ANON_KEY), every branch is
// live-fetched from Postgres and every mutation is persisted back to it. The
// in-memory copy acts as an offline/fallback cache only.
let branches = structuredClone(initialBranchesData);
let branchCounter = 1;
seedUsers(Object.keys(branches));

const json = (data, status = 200) => Response.json(data, { status });
const branchFor = async (id) => {
  if (id != null && !BRANCH_ID_RE.test(String(id))) return undefined;
  const branchId = id || 'branch-1';
  const fromDb = await loadBranchState(branchId);
  if (fromDb) {
    branches[branchId] = fromDb;
    return fromDb;
  }
  return branches[branchId];
};

// ---- Security helpers -------------------------------------------------------
const MAX_BODY_BYTES = 100 * 1024;      // reject payloads over 100 KB
const MAX_STRING_LEN = 500;             // cap user-supplied strings
const BRANCH_ID_RE = /^branch-\d+$/;

const clientIp = (request) => {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) {
    const first = fwd.split(',')[0].trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip') || 'unknown';
};

const clean = (value, max = MAX_STRING_LEN) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const toNum = (value, fallback = 0, min = 0) => {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n)) return fallback;
  return Math.max(min, n);
};

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

// ---- Rate limiting (in-memory, fixed window) --------------------------------
const RATE_LIMITS = {
  GET: { windowMs: 60_000, max: 120 },
  POST: { windowMs: 60_000, max: 60 },
};
const LOGIN_LIMITS = { windowMs: 60_000, max: 20 };
const rateBuckets = new Map();

const rateLimit = (request, scope = request.method) => {
  const limits = scope === 'login' ? LOGIN_LIMITS : RATE_LIMITS;
  const { windowMs, max } = limits[request.method] || limits.GET || limits;
  const key = `${scope}:${clientIp(request)}`;
  const now = Date.now();

  if (rateBuckets.size > 10_000) {
    for (const [bucketKey, bucket] of rateBuckets) {
      if (now >= bucket.resetAt) rateBuckets.delete(bucketKey);
    }
  }

  const bucket = rateBuckets.get(key);
  const fresh = bucket && bucket.resetAt > now;
  const resetAt = fresh ? bucket.resetAt : now + windowMs;
  const count = fresh ? bucket.count + 1 : 1;
  rateBuckets.set(key, { count, resetAt });

  if (count > max) return { limited: true, retryAfter: Math.ceil((resetAt - now) / 1000) };
  return { limited: false, remaining: max - count };
};

const tooManyRequests = (retryAfter) =>
  new Response(JSON.stringify({ error: 'Too many requests. Please slow down and retry.' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) },
  });

const parseBody = async (request) => {
  const raw = await request.text();
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    return { error: 'Payload too large', status: 413 };
  }
  if (!raw.trim()) return { body: {} };
  try {
    const parsed = JSON.parse(raw);
    return isPlainObject(parsed) ? { body: parsed } : { error: 'Invalid JSON payload', status: 400 };
  } catch {
    return { error: 'Invalid JSON payload', status: 400 };
  }
};

// Persist a mutated branch to Postgres, then return it to the client.
// Persistence failures never break the demo — the in-memory state still wins.
const persist = async (branch) => {
  try {
    await saveBranchState(branch);
  } catch (err) {
    console.error('[db] save failed (continuing with in-memory state):', err.message);
  }
  return branch;
};
const respond = async (branch) => json(await persist(branch));
const respondWrapped = async (branch) => json({ success: true, branch: await persist(branch) });

export async function GET(request, { params }) {
  const { route } = await params;
  const pathname = route.join('/');
  const { searchParams } = new URL(request.url);

  const limit = rateLimit(request);
  if (limit.limited) return tooManyRequests(limit.retryAfter);

  const auth = authenticate(request);
  if (auth.error) return json({ error: auth.error }, auth.status);
  const { user } = auth;

  if (pathname === 'branches') {
    const dbList = await listBranches();
    const memoryList = Object.entries(branches).map(([id, branch]) => ({ id, name: branch.name }));
    const list = (dbList && dbList.length > 0) ? dbList : memoryList;
    const visible = list.filter((b) => isAdmin(user) || user.branchIds?.includes(b.id));
    return json(visible);
  }
  if (pathname === 'state') {
    const branchId = searchParams.get('branchId');
    const denied = guardBranchAccess(request, user, branchId, 'access.denied');
    if (denied) return json({ error: denied.error }, denied.status);
    const branch = await branchFor(branchId);
    return branch ? json(branch) : json({ error: 'Branch not found' }, 404);
  }
  return json({ error: 'Not found' }, 404);
}

const handleLogin = async (request) => {
  const { body, error, status } = await parseBody(request);
  if (error) return json({ error }, status);

  const username = clean(body.username, 64);
  const password = String(body.password ?? '');

  const demoUser = process.env.ADMIN_USERNAME || '1';
  const demoPass = process.env.ADMIN_PASSWORD || '1';
  const isDemoLogin = username === demoUser && password === demoPass;

  if (!isDemoLogin) {
    const limit = rateLimit(request, 'login');
    if (limit.limited) return tooManyRequests(limit.retryAfter);
  }

  const user = findByUsername(username);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    auditRoute('auth.login_failed', request, null, { username });
    return json({ error: 'Invalid username or password' }, 401);
  }

  const token = signToken(user);
  auditRoute('auth.login_success', request, user, {});
  return json({
    token,
    user: { id: user.id, username: user.username, role: user.role, branchIds: user.branchIds },
  });
};

export async function POST(request, { params }) {
  const { route } = await params;
  const pathname = route.join('/');

  if (pathname === 'login') {
    return handleLogin(request);
  }

  const limit = rateLimit(request);
  if (limit.limited) return tooManyRequests(limit.retryAfter);

  const { body, error, status } = await parseBody(request);
  if (error) return json({ error }, status);

  const auth = authenticate(request);
  if (auth.error) return json({ error: auth.error }, auth.status);
  const { user } = auth;

  if (pathname === 'clone' && !isAdmin(user)) {
    auditRoute('access.denied', request, user, { path: pathname });
    return json({ error: 'Forbidden' }, 403);
  }

  const branch = await branchFor(body.branchId);
  if (pathname !== 'clone' && !isAdmin(user)) {
    const denied = guardBranchAccess(request, user, body.branchId, 'access.denied');
    if (denied) return json({ error: denied.error }, denied.status);
  }

  if (pathname === 'action/resolve') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const actionId = clean(body.actionId, 64);
    auditRoute('action.resolve', request, user, { branchId: body.branchId, actionId });
    const priorityIndex = branch.actions.findIndex((action) => action.id === actionId);
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
    const audit = branch.audits.find((item) => item.id === actionId);
    if (audit) {
      audit.resolved = true;
      if (audit.id === 'audit-1') {
        branch.actions = branch.actions.filter((action) => action.type !== 'audit');
        branch.metrics.cashInBank += 28500;
      }
    }
    return respond(branch);
  }

  if (pathname === 'simulate') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const scenario = clean(body.scenario, 32);
    const qty = toNum(body.qty);
    const priceIncrease = toNum(body.priceIncrease);
    const salary = toNum(body.salary);

    if (scenario === 'price') {
      const increase = priceIncrease || 5;
      const margins = 16.0;
      const gain = 24500;
      return json({
        status: 'recommended',
        cost: 0,
        margins,
        stockCoverageDays: 0,
        message: `Proceed: A ${increase}% price increase on grains is projected to yield an extra ₹${gain.toLocaleString('en-IN')} net monthly profit. This accounts for a simulated 6% price-elasticity volume drop, but the margin increase offsets it.`
      });
    } else if (scenario === 'hire') {
      const pay = salary || 12000;
      const roi = 2.3;
      const margins = 14.2;
      return json({
        status: 'recommended',
        cost: pay,
        margins,
        stockCoverageDays: 0,
        message: `Proceed: Hiring a delivery runner at ₹${pay.toLocaleString('en-IN')}/month expands local delivery reach, projecting a 15% increase in commercial order volume (net +₹28,000 revenue, ROI: ${roi}x).`
      });
    } else {
      const quantity = qty || 500;
      const cost = quantity * 58;
      const stockCoverageDays = Math.round(quantity / 26);
      let status = 'recommended';
      let message = `This purchase covers projected demand for ${stockCoverageDays} days and keeps your cash buffer healthy.`;
      if (cost > branch.metrics.cashInBank) {
        status = 'warning';
        message = `Investment of ₹${cost.toLocaleString('en-IN')} exceeds your current cash balance and would create a cash-flow deficit.`;
      } else if (stockCoverageDays > 60) {
        status = 'alert';
        message = `Purchasing ${quantity}kg covers ${stockCoverageDays} days, above the usual 45-day inventory rotation threshold.`;
      }
      return json({ status, cost, margins: 12.8, stockCoverageDays, message });
    }
  }

  if (pathname === 'billing') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const totalAmount = toNum(body.totalAmount);
    const paymentMode = clean(body.paymentMode, 20);
    const customer = clean(body.customer) || 'Walk-in customer';
    const items = Array.isArray(body.items) ? body.items.slice(0, 200) : [];

    auditRoute('billing.create', request, user, { branchId: body.branchId, amount: totalAmount, mode: paymentMode });

    branch.metrics.salesThisMonth += totalAmount;

    if (paymentMode === 'Credit') {
      branch.metrics.customersOwe += totalAmount;
      branch.metrics.oweChange = `${branch.actions.filter(a => a.type === 'overdue').length + 1} invoices overdue`;
      if (!branch.receivables) branch.receivables = [];
      branch.receivables.unshift({
        id: `rec-${Date.now()}`,
        name: customer,
        amount: totalAmount,
        dueDate: "15 Aug 2026",
        phone: "+91 99001 22334",
        status: "pending"
      });
    } else {
      branch.metrics.cashInBank += totalAmount;
      branch.cashFlow.inflow += totalAmount;
      branch.cashFlow.net += totalAmount;
    }

    if (items.length > 0) {
      items.forEach(line => {
        const productId = clean(line && line.productId, 64);
        const quantity = toNum(line && line.quantity);
        const product = branch.inventory.find(p => p.id === productId);
        if (product) {
          product.stock = Math.max(0, product.stock - quantity);
          if (product.stock < product.safetyLimit) {
            const hasAlert = branch.actions.some(a => a.id === `action-low-${product.id}`);
            if (!hasAlert) {
              branch.actions.unshift({
                id: `action-low-${product.id}`,
                type: "stock",
                title: `Restock ${product.name}`,
                desc: `Stock dropped to ${product.stock} ${product.unit} (limit: ${product.safetyLimit})`,
                severity: "high"
              });
            }
          }
        }
      });
    }

    branch.metrics.inventoryValue = branch.inventory.reduce((sum, item) => sum + (item.stock * item.cost), 0);
    branch.bills ||= [];
    const taxableValue = Math.round(totalAmount / 1.18);
    branch.bills.unshift({
      id: `INV-${String(2482 + branch.bills.length).padStart(4, '0')}`,
      date: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
      customer,
      paymentMode,
      total: totalAmount,
      status: paymentMode === 'Credit' ? 'Due' : 'Paid',
      gst: totalAmount - taxableValue,
      items: items.map((line) => {
        const product = branch.inventory.find((item) => item.id === clean(line && line.productId, 64));
        return { name: product?.name || 'Product', quantity: toNum(line && line.quantity), unit: product?.unit || 'unit' };
      })
    });
    return respond(branch);
  }

  if (pathname === 'inventory/add') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const productId = clean(body.productId, 64);
    const quantity = toNum(body.quantity);
    auditRoute('inventory.add', request, user, { branchId: body.branchId, productId, quantity });
    
    const product = branch.inventory.find(p => p.id === productId);
    if (product) {
      product.stock += quantity;
      const totalCost = quantity * product.cost;

      branch.metrics.cashInBank = Math.max(0, branch.metrics.cashInBank - totalCost);
      branch.cashFlow.outflow += totalCost;
      branch.cashFlow.net -= totalCost;

      if (product.stock >= product.safetyLimit) {
        branch.actions = branch.actions.filter(a => a.id !== `action-low-${product.id}`);
        if (productId === 'p-1') {
          branch.actions = branch.actions.filter(a => a.id !== 'action-2');
        }
      }
    }

    branch.metrics.inventoryValue = branch.inventory.reduce((sum, item) => sum + (item.stock * item.cost), 0);
    return respondWrapped(branch);
  }

  if (pathname === 'orders/check') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];

    const lines = [];
    let totalCost = 0;
    for (const line of items) {
      const productId = clean(line && line.productId, 64);
      const quantity = toNum(line && line.quantity);
      const product = branch.inventory.find((p) => p.id === productId);
      if (!product || quantity <= 0) continue;

      const cost = product.cost * quantity;
      totalCost += cost;
      const marginPct = product.price > 0 ? Math.round(((product.price - product.cost) / product.price) * 100) : 0;
      const low = product.stock < product.safetyLimit;
      const overStock = product.stock > product.safetyLimit * 4;

      let flag = 'ok';
      let note = `Healthy margin of ${marginPct}%. Stock ${product.stock} ${product.unit} (safety limit ${product.safetyLimit} ${product.unit}).`;
      if (low) {
        flag = 'low-stock';
        note = `Low stock (${product.stock} / ${product.safetyLimit} ${product.unit}). Restocking is a priority.`;
      } else if (overStock) {
        flag = 'overstock';
        note = `Already high stock (${product.stock} ${product.unit}). Consider trimming the quantity to avoid tying up cash.`;
      } else if (marginPct < 10) {
        flag = 'thin-margin';
        note = `Thin margin (~${marginPct}%). Recheck retail pricing before buying more.`;
      }
      lines.push({ productId, name: product.name, quantity, unit: product.unit, total: cost, margin: marginPct, stock: product.stock, safetyLimit: product.safetyLimit, flag, note });
    }

    if (lines.length === 0) return json({ error: 'No valid items in order' }, 400);

    const cash = branch.metrics.cashInBank || 0;
    const budgetOk = totalCost <= cash;
    const cashLeft = cash - totalCost;

    const supplierTips = [];
    for (const line of lines) {
      if (line.productId === 'p-1') supplierTips.push('Annapoorna Distributors: ₹62/kg rice, 3% volume discount above 500 kg.');
      else if (line.productId === 'p-2') supplierTips.push('Sunrise Edible Oils: ₹135/L, 4% UPI discount on 24h settlement.');
      else if (line.productId === 'p-5') supplierTips.push('Golden Sugar Mill: ₹41/kg, Net 15 with 2% prompt-payment discount.');
    }

    let score = 100;
    const issues = [];
    if (!budgetOk) {
      score -= 25;
      issues.push(`Total cost ₹${totalCost.toLocaleString('en-IN')} exceeds cash in bank ₹${cash.toLocaleString('en-IN')}.`);
    }
    for (const line of lines) {
      if (line.flag === 'overstock') { score -= 15; issues.push(`${line.name}: already over-stocked, add in smaller lots.`); }
      if (line.flag === 'thin-margin') { score -= 10; issues.push(`${line.name}: thin margin (${line.margin}%).`); }
      if (line.flag === 'low-stock') score += 5;
    }
    score = Math.max(0, Math.min(100, Math.round(score)));
    const status = score >= 80 ? 'recommended' : score >= 55 ? 'caution' : 'warning';

    return json({
      success: true,
      score,
      status,
      totalCost,
      cash,
      cashLeft,
      budgetOk,
      issues,
      supplierTips,
      lines,
      summary:
        score >= 80
          ? `Good purchase. Order worth ₹${totalCost.toLocaleString('en-IN')} fits the budget with ₹${cashLeft.toLocaleString('en-IN')} left in bank.`
          : score >= 55
            ? `Decent, but review the ${issues.length} flagged point(s) before confirming.`
            : `Not recommended as-is. Fix the flagged issues or trim quantities.`,
    });
  }

  if (pathname === 'orders/create') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
    const supplier = clean(body.supplier, 120);

    let totalCost = 0;
    const lines = [];
    for (const line of items) {
      const productId = clean(line && line.productId, 64);
      const quantity = toNum(line && line.quantity);
      const product = branch.inventory.find((p) => p.id === productId);
      if (!product || quantity <= 0) continue;

      product.stock += quantity;
      totalCost += quantity * product.cost;
      lines.push({ productId, name: product.name, quantity, unit: product.unit, cost: product.cost });

      if (product.stock >= product.safetyLimit) {
        branch.actions = branch.actions.filter((a) => a.id !== `action-low-${product.id}`);
        if (productId === 'p-1') branch.actions = branch.actions.filter((a) => a.id !== 'action-2');
      }
    }
    if (totalCost <= 0 || lines.length === 0) return json({ error: 'No valid items in order' }, 400);

    branch.metrics.cashInBank = Math.max(0, branch.metrics.cashInBank - totalCost);
    branch.cashFlow.outflow += totalCost;
    branch.cashFlow.net -= totalCost;
    branch.metrics.inventoryValue = branch.inventory.reduce((sum, item) => sum + (item.stock * item.cost), 0);

    const order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      supplier: supplier || 'Multiple suppliers',
      totalCost,
      itemCount: lines.length,
      status: 'placed',
      timeline: [{ at: 'Now', label: 'Order placed' }],
      items: lines,
    };
    branch.orders ||= [];
    branch.orders.unshift(order);

    auditRoute('orders.create', request, user, { branchId: body.branchId, orderId: order.id, totalCost, items: lines.length });
    return respondWrapped(branch);
  }

  if (pathname === 'orders/advance') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const orderId = clean(body.orderId, 64);
    const order = branch.orders?.find((o) => o.id === orderId);
    if (!order) return json({ error: 'Order not found' }, 404);

    const STEPS = ['placed', 'confirmed', 'packed', 'in_transit', 'delivered'];
    const idx = STEPS.indexOf(order.status);
    if (idx >= 0 && idx < STEPS.length - 1) {
      order.status = STEPS[idx + 1];
      order.timeline = [
        ...(order.timeline || []),
        { at: 'Now', label: order.status.replace('_', ' ') },
      ];
    }
    auditRoute('orders.advance', request, user, { branchId: body.branchId, orderId, status: order.status });
    return respondWrapped(branch);
  }

  if (pathname === 'receivables/collect') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const receivableId = clean(body.receivableId, 64);
    auditRoute('receivables.collect', request, user, { branchId: body.branchId, receivableId });

    const recList = branch.receivables || [];
    const receivable = recList.find(r => r.id === receivableId);
    if (receivable && receivable.status !== 'paid') {
      receivable.status = 'paid';
      const amount = receivable.amount;
      
      branch.metrics.customersOwe = Math.max(0, branch.metrics.customersOwe - amount);
      branch.metrics.cashInBank += amount;
      branch.cashFlow.inflow += amount;
      branch.cashFlow.net += amount;

      const activeOverdue = recList.filter(r => r.status === 'overdue').length;
      branch.metrics.oweChange = activeOverdue > 0 ? `${activeOverdue} invoices overdue` : "reconciled";
      
      if (receivable.name.includes("Sunil") || receivable.name.includes("Mahaveer")) {
        const remainingOverdueAmount = recList
          .filter(r => r.status === 'overdue')
          .reduce((sum, r) => sum + r.amount, 0);
        if (remainingOverdueAmount === 0) {
          branch.actions = branch.actions.filter(a => a.id !== 'action-1');
        } else {
          const alertAction = branch.actions.find(a => a.id === 'action-1');
          if (alertAction) {
            alertAction.title = `Follow up on ₹${remainingOverdueAmount.toLocaleString('en-IN')}`;
          }
        }
      }
    }
    return respondWrapped(branch);
  }

  if (pathname === 'payables/pay') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const payableId = clean(body.payableId, 64);
    auditRoute('payables.pay', request, user, { branchId: body.branchId, payableId });

    const payList = branch.payables || [];
    const payable = payList.find(p => p.id === payableId);
    if (payable && payable.status !== 'paid') {
      payable.status = 'paid';
      const amount = payable.amount;

      branch.metrics.cashInBank = Math.max(0, branch.metrics.cashInBank - amount);
      branch.cashFlow.outflow += amount;
      branch.cashFlow.net -= amount;
    }
    return respondWrapped(branch);
  }

  if (pathname === 'bookings/create') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const name = clean(body.name, 120);
    const productId = clean(body.productId, 64);
    const quantity = toNum(body.quantity);
    const deliveryDate = clean(body.deliveryDate, 40);
    const advance = toNum(body.advance);
    const product = branch.inventory.find(p => p.id === productId);
    if (!product) return json({ error: 'Product not found' }, 404);
    auditRoute('bookings.create', request, user, { branchId: body.branchId, productId, quantity, advance });

    const newBooking = {
      id: `bk-${Date.now()}`,
      name: name || "Walk-in Customer",
      productId,
      productName: product.name,
      quantity,
      unit: product.unit,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      deliveryDate: deliveryDate || "05 Aug 2026",
      advance: Number(advance) || 0,
      status: "pending"
    };

    if (!branch.bookings) branch.bookings = [];
    branch.bookings.unshift(newBooking);

    if (newBooking.advance > 0) {
      branch.metrics.cashInBank += newBooking.advance;
      branch.cashFlow.inflow += newBooking.advance;
      branch.cashFlow.net += newBooking.advance;
    }

    return json({ success: true, branch });
  }

  if (pathname === 'bookings/deliver') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const bookingId = clean(body.bookingId, 64);
    auditRoute('bookings.deliver', request, user, { branchId: body.branchId, bookingId });
    const booking = branch.bookings?.find(b => b.id === bookingId);
    if (booking && booking.status !== 'delivered') {
      const product = branch.inventory.find(p => p.id === booking.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - booking.quantity);
        const totalBill = product.price * booking.quantity;
        const unpaidBalance = Math.max(0, totalBill - booking.advance);

        branch.metrics.salesThisMonth += totalBill;

        if (unpaidBalance > 0) {
          branch.metrics.customersOwe += unpaidBalance;
          if (!branch.receivables) branch.receivables = [];
          branch.receivables.unshift({
            id: `rec-${Date.now()}`,
            name: booking.name,
            amount: unpaidBalance,
            dueDate: "15 Aug 2026",
            phone: "+91 99001 22334",
            status: "pending"
          });
        }
        
        if (product.stock < product.safetyLimit) {
          const hasAlert = branch.actions.some(a => a.id === `action-low-${product.id}`);
          if (!hasAlert) {
            branch.actions.unshift({
              id: `action-low-${product.id}`,
              type: "stock",
              title: `Restock ${product.name}`,
              desc: `Stock dropped to ${product.stock} ${product.unit} (limit: ${product.safetyLimit})`,
              severity: "high"
            });
          }
        }
      }

      booking.status = 'delivered';
    }
    return respondWrapped(branch);
  }

  if (pathname === 'bookings/check-ai') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const productId = clean(body.productId, 64);
    const qtyVal = toNum(body.quantity);
    
    const product = branch.inventory.find(p => p.id === productId);
    if (!product) return json({ error: 'Product not found' }, 404);

    const stockLeft = Math.max(0, product.stock - qtyVal);
    const isSafe = stockLeft >= product.safetyLimit;
    
    let message = "";
    let dealerAdvice = "";

    const pLabel = product.name;
    const pUnit = product.unit || 'units';
    message = `Inventory Status: You have ${product.stock} ${pUnit} of ${pLabel}. Booking ${qtyVal} ${pUnit} leaves you with ${stockLeft} ${pUnit}. `;
    if (stockLeft < product.safetyLimit) {
      message += `WARNING: This drops stock levels below your safety threshold limit of ${product.safetyLimit} ${pUnit}. You will need to restock immediately.`;
    } else {
      message += `This is safe and maintains a healthy safety reserve of ${stockLeft} ${pUnit} (limit: ${product.safetyLimit} ${pUnit}).`;
    }

    if (product.id === 'p-1') {
      dealerAdvice = `Supplier Deal Insight: Annapoorna Distributors is your standard rice supplier at ₹62/kg. They are offering a 3% volume discount on purchases exceeding 500 kg of India Gate Sona Masoori Rice.`;
    } else if (product.id === 'p-2') {
      dealerAdvice = `Supplier Deal Insight: Sunrise Edible Oils is your primary supplier at ₹135/L. They offer an active 4% discount if settled via UPI within 24 hours of delivery.`;
    } else if (product.id === 'p-5') {
      dealerAdvice = `Supplier Deal Insight: Golden Sugar Mill is your main sugar supplier at ₹41/kg. They currently offer standard Net 15 credit terms with a 2% prompt-payment discount on cash purchases.`;
    } else {
      dealerAdvice = `Supplier Deal Insight: Check latest rates with your regular supplier for ${pLabel}. Order in bulk to unlock volume discounts and keep margins healthy.`;
    }

    return json({
      success: true,
      stockLeft,
      isSafe,
      safetyLimit: product.safetyLimit,
      message,
      dealerAdvice
    });
  }

  if (pathname === 'clone') {
    branchCounter += 1;
    const id = `branch-${branchCounter}`;
    const name = clean(body.name, 120) || 'New Branch';
    auditRoute('branch.clone', request, user, { newBranchId: id, name });
    const cloned = createDefaultBranch(id, name, {
      pricingMarkup: toNum(body.pricingMarkup, 20),
      safetyStockDays: toNum(body.safetyStockDays, 30),
      supplierDelayDays: toNum(body.supplierDelayDays, 5),
      alertSensitivity: clean(body.alertSensitivity, 20),
      cashInBank: 250000, salesThisMonth: 150000, customersOwe: 45000, inventoryValue: 120000,
      inflow: 300000, outflow: 200000, net: 100000,
    });
    cloned.actions = [{ id: 'action-clone-1', type: 'stock', title: 'Safety stock check: OK', desc: `Safety stock maintained at ${toNum(body.safetyStockDays, 30)} days.`, severity: 'low' }];
    branches[id] = cloned;
    await persist(cloned);
    return json({ success: true, branchId: id, branches: Object.entries(branches).map(([branchId, value]) => ({ id: branchId, name: value.name })) });
  }

  if (pathname === 'upload') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const fileType = clean(body.fileType, 20);
    auditRoute('upload.process', request, user, { branchId: body.branchId, fileType });
    const updates = {
      whatsapp: () => { branch.metrics.salesThisMonth += 35000; branch.metrics.customersOwe += 35000; return 'Extracted WhatsApp order: 600kg India Gate Sona Masoori Rice from Ramesh G. (₹35,000). Linked to product and invoice records.'; },
      upi: () => { branch.metrics.cashInBank += 47800; branch.metrics.customersOwe = Math.max(0, branch.metrics.customersOwe - 47800); return 'Reconciled UPI payment from Mahaveer Stores. Cash in Bank increased and the outstanding balance was updated.'; },
      invoice: () => { branch.metrics.inventoryValue += 88000; return 'Processed supplier bill from Annapoorna Distributors. Inventory value and payment terms have been updated.'; },
      bank: () => { branch.cashFlow.inflow += 120000; branch.cashFlow.net += 120000; branch.metrics.cashInBank += 120000; return 'Imported bank statement: 24 payments matched and your cash buffer has been updated.'; },
      excel: () => { branch.metrics.inventoryValue = 890000; branch.actions = branch.actions.filter((action) => action.type !== 'stock'); return 'Synced inventory sheet: 342 active items updated and the rice reorder warning was dismissed.'; },
    };
    const message = updates[fileType]?.() || 'File processed.';
    return json({ message, branch: await persist(branch) });
  }

  if (pathname === 'chat') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const query = clean(body.query, 300);
    const q = query.toLowerCase();

    const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
    const products = branch.inventory || [];
    const receivables = branch.receivables || [];
    const payables = branch.payables || [];

    const TYPE_WORDS = new Set(['sona', 'masoori', 'rice', 'sunflower', 'oil', 'sharbati', 'atta', 'toor', 'dal', 'refined', 'sugar', 'salt', 'onion', 'potato', 'tomato', 'banana', 'taaza', 'milk', 'masti', 'curd', 'butter', 'red', 'chilli', 'turmeric', 'powder', 'maggi', 'masala', 'noodles', 'gold', 'biscuits', 'matic', 'detergent', 'bath', 'soap', 'tea', 'classic', 'coffee', 'maxfresh', 'toothpaste', 'robusta']);
    const brandOf = (name) => {
      const words = name.toLowerCase().split(/\s+/);
      let end = 0;
      for (let i = 0; i < words.length; i += 1) {
        if (TYPE_WORDS.has(words[i])) { end = i; break; }
      }
      return end > 0 ? name.split(/\s+/).slice(0, end).join(' ') : name.split(/\s+/)[0];
    };

    const supplierFor = (p) => {
      const map = {
        'p-1': 'Annapoorna Distributors (₹62/kg)',
        'p-2': 'Sunrise Edible Oils (₹135/L)',
        'p-5': 'Golden Sugar Mill (₹41/kg)',
      };
      return map[p.id] || 'your regular supplier';
    };

    const findProduct = () => {
      const tokens = q.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(t => t.length > 2);
      let best = null;
      let bestScore = 0;
      for (const p of products) {
        const words = p.name.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter(w => w.length > 2);
        let score = 0;
        for (const t of tokens) {
          if (words.some(w => w === t || w.startsWith(t) || t.startsWith(w))) score += 1;
        }
        if (score > bestScore) { bestScore = score; best = p; }
      }
      return bestScore > 0 ? best : null;
    };

    const isPayable = /\b(payable|we owe|i owe|supplier.*due|pay.*supplier|bill.*due|to pay)\b/.test(q);
    const isOwedToMe = /\b(owe|owed|due|receivable|debt|recover|khata|baki|customer.*pay)\b/.test(q);
    const isFlow = /\b(flow|inflow|outflow|coming in|going out|net)\b/.test(q);
    const isCash = /\b(cash|balance|bank|money|fund|wallet|have|own)\b/.test(q);
    const isStockHealth = /\b(stock|restock|low|shortage|short|run out|empty|reorder)\b/.test(q);
    const isGst = /\b(gst|tax)\b/.test(q);
    const isSales = /\b(sales|sold|revenue|billing)\b/.test(q);
    const isProfit = /\b(profit|margin|earn|return)\b/.test(q);
    const isAll = /\b(all|everything|summary|snapshot|overview|whole|full|data)\b/.test(q);
    const wantsSupplier = /\b(where|get|buy|source|supplier|dealer|procure)\b/.test(q);
    const wantsStock = /\b(stock|left|available|how many|quantity)\b/.test(q);

    const product = findProduct();
    let response;

    if (product && wantsSupplier) {
      response = { title: product.name.split(' (')[0], body: `Get from ${supplierFor(product)}. Price ${inr(product.price)}/${product.unit}. Stock ${product.stock} ${product.unit}.` };
    } else if (product && wantsStock) {
      const flag = product.stock < product.safetyLimit ? 'LOW' : 'OK';
      response = { title: `${product.name.split(' (')[0]}: ${flag}`, body: `${product.stock} ${product.unit} in stock (limit ${product.safetyLimit}). Price ${inr(product.price)}/${product.unit}.` };
    } else if (product) {
      response = { title: `${product.name.split(' (')[0]} — ${inr(product.price)}/${product.unit}`, body: `Brand ${brandOf(product.name)}. Cost ${inr(product.cost)}. Stock ${product.stock} ${product.unit}. ${product.gst} GST. Get from ${supplierFor(product)}.` };
    } else if (isStockHealth) {
      const low = products.filter(p => p.stock < p.safetyLimit);
      if (low.length === 0) {
        response = { title: 'Stock healthy', body: 'All products above safety limit.' };
      } else {
        response = { title: `${low.length} items low on stock`, body: low.slice(0, 5).map(p => `${p.name.split(' (')[0]}: ${p.stock}${p.unit} (limit ${p.safetyLimit})`).join(' · ') };
      }
    } else if (isPayable) {
      const total = payables.reduce((s, p) => s + p.amount, 0);
      const top = [...payables].sort((a, b) => b.amount - a.amount)[0];
      response = { title: `You owe suppliers ${inr(total)}`, body: top ? `Top: ${top.name} ${inr(top.amount)} due ${top.dueDate}.` : 'No pending payables.' };
    } else if (isOwedToMe) {
      const total = receivables.reduce((s, r) => s + r.amount, 0);
      const top = [...receivables].sort((a, b) => b.amount - a.amount)[0];
      response = { title: `Customers owe you ${inr(total)}`, body: top ? `Top: ${top.name} ${inr(top.amount)} (${top.status}).` : 'No dues.' };
    } else if (isFlow) {
      response = { title: `Net flow +${inr(branch.cashFlow.net)}`, body: `Inflow ${inr(branch.cashFlow.inflow)} · Outflow ${inr(branch.cashFlow.outflow)}.` };
    } else if (isCash) {
      response = { title: `Cash in bank ${inr(branch.metrics.cashInBank)}`, body: `Sales this month ${inr(branch.metrics.salesThisMonth)} · Inventory value ${inr(branch.metrics.inventoryValue)}.` };
    } else if (isGst) {
      response = { title: 'GST liability ≈ ₹39,294', body: 'On 12 unpaid invoices at 18% slab. Set aside before the 20th.' };
    } else if (isSales) {
      response = { title: `Sales this month ${inr(branch.metrics.salesThisMonth)}`, body: `Change ${branch.metrics.salesChange}.` };
    } else if (isProfit) {
      response = { title: 'Rice margin down 3.2%', body: 'Top SKU margin 12.8%. Raise rice price to ₹66/kg or switch supplier.' };
    } else if (isAll) {
      response = {
        title: 'Store snapshot',
        body: `Cash ${inr(branch.metrics.cashInBank)} · Sales ${inr(branch.metrics.salesThisMonth)} · Inventory ${inr(branch.metrics.inventoryValue)} · Customers owe ${inr(receivables.reduce((s, r) => s + r.amount, 0))} · You owe suppliers ${inr(payables.reduce((s, p) => s + p.amount, 0))} · ${products.length} products.`
      };
    } else if (/^(hi|hello|hey|namaskara|namaste)\b/.test(q) || q.includes('how are')) {
      response = { title: 'VyapaarOS Assistant', body: 'Ask anything: prices, brands, suppliers, stock, cash, money owed, flow, GST. Short direct answers.' };
    } else {
      response = { title: 'I have all your data', body: 'Try: "price of rice", "brand of oil", "where to get rice", "cash balance", "money owed", "cash flow", "low stock".' };
    }

    return json(response);
  }

  return json({ error: 'Not found' }, 404);
}
