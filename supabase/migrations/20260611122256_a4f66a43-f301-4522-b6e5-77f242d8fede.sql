
-- 1) course_enrollments: split client ALL policy into SELECT-only; staff retain full access
DROP POLICY IF EXISTS "clients manage own enrollments" ON public.course_enrollments;

CREATE POLICY "clients view own enrollments"
ON public.course_enrollments
FOR SELECT
TO authenticated
USING (client_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "staff manage enrollments"
ON public.course_enrollments
FOR ALL
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

-- 2) notifications: trigger restricting client updates to is_read / read_at only
CREATE OR REPLACE FUNCTION public.enforce_client_notifications_update_columns()
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
     OR NEW.order_id IS DISTINCT FROM OLD.order_id
     OR NEW.type IS DISTINCT FROM OLD.type
     OR NEW.title IS DISTINCT FROM OLD.title
     OR NEW.body IS DISTINCT FROM OLD.body
     OR NEW.action_url IS DISTINCT FROM OLD.action_url
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Clients may only update is_read on notifications';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_client_notifications_update_columns ON public.notifications;
CREATE TRIGGER enforce_client_notifications_update_columns
BEFORE UPDATE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.enforce_client_notifications_update_columns();

-- 3) orders: ensure existing column-restriction trigger is wired up
DROP TRIGGER IF EXISTS enforce_client_order_update_columns ON public.orders;
CREATE TRIGGER enforce_client_order_update_columns
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_client_order_update_columns();

DROP TRIGGER IF EXISTS enforce_client_order_insert_defaults ON public.orders;
CREATE TRIGGER enforce_client_order_insert_defaults
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_client_order_insert_defaults();
