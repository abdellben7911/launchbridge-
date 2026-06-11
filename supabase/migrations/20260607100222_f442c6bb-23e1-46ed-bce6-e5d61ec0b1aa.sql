
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS us_state text,
  ADD COLUMN IF NOT EXISTS tier text,
  ADD COLUMN IF NOT EXISTS price_mad numeric,
  ADD COLUMN IF NOT EXISTS original_price_mad numeric,
  ADD COLUMN IF NOT EXISTS delivery_days integer,
  ADD COLUMN IF NOT EXISTS badge_key text,
  ADD COLUMN IF NOT EXISTS group_key text;

GRANT SELECT ON public.services TO anon;
GRANT SELECT ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
