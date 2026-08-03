-- =============================================================================
-- VyapaarOS - Relational Database Schema (PostgreSQL 13+)
-- Business: Sri Lakshmi Groceries (Main) - Indian grocery & provision store
-- This file creates the full schema and seeds the demo dataset used by the app.
-- -----------------------------------------------------------------------------
-- Usage:
--   psql -U <user> -d <dbname> -f database/schema.sql
--   (or paste into your DB GUI / managed database console)
-- =============================================================================

BEGIN;

SET client_encoding = 'UTF8';

-- =============================================================================
-- USERS & AUTH
-- =============================================================================

-- Application users (login / JWT auth). Password stored as bcrypt hash.
CREATE TABLE users (
  id            VARCHAR(32)  PRIMARY KEY,
  username      VARCHAR(64)  NOT NULL UNIQUE,
  password_hash VARCHAR(128) NOT NULL,
  role          VARCHAR(16)  NOT NULL DEFAULT 'staff'
                 CHECK (role IN ('admin','manager','staff')),
  branch_ids    VARCHAR(255),                      -- NULL = all branches (admin)
  created_at    TIMESTAMP    NOT NULL DEFAULT now(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT now()
);

-- =============================================================================
-- BRANCHES
-- =============================================================================

CREATE TABLE branches (
  id                  VARCHAR(32)  PRIMARY KEY,
  name                VARCHAR(120) NOT NULL,
  pricing_markup      NUMERIC(6,2) NOT NULL DEFAULT 15.00,  -- % markup over cost
  safety_stock_days   INT          NOT NULL DEFAULT 8,
  supplier_delay_days INT          NOT NULL DEFAULT 5,
  alert_sensitivity   VARCHAR(8)   NOT NULL DEFAULT 'high'
                       CHECK (alert_sensitivity IN ('low','med','high')),
  cash_in_bank        NUMERIC(14,2) NOT NULL DEFAULT 0,
  sales_this_month    NUMERIC(14,2) NOT NULL DEFAULT 0,
  customers_owe       NUMERIC(14,2) NOT NULL DEFAULT 0,
  inventory_value     NUMERIC(14,2) NOT NULL DEFAULT 0,
  inflow_ytd          NUMERIC(14,2) NOT NULL DEFAULT 0,
  outflow_ytd         NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_ytd             NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at          TIMESTAMP    NOT NULL DEFAULT now()
);

-- Branch <-> user access mapping (RBAC). Users with branch_ids NULL skip this.
CREATE TABLE branch_users (
  branch_id VARCHAR(32) NOT NULL,
  user_id   VARCHAR(32) NOT NULL,
  role      VARCHAR(16) NOT NULL DEFAULT 'staff'
             CHECK (role IN ('admin','manager','staff')),
  PRIMARY KEY (branch_id, user_id),
  CONSTRAINT fk_bu_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  CONSTRAINT fk_bu_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE
);

-- =============================================================================
-- INVENTORY
-- =============================================================================

-- Products / SKUs (the catalog shown in AI Inventory & Billing).
CREATE TABLE products (
  id           VARCHAR(32)  PRIMARY KEY,
  branch_id    VARCHAR(32)  NOT NULL,
  name         VARCHAR(200) NOT NULL,
  sector       VARCHAR(80)  NOT NULL,
  origin       VARCHAR(80),
  hsn          VARCHAR(16),
  unit         VARCHAR(16)  NOT NULL DEFAULT 'pcs',
  stock        NUMERIC(12,2) NOT NULL DEFAULT 0,
  price        NUMERIC(12,2) NOT NULL,             -- retail selling price
  cost         NUMERIC(12,2) NOT NULL,             -- purchase / landed cost
  safety_limit NUMERIC(12,2) NOT NULL DEFAULT 0,   -- triggers restock alert
  gst_rate     VARCHAR(4)   NOT NULL DEFAULT '5%'
                 CHECK (gst_rate IN ('0%','5%','12%','18%','28%')),
  created_at   TIMESTAMP    NOT NULL DEFAULT now(),
  updated_at   TIMESTAMP    NOT NULL DEFAULT now(),
  CONSTRAINT fk_pr_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- Immutable ledger of every stock movement (purchase, sale, adjust, return).
CREATE TABLE inventory_transactions (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  branch_id   VARCHAR(32)  NOT NULL,
  product_id  VARCHAR(32)  NOT NULL,
  type        VARCHAR(16)  NOT NULL
               CHECK (type IN ('purchase','sale','adjustment','return')),
  quantity    NUMERIC(12,2) NOT NULL,              -- +ve for in, -ve for out
  unit        VARCHAR(16)  NOT NULL DEFAULT 'pcs',
  ref_id      VARCHAR(32),                         -- invoice / booking id
  created_by  VARCHAR(32),
  created_at  TIMESTAMP    NOT NULL DEFAULT now(),
  CONSTRAINT fk_it_branch  FOREIGN KEY (branch_id)  REFERENCES branches(id) ON DELETE CASCADE,
  CONSTRAINT fk_it_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE INDEX idx_it_branch  ON inventory_transactions (branch_id);
CREATE INDEX idx_it_product ON inventory_transactions (product_id);

-- =============================================================================
-- SALES (INVOICES / BILLS)
-- =============================================================================

CREATE TABLE invoices (
  id           VARCHAR(32)  PRIMARY KEY,
  branch_id    VARCHAR(32)  NOT NULL,
  invoice_no   VARCHAR(32)  NOT NULL UNIQUE,
  customer     VARCHAR(120) NOT NULL,
  payment_mode VARCHAR(20)  NOT NULL DEFAULT 'Cash'
                 CHECK (payment_mode IN ('UPI','Credit','Cash','Bank Transfer','Card')),
  total        NUMERIC(14,2) NOT NULL DEFAULT 0,
  gst          NUMERIC(14,2) NOT NULL DEFAULT 0,
  status       VARCHAR(16)  NOT NULL DEFAULT 'Due'
                 CHECK (status IN ('Paid','Due','Overdue','Cancelled')),
  due_date     DATE,
  created_by   VARCHAR(32),
  created_at   TIMESTAMP    NOT NULL DEFAULT now(),
  updated_at   TIMESTAMP    NOT NULL DEFAULT now(),
  CONSTRAINT fk_inv_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);
CREATE INDEX idx_inv_branch ON invoices (branch_id);

CREATE TABLE invoice_items (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  invoice_id VARCHAR(32)   NOT NULL,
  product_id VARCHAR(32),
  name       VARCHAR(200)  NOT NULL,
  quantity   NUMERIC(12,2) NOT NULL,
  unit       VARCHAR(16)   NOT NULL DEFAULT 'pcs',
  price      NUMERIC(12,2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_ii_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  CONSTRAINT fk_ii_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- =============================================================================
-- RECEIVABLES & PAYABLES
-- =============================================================================

CREATE TABLE receivables (
  id         VARCHAR(32)  PRIMARY KEY,
  branch_id  VARCHAR(32)  NOT NULL,
  customer   VARCHAR(120) NOT NULL,
  amount     NUMERIC(14,2) NOT NULL,
  due_date   DATE         NOT NULL,
  phone      VARCHAR(20),
  status     VARCHAR(16)  NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','overdue','paid','partial')),
  invoice_id VARCHAR(32),
  created_at TIMESTAMP    NOT NULL DEFAULT now(),
  CONSTRAINT fk_rec_branch  FOREIGN KEY (branch_id)  REFERENCES branches(id) ON DELETE CASCADE,
  CONSTRAINT fk_rec_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
);
CREATE INDEX idx_rec_branch ON receivables (branch_id);

CREATE TABLE payables (
  id            VARCHAR(32)  PRIMARY KEY,
  branch_id     VARCHAR(32)  NOT NULL,
  supplier      VARCHAR(120) NOT NULL,
  amount        NUMERIC(14,2) NOT NULL,
  due_date      DATE         NOT NULL,
  supplier_type VARCHAR(80),
  status        VARCHAR(16)  NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','due','paid')),
  created_at    TIMESTAMP    NOT NULL DEFAULT now(),
  CONSTRAINT fk_pay_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);
CREATE INDEX idx_pay_branch ON payables (branch_id);

-- =============================================================================
-- BOOKINGS (PRE-ORDERS)
-- =============================================================================

CREATE TABLE bookings (
  id            VARCHAR(32)  PRIMARY KEY,
  branch_id     VARCHAR(32)  NOT NULL,
  customer      VARCHAR(120) NOT NULL,
  product_id    VARCHAR(32)  NOT NULL,
  quantity      NUMERIC(12,2) NOT NULL,
  unit          VARCHAR(16)  NOT NULL DEFAULT 'pcs',
  booking_date  DATE         NOT NULL,
  delivery_date DATE         NOT NULL,
  advance       NUMERIC(14,2) NOT NULL DEFAULT 0,
  status        VARCHAR(16)  NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','ready','delivered','cancelled')),
  created_at    TIMESTAMP    NOT NULL DEFAULT now(),
  CONSTRAINT fk_bk_branch  FOREIGN KEY (branch_id)  REFERENCES branches(id) ON DELETE CASCADE,
  CONSTRAINT fk_bk_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE INDEX idx_bk_branch ON bookings (branch_id);

-- =============================================================================
-- AI ALERTS / ACTIONS & AUDIT
-- =============================================================================

-- AI-generated actions shown on the dashboard ("AI Priorities").
CREATE TABLE alerts (
  id          VARCHAR(32)  PRIMARY KEY,
  branch_id   VARCHAR(32)  NOT NULL,
  type        VARCHAR(16)  NOT NULL DEFAULT 'other'
                CHECK (type IN ('overdue','stock','audit','cash','sales','gst','other')),
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  severity    VARCHAR(8)   NOT NULL DEFAULT 'med'
                CHECK (severity IN ('high','med','low')),
  resolved    BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP    NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP,
  CONSTRAINT fk_alert_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);
CREATE INDEX idx_alert_branch ON alerts (branch_id);

-- Every sensitive / mutating action for compliance & forensics (audit trail).
CREATE TABLE audits (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event      VARCHAR(80)  NOT NULL,
  user_id    VARCHAR(32),
  branch_id  VARCHAR(32),
  ip         VARCHAR(64),
  details    JSONB,
  created_at TIMESTAMP    NOT NULL DEFAULT now(),
  CONSTRAINT fk_audit_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);
CREATE INDEX idx_audit_user   ON audits (user_id);
CREATE INDEX idx_audit_branch ON audits (branch_id);
CREATE INDEX idx_audit_event  ON audits (event);

-- =============================================================================
-- BUSINESS MEMORY & GRAPH
-- =============================================================================

-- Long-term business memory consumed by the AI agents (customer/invoice/product
-- insights). Details stored as JSONB for flexibility.
CREATE TABLE business_memory (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  branch_id  VARCHAR(32) NOT NULL,
  category   VARCHAR(16) NOT NULL
               CHECK (category IN ('customer','invoice','payment','product','supplier','gst')),
  title      VARCHAR(200) NOT NULL,
  details    JSONB,
  created_at TIMESTAMP    NOT NULL DEFAULT now(),
  updated_at TIMESTAMP    NOT NULL DEFAULT now(),
  CONSTRAINT fk_mem_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);
CREATE INDEX idx_mem_branch ON business_memory (branch_id);

-- =============================================================================
-- RATE LIMITING (per-endpoint sliding window, backed up to DB for multi-node)
-- =============================================================================

CREATE TABLE rate_limits (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bucket      VARCHAR(120) NOT NULL,               -- e.g. "POST:/api/chat:192.168.x.x"
  window_start TIMESTAMP   NOT NULL,
  hits        INT          NOT NULL DEFAULT 1,
  CONSTRAINT uq_bucket_window UNIQUE (bucket, window_start)
);

-- =============================================================================
-- AUTO-UPDATE TRIGGERS (mirror MySQL's ON UPDATE CURRENT_TIMESTAMP)
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_business_memory_updated_at
  BEFORE UPDATE ON business_memory FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Default admin user (login: 1 / 1). Hash = bcrypt("1", cost 10).
INSERT INTO users (id, username, password_hash, role, branch_ids) VALUES
  ('user-1', '1', '$2b$10$9gtGhTQQ5jFKzzw3OT7rju8ggpE5hPh7Xix44HYbzK7bTiXoEpWT2', 'admin', NULL);

INSERT INTO branches
  (id, name, pricing_markup, safety_stock_days, supplier_delay_days, alert_sensitivity,
   cash_in_bank, sales_this_month, customers_owe, inventory_value, inflow_ytd, outflow_ytd, net_ytd)
VALUES
  ('branch-1', 'Sri Lakshmi Groceries (Main)', 15.00, 8, 5, 'high',
   482450.00, 1264800.00, 218300.00, 845600.00, 1680000.00, 1120000.00, 560000.00);

INSERT INTO branch_users (branch_id, user_id, role) VALUES ('branch-1', 'user-1', 'admin');

-- Products: real Indian brands, real prices (catalog mirrored from src/mockData.js).
INSERT INTO products
  (id, branch_id, name, sector, origin, hsn, unit, stock, price, cost, safety_limit, gst_rate)
VALUES
  ('p-1',  'branch-1', 'India Gate Sona Masoori Rice (5 kg)',    'Staples & Grains',          'Karnataka',       '1006', 'kg',    420, 75.00,  62.00, 300, '5%'),
  ('p-2',  'branch-1', 'Fortune Sunflower Oil (1 L)',            'Edible Oils',               'Maharashtra',     '1512', 'L',     180, 150.00, 135.00, 80,  '5%'),
  ('p-3',  'branch-1', 'Aashirvaad Sharbati Atta (5 kg)',        'Staples & Grains',          'Madhya Pradesh',  '1101', 'kg',    520, 56.00,  48.00, 300, '5%'),
  ('p-4',  'branch-1', 'Tata Sampann Toor Dal (1 kg)',           'Staples & Grains',          'Maharashtra',     '0713', 'kg',     60, 185.00, 163.00, 80,  '5%'),
  ('p-5',  'branch-1', 'Madhur Refined Sugar (1 kg)',            'Staples & Grains',          'Uttar Pradesh',   '1701', 'kg',    340, 47.00,  41.00, 150, '5%'),
  ('p-6',  'branch-1', 'Tata Salt (1 kg)',                       'Staples & Grains',          'Gujarat',         '2501', 'pcs',   620, 30.00,  25.00, 200, '5%'),
  ('p-7',  'branch-1', 'Fresh Onion (loose)',                    'Fruits & Vegetables',       'Maharashtra',     '0703', 'kg',    150, 45.00,  38.00, 50,  '5%'),
  ('p-8',  'branch-1', 'Fresh Potato (loose)',                   'Fruits & Vegetables',       'Uttar Pradesh',   '0701', 'kg',    210, 32.00,  27.00, 60,  '5%'),
  ('p-9',  'branch-1', 'Fresh Tomato (loose)',                   'Fruits & Vegetables',       'Karnataka',       '0702', 'kg',     30, 42.00,  35.00, 40,  '5%'),
  ('p-10', 'branch-1', 'Banana (Robusta, dozen)',                'Fruits & Vegetables',       'Tamil Nadu',      '0803', 'dozen', 140, 48.00,  40.00, 40,  '5%'),
  ('p-11', 'branch-1', 'Amul Taaza Milk (1 L)',                  'Dairy & Beverages',         'Gujarat',         '0401', 'L',     130, 66.00,  59.00, 40,  '5%'),
  ('p-12', 'branch-1', 'Amul Masti Curd (400 g)',                'Dairy & Beverages',         'Gujarat',         '0403', 'pcs',    85, 55.00,  48.00, 30,  '5%'),
  ('p-13', 'branch-1', 'Amul Butter (500 g)',                    'Dairy & Beverages',         'Gujarat',         '0405', 'pcs',    12, 285.00, 258.00, 15,  '12%'),
  ('p-14', 'branch-1', 'Everest Red Chilli Powder (100 g)',      'Spices & Masala',           'Andhra Pradesh',  '0904', 'pcs',   320, 58.00,  49.00, 100, '5%'),
  ('p-15', 'branch-1', 'Everest Turmeric Powder (100 g)',        'Spices & Masala',           'Tamil Nadu',      '0910', 'pcs',   260, 48.00,  40.00, 90,  '5%'),
  ('p-16', 'branch-1', 'Maggi Masala Noodles (12-pack)',         'Snacks & Instant',          'Delhi',           '1902', 'pcs',    50, 168.00, 144.00, 80,  '18%'),
  ('p-17', 'branch-1', 'Parle-G Gold Biscuits (10-pack)',        'Snacks & Instant',          'West Bengal',     '1905', 'pcs',   800, 30.00,  25.00, 300, '18%'),
  ('p-18', 'branch-1', 'Surf Excel Matic Detergent (1 kg)',      'Household & Personal Care', 'Maharashtra',     '3402', 'pcs',   140, 175.00, 158.00, 50,  '18%'),
  ('p-19', 'branch-1', 'Lifebuoy Bath Soap (155 g)',             'Household & Personal Care', 'Maharashtra',     '3401', 'pcs',   520, 38.00,  32.00, 150, '18%'),
  ('p-20', 'branch-1', 'Tata Tea Gold (250 g)',                  'Beverages',                 'Assam',           '0902', 'pcs',   200, 115.00, 98.00,  70,  '5%'),
  ('p-21', 'branch-1', 'Nescafé Classic (100 g)',                'Beverages',                 'Karnataka',       '0901', 'pcs',    45, 265.00, 232.00, 60,  '18%'),
  ('p-22', 'branch-1', 'Colgate MaxFresh Toothpaste (200 g)',    'Household & Personal Care', 'Delhi',           '3306', 'pcs',   180, 99.00,  85.00, 60,  '18%');

-- Invoices (bills).
INSERT INTO invoices (id, branch_id, invoice_no, customer, payment_mode, total, gst, status, due_date) VALUES
  ('INV-2481', 'branch-1', 'INV-2481', 'Mahaveer Stores', 'UPI',    47800.00, 7292.00, 'Paid', '2026-07-30'),
  ('INV-2480', 'branch-1', 'INV-2480', 'Rahul',           'Credit', 12640.00, 1928.00, 'Due',  '2026-08-12');

INSERT INTO invoice_items (invoice_id, product_id, name, quantity, unit, price) VALUES
  ('INV-2481', 'p-1', 'India Gate Sona Masoori Rice', 600, 'kg', 75.00),
  ('INV-2480', 'p-2', 'Fortune Sunflower Oil',         80, 'L',  150.00),
  ('INV-2480', 'p-3', 'Aashirvaad Sharbati Atta',      40, 'kg', 56.00);

-- Receivables.
INSERT INTO receivables (id, branch_id, customer, amount, due_date, phone, status, invoice_id) VALUES
  ('rec-1', 'branch-1', 'Mahaveer Stores',          47800.00, '2026-07-15', '+91 98450 12345', 'overdue', 'INV-2481'),
  ('rec-2', 'branch-1', 'Sunil Traders',            84200.00, '2026-07-20', '+91 99001 88776', 'overdue', NULL),
  ('rec-3', 'branch-1', 'Ramesh G.',                35000.00, '2026-08-05', '+91 98455 22334', 'pending', NULL),
  ('rec-4', 'branch-1', 'Rahul (Standard Retail)',  51300.00, '2026-08-12', '+91 91234 56789', 'pending', 'INV-2480');

-- Payables (suppliers).
INSERT INTO payables (id, branch_id, supplier, amount, due_date, supplier_type, status) VALUES
  ('pay-1', 'branch-1', 'Annapoorna Distributors', 112000.00, '2026-08-05', 'Rice & Staples Supplier', 'pending'),
  ('pay-2', 'branch-1', 'Sunrise Edible Oils',      85000.00, '2026-08-08', 'Oil Supplier',            'pending'),
  ('pay-3', 'branch-1', 'Golden Sugar Mill',        48000.00, '2026-08-15', 'Sugar Supplier',          'pending');

-- Bookings.
INSERT INTO bookings (id, branch_id, customer, product_id, quantity, unit, booking_date, delivery_date, advance, status) VALUES
  ('bk-1', 'branch-1', 'Mahaveer Stores', 'p-1', 150, 'kg', '2026-07-30', '2026-08-05', 2000.00, 'pending'),
  ('bk-2', 'branch-1', 'Sunil Traders',   'p-2', 30,  'L',  '2026-07-29', '2026-08-02', 3000.00, 'ready');

-- AI alerts / priorities.
INSERT INTO alerts (id, branch_id, type, title, description, severity, resolved) VALUES
  ('action-1', 'branch-1', 'overdue', 'Follow up on ₹84,200',                  '3 customers are overdue by 15+ days',                            'high', FALSE),
  ('action-2', 'branch-1', 'stock',   'Restock India Gate Rice',               'Only 6 days of stock remaining (below safety limit of 8 days)',  'med',  FALSE),
  ('action-3', 'branch-1', 'audit',   'Review unusual payment',                '₹28,500 paid twice to one vendor',                               'high', FALSE),
  ('action-4', 'branch-1', 'stock',   'Restock Tata Sampann Toor Dal (1 kg)',  'Stock 60 is below safety limit of 80',                           'high', FALSE),
  ('action-5', 'branch-1', 'stock',   'Restock Amul Butter (500 g)',           'Stock 12 is below safety limit of 15',                           'med',  FALSE),
  ('action-6', 'branch-1', 'stock',   'Restock Maggi Masala Noodles (12-pack)','Stock 50 is below safety limit of 80',                           'med',  FALSE),
  ('action-7', 'branch-1', 'stock',   'Restock Nescafé Classic (100 g)',       'Stock 45 is below safety limit of 60',                           'med',  FALSE);

-- Business memory.
INSERT INTO business_memory (branch_id, category, title, details) VALUES
  ('branch-1', 'customer', 'Customer Memory: Rahul',
   jsonb_build_array('Rahul purchases India Gate Sona Masoori Rice and Fortune Sunflower Oil every month.',
                     'Prefers premium products; responds well to early-bird festival discounts.',
                     'Negotiates discounts often; delayed payment twice (average 9 days late).')),
  ('branch-1', 'invoice', 'Invoice Memory: GST Outstandings',
   jsonb_build_array('Total unpaid invoices: 12 invoices totaling ₹2,18,300.',
                     'GST liability on these invoices is ₹39,294 (18% slab).')),
  ('branch-1', 'product', 'Product Profitability: India Gate Rice',
   jsonb_build_array('Top selling SKU by volume. Monthly margin: 12.8%.',
                     'Purchase price increased by 8% from supplier (Annapoorna).',
                     'Recommendation: raise retail price by ₹3/kg to maintain margin, or switch to supplier B.')),
  ('branch-1', 'supplier', 'Supplier Performance: Annapoorna Distributors',
   jsonb_build_array('Primary supplier for rice and grains. Total purchases this month: ₹4,20,000.',
                     'Lead time: 5 days average. Delivery accuracy: 98%.',
                     'Payment terms: Net 15. Standard price markup is 1.1x cost.'));

-- Sample audit trail entries.
INSERT INTO audits (event, user_id, branch_id, ip, details) VALUES
  ('auth.login',           'user-1', 'branch-1', '192.168.0.102', jsonb_build_object('username', '1', 'role', 'admin')),
  ('branch.clone',         'user-1', 'branch-1', '192.168.0.102', jsonb_build_object('newBranchId', 'branch-2')),
  ('invoice.create',       'user-1', 'branch-1', '192.168.0.102', jsonb_build_object('invoiceId', 'INV-2481', 'total', 47800)),
  ('payment.reconcile',    'user-1', 'branch-1', '192.168.0.102', jsonb_build_object('upi', true, 'amount', 47800)),
  ('branch.access.denied', NULL,     NULL,       '203.0.113.7',  jsonb_build_object('reason', 'no access rights'));

-- Sample inventory ledger.
INSERT INTO inventory_transactions (branch_id, product_id, type, quantity, unit, ref_id, created_by) VALUES
  ('branch-1', 'p-1', 'purchase',    500, 'kg', NULL,       'user-1'),
  ('branch-1', 'p-1', 'sale',       -600, 'kg', 'INV-2481', 'user-1'),
  ('branch-1', 'p-2', 'sale',        -80, 'L',  'INV-2480', 'user-1'),
  ('branch-1', 'p-3', 'sale',        -40, 'kg', 'INV-2480', 'user-1'),
  ('branch-1', 'p-4', 'adjustment',   -5, 'kg', NULL,       'user-1');

-- =============================================================================
-- USEFUL REPORTING VIEWS
-- =============================================================================

-- Low stock items (below safety limit) = what AI Inventory Analyst flags daily.
CREATE OR REPLACE VIEW v_low_stock AS
  SELECT p.branch_id, p.id AS product_id, p.name, p.stock, p.safety_limit,
         ROUND(p.stock - p.safety_limit, 2) AS buffer, p.unit
  FROM products p
  WHERE p.stock < p.safety_limit
  ORDER BY buffer ASC;

-- Receivables ageing (overdue beyond due date).
CREATE OR REPLACE VIEW v_overdue_receivables AS
  SELECT r.branch_id, r.customer, r.amount, r.due_date,
         (CURRENT_DATE - r.due_date) AS days_overdue
  FROM receivables r
  WHERE r.status = 'pending' AND r.due_date < CURRENT_DATE
  ORDER BY days_overdue DESC;

-- Margin per SKU = (price - cost) / price.
CREATE OR REPLACE VIEW v_product_margins AS
  SELECT p.id AS product_id, p.name, p.price, p.cost,
         ROUND((p.price - p.cost) / p.price * 100, 2) AS margin_pct
  FROM products p
  ORDER BY margin_pct ASC;

COMMIT;

-- =============================================================================
-- ROW LEVEL SECURITY (fresh installs)
-- -----------------------------------------------------------------------------
-- Grant the anon/publishable API key full CRUD on app data tables so the web
-- app can live-fetch and persist. Permissive by design for a demo prototype.
-- For existing deployments run database/rls.sql instead (idempotent).
-- =============================================================================

DO $$
DECLARE
  t text;
  app_tables text[] := ARRAY[
    'branches',
    'branch_users',
    'products',
    'inventory_transactions',
    'invoices',
    'invoice_items',
    'receivables',
    'payables',
    'bookings',
    'alerts',
    'audits',
    'business_memory'
  ];
BEGIN
  FOREACH t IN ARRAY app_tables
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_all_%s" ON %I;', t, t);
    EXECUTE format(
      'CREATE POLICY "anon_all_%s" ON %I FOR ALL TO anon USING (true) WITH CHECK (true);',
      t, t
    );
  END LOOP;
END $$;
