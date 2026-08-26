-- Add show_theme_toggle column to store_settings
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS show_theme_toggle boolean NOT NULL DEFAULT true;
