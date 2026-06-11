CREATE OR REPLACE FUNCTION public.enforce_client_order_insert_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_staff(auth.uid()) THEN
    RETURN NEW;
  END IF;
  -- Force client_id to the authenticated user
  NEW.client_id := auth.uid();
  -- Reset sensitive workflow/payment fields to safe defaults
  NEW.status := 'pending_payment';
  NEW.payment_status := 'unpaid';
  NEW.paid_at := NULL;
  NEW.amount_paid := NULL;
  NEW.stripe_payment_intent := NULL;
  NEW.filed_at := NULL;
  NEW.ein_received_at := NULL;
  NEW.banking_done_at := NULL;
  NEW.completed_at := NULL;
  NEW.submitted_at := NULL;
  NEW.assigned_to := NULL;
  NEW.admin_notes := NULL;
  NEW.order_number := NULL;
  -- Reset pricing fields; staff/server will set authoritative amounts
  NEW.amount_paid := NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_client_order_insert_defaults_trg ON public.orders;
CREATE TRIGGER enforce_client_order_insert_defaults_trg
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.enforce_client_order_insert_defaults();