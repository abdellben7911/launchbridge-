-- Seed store_items: LaunchBridge add-on services
INSERT INTO public.store_items
  (name_en, name_fr, name_ar, description_en, description_fr, description_ar, category, price_mad, is_active, sort_order)
VALUES

-- FORMATION ADD-ONS
(
  'EIN / Federal Tax ID (Standalone)',
  'EIN / Numéro fiscal fédéral (autonome)',
  'رقم التعريف الضريبي الفيدرالي (مستقل)',
  'Get your US Employer Identification Number filed with the IRS. Required to open US bank accounts and activate Stripe or PayPal.',
  'Obtenez votre numéro d''identification fiscale américain déposé auprès de l''IRS. Requis pour ouvrir des comptes bancaires américains.',
  'احصل على رقم التعريف الضريبي الأمريكي المُسجّل لدى دائرة الإيرادات الداخلية. مطلوب لفتح الحسابات المصرفية وتفعيل Stripe.',
  'formation',
  499,
  true,
  1
),
(
  'Registered Agent (1 year)',
  'Agent enregistré (1 an)',
  'وكيل مسجّل (سنة واحدة)',
  'Maintain your LLC good standing with a US registered agent for one year. Receives legal notices and state correspondence on your behalf.',
  'Maintenez votre LLC en règle avec un agent enregistré américain pendant un an. Reçoit les avis juridiques en votre nom.',
  'حافظ على حالة شركتك القانونية مع وكيل مسجّل أمريكي لمدة سنة كاملة. يستقبل الإخطارات القانونية نيابةً عنك.',
  'formation',
  699,
  true,
  2
),
(
  'Annual Report Filing',
  'Dépôt du rapport annuel',
  'تقديم التقرير السنوي',
  'We file your annual report with the state on your behalf, keeping your LLC compliant and in good standing. Includes state fees.',
  'Nous déposons votre rapport annuel auprès de l''État en votre nom, maintenant votre LLC conforme et en règle. Frais d''État inclus.',
  'نقوم بتقديم تقريرك السنوي إلى الولاية نيابةً عنك للحفاظ على امتثال شركتك. تشمل رسوم الولاية.',
  'compliance',
  799,
  true,
  3
),

-- PAYMENT GATEWAYS
(
  'Stripe Setup',
  'Configuration Stripe',
  'إعداد Stripe',
  'Full Stripe account setup under your US LLC: identity verification, bank linking, live mode activation, and webhook configuration.',
  'Configuration complète de compte Stripe sous votre LLC américaine : vérification d''identité, liaison bancaire, activation du mode live.',
  'إعداد حساب Stripe الكامل تحت شركتك الأمريكية: التحقق من الهوية، ربط البنك، تفعيل وضع الإنتاج.',
  'gateways',
  599,
  true,
  4
),
(
  'PayPal Business Setup',
  'Configuration PayPal Business',
  'إعداد PayPal Business',
  'PayPal Business account opened and verified under your US LLC. Enables international transfers, invoicing, and checkout integration.',
  'Compte PayPal Business ouvert et vérifié sous votre LLC américaine. Permet les virements internationaux et l''intégration checkout.',
  'فتح حساب PayPal Business وتوثيقه تحت شركتك الأمريكية. يتيح التحويلات الدولية وتكامل نقطة البيع.',
  'gateways',
  499,
  true,
  5
),
(
  'Wise Business Account',
  'Compte Wise Business',
  'حساب Wise Business',
  'Wise Business multi-currency account linked to your LLC. Receive in USD, EUR, GBP and convert at real exchange rates.',
  'Compte multi-devises Wise Business lié à votre LLC. Recevez en USD, EUR, GBP et convertissez aux vrais taux de change.',
  'حساب Wise Business متعدد العملات مرتبط بشركتك. استقبل المدفوعات بالدولار واليورو والجنيه الإسترليني.',
  'gateways',
  499,
  true,
  6
),
(
  'Mercury US Bank Account',
  'Compte bancaire Mercury (USA)',
  'حساب بنك Mercury الأمريكي',
  'Mercury US business checking account opened remotely. Comes with routing + account number, debit card, and ACH/wire access.',
  'Compte courant Mercury ouvert à distance. Livré avec numéro de routage, numéro de compte, carte de débit et accès ACH/virement.',
  'فتح حساب Mercury المصرفي الأمريكي عن بُعد. يأتي برقم التوجيه والحساب وبطاقة الخصم والوصول إلى التحويلات.',
  'banking',
  699,
  true,
  7
),
(
  'Payoneer Business Account',
  'Compte Payoneer Business',
  'حساب Payoneer Business',
  'Payoneer Business account setup for cross-border payments, marketplace withdrawals (Amazon, Fiverr, Upwork), and mass payouts.',
  'Configuration du compte Payoneer pour les paiements transfrontaliers, retraits de marketplace et paiements de masse.',
  'إعداد حساب Payoneer للمدفوعات العابرة للحدود وسحب الأرباح من المنصات (أمازون، فايفر، أبورك).',
  'gateways',
  399,
  true,
  8
),
(
  'Airwallex Account',
  'Compte Airwallex',
  'حساب Airwallex',
  'Airwallex global account for receiving payments in 23+ currencies, with local account numbers in US, EU, UK, AU, and HK.',
  'Compte global Airwallex pour recevoir des paiements dans 23+ devises avec des numéros de compte locaux aux USA, UE, UK.',
  'حساب Airwallex العالمي لاستقبال المدفوعات بأكثر من 23 عملة مع أرقام حسابات محلية في الولايات المتحدة وأوروبا.',
  'banking',
  499,
  true,
  9
),

-- SHOPIFY & E-COMMERCE
(
  'Shopify Store Setup',
  'Configuration boutique Shopify',
  'إعداد متجر Shopify',
  'Full Shopify store provisioned: theme, products imported, Stripe payments connected, and store published and ready to sell.',
  'Boutique Shopify complète : thème, produits importés, paiements Stripe connectés et boutique publiée prête à vendre.',
  'متجر Shopify كامل: قالب، استيراد المنتجات، ربط مدفوعات Stripe، ونشر المتجر جاهزًا للبيع.',
  'ecommerce',
  1499,
  true,
  10
),
(
  'Shopify Payments Activation',
  'Activation Shopify Payments',
  'تفعيل Shopify Payments',
  'Activate Shopify Payments (powered by Stripe) on your existing Shopify store to eliminate third-party transaction fees.',
  'Activez Shopify Payments (propulsé par Stripe) sur votre boutique pour éliminer les frais de transaction tiers.',
  'تفعيل Shopify Payments (مدعوم من Stripe) على متجرك الحالي للتخلص من رسوم المعاملات الخارجية.',
  'ecommerce',
  599,
  true,
  11
),

-- WEB PRESENCE
(
  'Professional Website (5 pages)',
  'Site web professionnel (5 pages)',
  'موقع إلكتروني احترافي (5 صفحات)',
  'Conversion-optimized 5-page website: homepage, services, about, pricing, and contact. Delivered in 7 business days.',
  'Site web 5 pages optimisé pour la conversion : accueil, services, à propos, tarifs, contact. Livré en 7 jours ouvrables.',
  'موقع إلكتروني 5 صفحات محسّن للتحويل: الرئيسية، الخدمات، عن الشركة، الأسعار، التواصل. يُسلَّم في 7 أيام عمل.',
  'web',
  2999,
  true,
  12
),
(
  'Domain Registration (1 year)',
  'Enregistrement de domaine (1 an)',
  'تسجيل النطاق (سنة واحدة)',
  '.com domain registered and DNS configured for 1 year. Includes professional email setup (hello@yourdomain.com).',
  'Domaine .com enregistré et DNS configuré pour 1 an. Inclut la configuration email professionnelle.',
  'تسجيل نطاق .com وتهيئة DNS لمدة سنة. يشمل إعداد البريد الإلكتروني المهني.',
  'web',
  399,
  true,
  13
),
(
  'Professional Business Email',
  'Email professionnel',
  'بريد إلكتروني مهني',
  'Google Workspace or Zoho business email setup: hello@yourdomain.com with 30GB storage, calendar, and docs.',
  'Configuration email professionnel Google Workspace ou Zoho : hello@votredomaine.com avec 30 Go, calendrier et docs.',
  'إعداد البريد الإلكتروني المهني: hello@yourdomaine.com مع 30 جيجابايت تخزين والتقويم والمستندات.',
  'web',
  299,
  true,
  14
),

-- US PHONE
(
  'US Phone Number',
  'Numéro de téléphone américain',
  'رقم هاتف أمريكي',
  'Dedicated US phone number with call forwarding to your WhatsApp, voicemail transcription, and toll-free fallback.',
  'Numéro de téléphone américain dédié avec renvoi d''appel vers votre WhatsApp, transcription de messagerie vocale.',
  'رقم هاتف أمريكي مخصص مع تحويل المكالمات إلى WhatsApp وتحويل رسائل البريد الصوتي إلى نص.',
  'communication',
  349,
  true,
  15
),

-- COMPLIANCE & LEGAL
(
  'BOI Report Filing',
  'Dépôt du rapport BOI',
  'تقديم تقرير الملكية الفعلية',
  'Beneficial Ownership Information (BOI) report filed with FinCEN on your behalf. Required for all US LLCs formed after Jan 2024.',
  'Rapport BOI déposé auprès de FinCEN en votre nom. Obligatoire pour toutes les LLC américaines créées après jan. 2024.',
  'تقديم تقرير الملكية الفعلية إلى FinCEN نيابةً عنك. إلزامي لجميع الشركات الأمريكية المُشكَّلة بعد يناير 2024.',
  'compliance',
  599,
  true,
  16
),
(
  'IRS Form 5472 Filing',
  'Dépôt du formulaire IRS 5472',
  'تقديم نموذج IRS 5472',
  'Annual IRS Form 5472 filing for foreign-owned US LLCs. Required to maintain tax compliance and avoid $25,000 penalties.',
  'Dépôt annuel du formulaire IRS 5472 pour les LLC américaines à propriété étrangère. Requis pour éviter des pénalités de 25 000$.',
  'تقديم نموذج IRS 5472 السنوي للشركات الأمريكية المملوكة لأجانب. مطلوب لتجنب غرامات تصل إلى 25,000 دولار.',
  'compliance',
  799,
  true,
  17
),
(
  'Operating Agreement',
  'Accord d''exploitation',
  'اتفاقية التشغيل',
  'Custom Operating Agreement drafted for your LLC — defines ownership, management, profit sharing, and dissolution terms.',
  'Accord d''exploitation personnalisé rédigé pour votre LLC — définit la propriété, la gestion, le partage des bénéfices.',
  'اتفاقية تشغيل مخصصة لشركتك — تحدد الملكية والإدارة وتوزيع الأرباح وشروط الحل.',
  'legal',
  499,
  true,
  18
)

ON CONFLICT DO NOTHING;
