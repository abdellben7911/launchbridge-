-- Intake fields on orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS intake jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS preferred_channel text,
  ADD COLUMN IF NOT EXISTS preferred_contact_time text;

-- Extra profile fields used by checkout intake
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS address_country text,
  ADD COLUMN IF NOT EXISTS id_type text;

-- Updated-at trigger on orders (if not present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'orders_set_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION public.set_updated_at()
    RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $f$
    BEGIN NEW.updated_at = now(); RETURN NEW; END;
    $f$;
    CREATE TRIGGER orders_set_updated_at
      BEFORE UPDATE ON public.orders
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END$$;

-- Enable Realtime (idempotent)
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['orders','order_timeline','documents','messages'] LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END$$;

-- Ensure replica identity full so payload includes old rows for filters
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_timeline REPLICA IDENTITY FULL;
ALTER TABLE public.documents REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;