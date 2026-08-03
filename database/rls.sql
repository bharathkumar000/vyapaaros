-- =============================================================================
-- VyapaarOS - Open anon access for the app (run in Supabase SQL editor ONCE)
-- -----------------------------------------------------------------------------
-- The tables are created by database/schema.sql with row-level security ON but
-- NO policies, so the anon/publishable API key can read but NOT write. This
-- script grants the anon role full CRUD on the app's data tables so the web app
-- can live-fetch AND persist changes. It is idempotent — safe to run repeatedly.
--
-- NOTE: This is permissive by design for a demo/prototype. For production,
-- replace these policies with role-scoped policies tied to auth.uid().
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

-- =============================================================================
-- (Optional) seed check — you can verify writes are open with:
--   SELECT count(*) FROM products;
-- =============================================================================
