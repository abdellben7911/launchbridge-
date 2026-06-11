
-- 1. Orders: add workspace fields
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS workspace_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS workspace_status TEXT NOT NULL DEFAULT 'active';

-- Allow clients to update workspace_name / workspace_status on their own orders
CREATE OR REPLACE FUNCTION public.enforce_client_order_update_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    RAISE EXCEPTION 'Clients may only update client_notes, workspace_name, and workspace_status';
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MAD',
  status TEXT NOT NULL DEFAULT 'paid',
  pdf_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients see own invoices" ON public.invoices FOR SELECT
  USING (client_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "staff write invoices" ON public.invoices FOR ALL
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 3. Renewals
CREATE TABLE IF NOT EXISTS public.renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'upcoming',
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.renewals TO authenticated;
GRANT ALL ON public.renewals TO service_role;
ALTER TABLE public.renewals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients see own renewals" ON public.renewals FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.client_id = auth.uid()) OR public.is_staff(auth.uid()));
CREATE POLICY "staff write renewals" ON public.renewals FOR ALL
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 4. Banking accounts
CREATE TABLE IF NOT EXISTS public.banking_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  account_number_masked TEXT,
  balance_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  card_last_four TEXT,
  card_status TEXT NOT NULL DEFAULT 'not_issued',
  app_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banking_accounts TO authenticated;
GRANT ALL ON public.banking_accounts TO service_role;
ALTER TABLE public.banking_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients see own banking" ON public.banking_accounts FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.client_id = auth.uid()) OR public.is_staff(auth.uid()));
CREATE POLICY "staff write banking" ON public.banking_accounts FOR ALL
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 5. Banking transactions
CREATE TABLE IF NOT EXISTS public.banking_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.banking_accounts(id) ON DELETE CASCADE,
  direction TEXT NOT NULL DEFAULT 'in',
  description TEXT NOT NULL,
  amount_usd NUMERIC(12,2) NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banking_transactions TO authenticated;
GRANT ALL ON public.banking_transactions TO service_role;
ALTER TABLE public.banking_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients see own transactions" ON public.banking_transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.banking_accounts ba
    JOIN public.orders o ON o.id = ba.order_id
    WHERE ba.id = account_id AND o.client_id = auth.uid()
  ) OR public.is_staff(auth.uid()));
CREATE POLICY "staff write transactions" ON public.banking_transactions FOR ALL
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 6. Store items (catalog — all authenticated users can read)
CREATE TABLE IF NOT EXISTS public.store_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_fr TEXT,
  name_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  description_ar TEXT,
  category TEXT NOT NULL,
  price_mad NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_items TO authenticated;
GRANT ALL ON public.store_items TO service_role;
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all authenticated read active items" ON public.store_items FOR SELECT
  USING (is_active = true OR public.is_staff(auth.uid()));
CREATE POLICY "staff write store items" ON public.store_items FOR ALL
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 7. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients see own notifications" ON public.notifications FOR SELECT
  USING (client_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "clients update own notifications" ON public.notifications FOR UPDATE
  USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
CREATE POLICY "staff write notifications" ON public.notifications FOR INSERT
  WITH CHECK (public.is_staff(auth.uid()));
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 8. Notification preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  client_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  gateway_email BOOLEAN NOT NULL DEFAULT true,
  gateway_whatsapp BOOLEAN NOT NULL DEFAULT true,
  documents_email BOOLEAN NOT NULL DEFAULT true,
  compliance_email BOOLEAN NOT NULL DEFAULT true,
  compliance_whatsapp BOOLEAN NOT NULL DEFAULT false,
  academy_email BOOLEAN NOT NULL DEFAULT true,
  marketing_email BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients manage own prefs" ON public.notification_preferences FOR ALL
  USING (client_id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (client_id = auth.uid() OR public.is_staff(auth.uid()));

-- 9. Compliance events
CREATE TABLE IF NOT EXISTS public.compliance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliance_events TO authenticated;
GRANT ALL ON public.compliance_events TO service_role;
ALTER TABLE public.compliance_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients see own compliance" ON public.compliance_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.client_id = auth.uid()) OR public.is_staff(auth.uid()));
CREATE POLICY "staff write compliance" ON public.compliance_events FOR ALL
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 10. Course enrollments
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL,
  progress_pct INT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, course_slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_enrollments TO authenticated;
GRANT ALL ON public.course_enrollments TO service_role;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients manage own enrollments" ON public.course_enrollments FOR ALL
  USING (client_id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (client_id = auth.uid() OR public.is_staff(auth.uid()));

-- Seed store items (idempotent on (name_en, category))
INSERT INTO public.store_items (name_en, name_fr, name_ar, category, price_mad, sort_order) VALUES
('New LLC Formation','Création LLC','تأسيس LLC جديدة','formation',1299,1),
('EIN Fast-track (7 days)','EIN accéléré (7 jours)','EIN سريع (7 أيام)','formation',499,2),
('DBA / Trade Name','Nom commercial DBA','اسم تجاري DBA','formation',399,3),
('Additional Stripe Account','Compte Stripe supplémentaire','حساب Stripe إضافي','gateway',299,1),
('Square Activation','Activation Square','تفعيل Square','gateway',199,2),
('Etsy Payments Setup','Configuration Etsy Payments','إعداد Etsy Payments','gateway',249,3),
('Amazon Seller Activation','Activation Amazon Seller','تفعيل Amazon Seller','gateway',349,4),
('Professional Website','Site web professionnel','موقع إلكتروني احترافي','growth',1200,1),
('Shopify Store Setup','Configuration Shopify','إعداد متجر Shopify','growth',899,2),
('SEO Starter Package','Pack SEO démarrage','باقة SEO للمبتدئين','growth',799,3),
('Meta Ads Setup + 30 days','Meta Ads + 30 jours','إعداد Meta Ads + 30 يوم','growth',1500,4),
('Google Ads Setup','Configuration Google Ads','إعداد Google Ads','growth',999,5),
('Annual Report Filing','Dépôt rapport annuel','إيداع التقرير السنوي','compliance',320,1),
('Registered Agent Renewal','Renouvellement agent','تجديد الوكيل المسجل','compliance',590,2),
('Trademark Registration','Enregistrement marque','تسجيل العلامة التجارية','compliance',1499,3),
('Form 5472 Filing','Dépôt Form 5472','إيداع Form 5472','compliance',699,4),
('LLC Dissolution','Dissolution LLC','إغلاق LLC','compliance',499,5),
('Dropshipping Mastery Course','Formation Dropshipping','دورة احتراف الدروبشيبينغ','academy',499,1),
('Meta Ads for E-com Course','Formation Meta Ads E-com','دورة Meta Ads للتجارة','academy',599,2),
('1-on-1 Coaching (1 month)','Coaching individuel (1 mois)','تدريب فردي (شهر)','academy',2000,3)
ON CONFLICT DO NOTHING;
