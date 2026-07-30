import { createDefaultBranch, initialBranchesData } from '../../../src/mockData';

// This prototype keeps its sample business data in memory. Refreshed: 2026-07-30
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
    const { scenario, qty, priceIncrease, salary } = body;

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
    const { totalAmount, paymentMode, items, customer = 'Walk-in customer' } = body;
    
    branch.metrics.salesThisMonth += totalAmount;
    
    if (paymentMode === 'Credit') {
      branch.metrics.customersOwe += totalAmount;
      branch.metrics.oweChange = `${branch.actions.filter(a => a.type === 'overdue').length + 1} invoices overdue`;
      if (!branch.receivables) branch.receivables = [];
      branch.receivables.unshift({
        id: `rec-${Date.now()}`,
        name: body.customer || "Walk-in Customer",
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

    if (items && Array.isArray(items)) {
      items.forEach(line => {
        const product = branch.inventory.find(p => p.id === line.productId);
        if (product) {
          product.stock = Math.max(0, product.stock - line.quantity);
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
      items: (items || []).map((line) => {
        const product = branch.inventory.find((item) => item.id === line.productId);
        return { name: product?.name || 'Product', quantity: line.quantity, unit: product?.unit || 'unit' };
      })
    });
    return json(branch);
  }

  if (pathname === 'inventory/add') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const { productId, quantity } = body;
    
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
    return json({ success: true, branch });
  }

  if (pathname === 'receivables/collect') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const { receivableId } = body;

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
    return json({ success: true, branch });
  }

  if (pathname === 'payables/pay') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const { payableId } = body;

    const payList = branch.payables || [];
    const payable = payList.find(p => p.id === payableId);
    if (payable && payable.status !== 'paid') {
      payable.status = 'paid';
      const amount = payable.amount;

      branch.metrics.cashInBank = Math.max(0, branch.metrics.cashInBank - amount);
      branch.cashFlow.outflow += amount;
      branch.cashFlow.net -= amount;
    }
    return json({ success: true, branch });
  }

  if (pathname === 'bookings/create') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const { name, productId, quantity, deliveryDate, advance } = body;
    const product = branch.inventory.find(p => p.id === productId);
    if (!product) return json({ error: 'Product not found' }, 404);

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
    const { bookingId } = body;
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
    return json({ success: true, branch });
  }

  if (pathname === 'bookings/check-ai') {
    if (!branch) return json({ error: 'Branch not found' }, 404);
    const { productId, quantity } = body;
    const qtyVal = Number(quantity) || 0;
    
    const product = branch.inventory.find(p => p.id === productId);
    if (!product) return json({ error: 'Product not found' }, 404);

    const stockLeft = Math.max(0, product.stock - qtyVal);
    const isSafe = stockLeft >= product.safetyLimit;
    
    let message = "";
    let dealerAdvice = "";

    if (product.id === 'p-1') {
      message = `Inventory Status: You have ${product.stock} kg of Sona Masoori Rice. Booking ${qtyVal} kg leaves you with ${stockLeft} kg. `;
      if (stockLeft < product.safetyLimit) {
        message += `WARNING: This drops stock levels below your safety threshold limit of ${product.safetyLimit} kg. You will need to restock immediately.`;
      } else {
        message += `This is safe and maintains a healthy safety reserve of ${stockLeft} kg (limit: ${product.safetyLimit} kg).`;
      }
      dealerAdvice = `Supplier Deal Insight: Annapoorna Distributors is your standard supplier at ₹54/kg. However, Golden Sugar Mill packages Rice orders occasionally. For Sona Masoori Rice, Annapoorna is offering a 3% volume discount on purchases exceeding 500 kg, and Sri Ghee Packers provides a 5% discount if bundled with Ghee orders.`;
    } else if (product.id === 'p-2') {
      message = `Inventory Status: You have ${product.stock} liters of Premium Ghee. Booking ${qtyVal} liters leaves you with ${stockLeft} liters. `;
      if (stockLeft < product.safetyLimit) {
        message += `WARNING: This drops stock levels below your safety threshold limit of ${product.safetyLimit} liters.`;
      } else {
        message += `This is safe and maintains a healthy safety reserve of ${stockLeft} liters (limit: ${product.safetyLimit} liters).`;
      }
      dealerAdvice = `Supplier Deal Insight: Sri Ghee Packers is your primary supplier at ₹580/liter. They offer an active 4% discount if settled via UPI transfer within 24 hours of delivery. Annapoorna Distributors also has premium ghee available at a standard price of ₹590/liter with no active discounts.`;
    } else {
      message = `Inventory Status: You have ${product.stock} kg of Refined Sugar. Booking ${qtyVal} kg leaves you with ${stockLeft} kg. `;
      if (stockLeft < product.safetyLimit) {
        message += `WARNING: This drops stock levels below your safety threshold limit of ${product.safetyLimit} kg.`;
      } else {
        message += `This is safe and maintains a healthy safety reserve of ${stockLeft} kg (limit: ${product.safetyLimit} kg).`;
      }
      dealerAdvice = `Supplier Deal Insight: Golden Sugar Mill is your main sugar supplier at ₹36/kg. They currently offer standard Net 15 credit terms. Annapoorna Distributors can supply Refined Sugar at ₹38/kg with a 2% prompt-payment discount on cash purchases.`;
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

    if (!branch.chatMemory) {
      branch.chatMemory = {
        history: [],
        lastTopic: null,
        topics: new Set()
      };
    }

    const memory = branch.chatMemory;
    const prev = memory.history.length > 0 ? memory.history[memory.history.length - 1] : null;

    const isFollowUp = /^(tell me more|what about|more details|explain|how|why|what else|and|but|however|also)/.test(q)
      || /(it|that|those|they|this|them|there|the other)/.test(q);

    let response;

    if (q.includes('gst') || q.includes('tax')) {
      memory.lastTopic = 'gst';
      memory.topics.add('gst');
      response = { title: 'Estimated GST payable: ₹39,294', body: 'Based on invoices currently awaiting payment, your GST liability is ₹39,294 at the 18% slab. This is an operating estimate; review the final return with your accountant before filing.' };
    } else if (q.includes('profit') || q.includes('rice') || q.includes('margin') || q.includes('kannada')) {
      memory.lastTopic = 'rice';
      memory.topics.add('rice');
      response = { title: 'Rice margins are down by 3.2%', body: `For ${branch.name}, Sona Masoori Rice purchase cost rose 8% while its retail price stayed flat. It is your highest-volume SKU, so it explains 64% of this month’s margin contraction. Recommendation: raise the retail price to ₹66/kg or unlock a supplier discount.` };
    } else if (q.includes('owe') || q.includes('due') || q.includes('money') || q.includes('customer')) {
      memory.lastTopic = 'debt';
      memory.topics.add('debt');
      response = { title: `Outstanding debt: ₹${branch.metrics.customersOwe.toLocaleString('en-IN')}`, body: 'You have 8 overdue invoices. Mahaveer Stores is the largest at ₹47,800, overdue by 21 days. Three customers account for ₹84,200 overdue by more than 15 days.' };
    } else if (q.includes('cash') || q.includes('low') || q.includes('why') || q.includes('flow')) {
      memory.lastTopic = 'cashflow';
      memory.topics.add('cashflow');
      response = { title: 'Cash flow and upcoming dues', body: `Inflow is ₹${branch.cashFlow.inflow.toLocaleString('en-IN')} and outflow is ₹${branch.cashFlow.outflow.toLocaleString('en-IN')}, leaving +₹${branch.cashFlow.net.toLocaleString('en-IN')}. You have ₹3.1L of supplier payments due in five days and ₹${branch.metrics.customersOwe.toLocaleString('en-IN')} locked in receivables.` };
    } else if (isFollowUp && prev) {
      if (q.includes('more') || q.includes('else') || q.includes('another') || q.includes('other')) {
        memory.topics.delete(memory.lastTopic);
        const remaining = [...memory.topics].filter(t => t !== memory.lastTopic);
        if (remaining.length > 0) {
          const next = remaining[0];
          memory.lastTopic = next;
          if (next === 'gst') {
            response = { title: 'Estimated GST payable: ₹39,294', body: 'Based on invoices currently awaiting payment, your GST liability is ₹39,294 at the 18% slab. This is an operating estimate; review the final return with your accountant before filing.' };
          } else if (next === 'rice') {
            response = { title: 'Rice margins are down by 3.2%', body: `For ${branch.name}, Sona Masoori Rice purchase cost rose 8% while its retail price stayed flat. It is your highest-volume SKU, so it explains 64% of this month’s margin contraction. Recommendation: raise the retail price to ₹66/kg or unlock a supplier discount.` };
          } else if (next === 'debt') {
            response = { title: `Outstanding debt: ₹${branch.metrics.customersOwe.toLocaleString('en-IN')}`, body: 'You have 8 overdue invoices. Mahaveer Stores is the largest at ₹47,800, overdue by 21 days. Three customers account for ₹84,200 overdue by more than 15 days.' };
          } else if (next === 'cashflow') {
            response = { title: 'Cash flow and upcoming dues', body: `Inflow is ₹${branch.cashFlow.inflow.toLocaleString('en-IN')} and outflow is ₹${branch.cashFlow.outflow.toLocaleString('en-IN')}, leaving +₹${branch.cashFlow.net.toLocaleString('en-IN')}. You have ₹3.1L of supplier payments due in five days and ₹${branch.metrics.customersOwe.toLocaleString('en-IN')} locked in receivables.` };
          } else {
            response = { title: 'Business Brain active', body: `I’m connecting customers, invoices, UPI settlements, products, suppliers and GST for ${branch.name}. Ask about cash flow, receivables, profit, or your next stock decision.` };
          }
        } else {
          response = { title: 'All topics covered', body: `That's all the insights I have for ${branch.name} right now. Feel free to ask about any specific area you'd like to explore further.` };
        }
      } else {
        const topic = memory.lastTopic;
        if (topic === 'gst') {
          response = { title: 'More about GST', body: `Your GST liability of ₹39,294 is spread across 12 unpaid invoices. The largest is ₹12,400 from last month's B2B sale. I recommend setting aside this amount before the 20th to avoid late fees.` };
        } else if (topic === 'rice') {
          response = { title: 'Deeper rice margin analysis', body: `Sona Masoori purchase cost rose from ₹48/kg to ₹52/kg. At current ₹60/kg retail, your margin is 13.3%, down from 20%. A ₹6/kg hike would restore margins. Competitors in the area sell at ₹64-68/kg.` };
        } else if (topic === 'debt') {
          response = { title: 'Debt recovery details', body: `Breakdown of top 3 overdue customers: 1) Mahaveer Stores ₹47,800 (21 days overdue), 2) Sri Durga Enterprises ₹22,400 (18 days), 3) Anand Rice Mill ₹14,000 (12 days). Sending reminders now could recover 70% within a week.` };
        } else if (topic === 'cashflow') {
          response = { title: 'Cash flow breakdown', body: `Your inflows total ₹${(branch.cashFlow.inflow).toLocaleString('en-IN')} from sales and collections. Outflows include supplier payments ₹3.1L, wages ₹86K, and GST ₹39K. Net positive ₹${(branch.cashFlow.net).toLocaleString('en-IN')}, but 5 large supplier bills are due soon.` };
        } else {
          response = { title: 'Business Brain active', body: `I’m connecting customers, invoices, UPI settlements, products, suppliers and GST for ${branch.name}. Ask about cash flow, receivables, profit, or your next stock decision.` };
        }
      }
    } else {
      memory.lastTopic = null;
      response = { title: 'Business Brain active', body: `I’m connecting customers, invoices, UPI settlements, products, suppliers and GST for ${branch.name}. Ask about cash flow, receivables, profit, or your next stock decision.` };
    }

    memory.history.push({ query: body.query, response });
    memory.history = memory.history.slice(-20);

    return json(response);
  }

  return json({ error: 'Not found' }, 404);
}
