-- Toggle visibility of New/Used condition badge on storefront
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS show_badge boolean NOT NULL DEFAULT true;
