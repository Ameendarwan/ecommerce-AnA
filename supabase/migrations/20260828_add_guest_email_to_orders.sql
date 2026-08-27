-- Add guest_email column to orders table for sending confirmation emails
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS guest_email TEXT;

COMMENT ON COLUMN orders.guest_email IS 'Customer email address for order notifications and receipts';
