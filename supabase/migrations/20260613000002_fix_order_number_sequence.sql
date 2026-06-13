-- Fix duplicate order_number: replace count(*)+1 with an atomic sequence
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  year_str text := to_char(now(), 'YYYY');
  seq int;
BEGIN
  IF new.order_number IS NULL THEN
    seq := nextval('public.order_number_seq');
    new.order_number := 'LB-' || year_str || '-' || lpad(seq::text, 4, '0');
  END IF;
  RETURN new;
END;
$$;
