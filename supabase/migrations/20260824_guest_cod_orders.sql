-- Guest COD checkout support
-- Run in Supabase SQL Editor or via migrations

ALTER TABLE orders
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE orders
  ALTER COLUMN shipping_address_id DROP NOT NULL;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS guest_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_phone TEXT,
  ADD COLUMN IF NOT EXISTS shipping_street TEXT,
  ADD COLUMN IF NOT EXISTS shipping_city TEXT,
  ADD COLUMN IF NOT EXISTS shipping_notes TEXT,
  ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC DEFAULT 0;

COMMENT ON COLUMN orders.guest_name IS 'Guest checkout full name when user_id is null';
COMMENT ON COLUMN orders.guest_phone IS 'Guest checkout phone (Pakistan)';
COMMENT ON COLUMN orders.shipping_street IS 'Snapshot street for guest COD orders';
COMMENT ON COLUMN orders.shipping_city IS 'Snapshot city for guest COD orders';
