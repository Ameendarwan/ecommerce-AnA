-- Singleton store settings (shipping, contact, social links)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  shipping_price numeric NOT NULL DEFAULT 250,
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  hours text NOT NULL DEFAULT '',
  social_tiktok text NOT NULL DEFAULT '',
  social_youtube text NOT NULL DEFAULT '',
  social_facebook text NOT NULL DEFAULT '',
  social_instagram text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.store_settings (
  id,
  shipping_price,
  phone,
  email,
  address,
  hours,
  social_tiktok,
  social_youtube,
  social_facebook,
  social_instagram
) VALUES (
  1,
  250,
  '0310-0021434',
  'admin@thriftonia.pk',
  '',
  'Mon–Sat: 02:00 PM to 09:00 PM',
  'https://www.tiktok.com/@thriftonia',
  'https://www.youtube.com/@thriftonia',
  'https://www.facebook.com/thriftonia',
  'https://www.instagram.com/thriftonia'
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read store settings" ON public.store_settings;
CREATE POLICY "Public read store settings"
  ON public.store_settings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage store settings" ON public.store_settings;
CREATE POLICY "Admins manage store settings"
  ON public.store_settings
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
