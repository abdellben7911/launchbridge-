-- Restrict Realtime channel subscriptions so authenticated users may only
-- subscribe to topics that correspond to orders they own (or staff).
-- Topic convention used by the app: `order-<order_id>` and `notif-<user_id>`.

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated can read own order/notif topics" ON realtime.messages;
CREATE POLICY "authenticated can read own order/notif topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  public.is_staff(auth.uid())
  OR (
    realtime.topic() LIKE 'order-%'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id::text = substring(realtime.topic() from 7)
        AND o.client_id = auth.uid()
    )
  )
  OR (
    realtime.topic() LIKE 'notif-%'
    AND substring(realtime.topic() from 7) = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "authenticated can write own order/notif topics" ON realtime.messages;
CREATE POLICY "authenticated can write own order/notif topics"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_staff(auth.uid())
  OR (
    realtime.topic() LIKE 'order-%'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id::text = substring(realtime.topic() from 7)
        AND o.client_id = auth.uid()
    )
  )
  OR (
    realtime.topic() LIKE 'notif-%'
    AND substring(realtime.topic() from 7) = auth.uid()::text
  )
);