-- Product visibility, sale tag, and condition badge
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_sale_tag boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS badge text NOT NULL DEFAULT 'used';

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_badge_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_badge_check CHECK (badge = ANY (ARRAY['new'::text, 'used'::text]));

-- Category visibility
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;

-- Public only sees visible products; admins still see all via manage policy
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products"
  ON public.products
  FOR SELECT
  USING (is_visible = true);

-- Public only sees visible categories
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories"
  ON public.categories
  FOR SELECT
  USING (is_visible = true);

-- Admins can manage categories (CRUD)
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories"
  ON public.categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.profile_id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.profile_id = auth.uid() AND p.role = 'admin'
    )
  );
