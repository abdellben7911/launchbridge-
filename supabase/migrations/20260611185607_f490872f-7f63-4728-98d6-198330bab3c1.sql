CREATE OR REPLACE FUNCTION public.enforce_client_messages_update_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_staff(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF NEW.order_id IS DISTINCT FROM OLD.order_id
     OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
     OR NEW.content IS DISTINCT FROM OLD.content
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Clients may only update is_read/read_at on messages';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_client_messages_update_columns ON public.messages;
CREATE TRIGGER trg_enforce_client_messages_update_columns
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.enforce_client_messages_update_columns();