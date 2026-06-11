
-- 1. Restrict client updates on orders to client_notes only via trigger
CREATE OR REPLACE FUNCTION public.enforce_client_order_update_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_staff(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF NEW.client_id IS DISTINCT FROM OLD.client_id
     OR NEW.service_id IS DISTINCT FROM OLD.service_id
     OR NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
     OR NEW.order_number IS DISTINCT FROM OLD.order_number
     OR NEW.business_name IS DISTINCT FROM OLD.business_name
     OR NEW.business_type IS DISTINCT FROM OLD.business_type
     OR NEW.us_state IS DISTINCT FROM OLD.us_state
     OR NEW.industry IS DISTINCT FROM OLD.industry
     OR NEW.business_desc IS DISTINCT FROM OLD.business_desc
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.amount_usd IS DISTINCT FROM OLD.amount_usd
     OR NEW.state_fee_usd IS DISTINCT FROM OLD.state_fee_usd
     OR NEW.total_usd IS DISTINCT FROM OLD.total_usd
     OR NEW.currency_paid IS DISTINCT FROM OLD.currency_paid
     OR NEW.amount_paid IS DISTINCT FROM OLD.amount_paid
     OR NEW.stripe_payment_intent IS DISTINCT FROM OLD.stripe_payment_intent
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.paid_at IS DISTINCT FROM OLD.paid_at
     OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at
     OR NEW.filed_at IS DISTINCT FROM OLD.filed_at
     OR NEW.ein_received_at IS DISTINCT FROM OLD.ein_received_at
     OR NEW.banking_done_at IS DISTINCT FROM OLD.banking_done_at
     OR NEW.completed_at IS DISTINCT FROM OLD.completed_at
     OR NEW.admin_notes IS DISTINCT FROM OLD.admin_notes
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Clients may only update client_notes';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_client_order_update_columns ON public.orders;
CREATE TRIGGER enforce_client_order_update_columns
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.enforce_client_order_update_columns();

-- 2. Allow avatar owners to delete their own avatars
DROP POLICY IF EXISTS "users delete own avatars" ON storage.objects;
CREATE POLICY "users delete own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_staff(auth.uid())
  )
);
