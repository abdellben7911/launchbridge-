-- Seed services table with LLC packages
INSERT INTO services (slug, name_en, name_fr, name_ar, features, us_state, tier, price_mad, original_price_mad, price_usd, delivery_days, badge_key, group_key, sort_order, is_active)
VALUES

-- WYOMING
('wyoming-basic', 'Wyoming Basic', 'Wyoming Basic', 'وايومنغ الأساسي',
 '[{"k":"llc_creation"},{"k":"registered_agent"},{"k":"us_phone"},{"k":"ein"}]'::jsonb,
 'wyoming', 'basic', 1899, 2600, 188, 2, null, 'wyoming', 1, true),

('wyoming-ultimate', 'Wyoming Ultimate', 'Wyoming Ultimate', 'وايومنغ المتكامل',
 '[{"k":"llc_creation"},{"k":"registered_agent"},{"k":"us_phone"},{"k":"ein"},{"k":"stripe_2"},{"k":"paypal_business"},{"k":"wise_business"},{"k":"mercury_account"},{"k":"payoneer_business"},{"k":"shopify_payment"}]'::jsonb,
 'wyoming', 'ultimate', 2399, 3100, 238, 8, 'most_requested', 'wyoming', 2, true),

('wyoming-ultimate-launch', 'Wyoming Ultimate Launch', 'Wyoming Ultimate Launch', 'وايومنغ الإطلاق المتكامل',
 '[{"k":"all_ultimate"},{"k":"store_setup"},{"k":"shopify_payment"}]'::jsonb,
 'wyoming', 'ultimate_launch', 2899, 3900, 288, 12, null, 'wyoming', 3, true),

-- MONTANA
('montana-basic', 'Montana Basic', 'Montana Basic', 'مونتانا الأساسي',
 '[{"k":"llc_creation"},{"k":"registered_agent"},{"k":"us_phone"},{"k":"ein"}]'::jsonb,
 'montana', 'basic', 1299, 1700, 129, 3, null, 'montana', 4, true),

('montana-ultimate', 'Montana Ultimate', 'Montana Ultimate', 'مونتانا المتكامل',
 '[{"k":"llc_creation"},{"k":"registered_agent"},{"k":"us_phone"},{"k":"ein"},{"k":"stripe_2"},{"k":"paypal_business"},{"k":"wise_business"},{"k":"mercury_account"},{"k":"payoneer_business"},{"k":"shopify_payment"}]'::jsonb,
 'montana', 'ultimate', 1799, 2400, 178, 8, 'recommended', 'montana', 5, true),

('montana-ultimate-launch', 'Montana Ultimate Launch', 'Montana Ultimate Launch', 'مونتانا الإطلاق المتكامل',
 '[{"k":"all_ultimate"},{"k":"store_setup"},{"k":"shopify_payment"}]'::jsonb,
 'montana', 'ultimate_launch', 2299, 3100, 228, 12, null, 'montana', 6, true),

-- NEW MEXICO
('new-mexico-basic', 'New Mexico Basic', 'New Mexico Basic', 'نيو مكسيكو الأساسي',
 '[{"k":"llc_creation"},{"k":"registered_agent"},{"k":"us_phone"},{"k":"ein"}]'::jsonb,
 'new_mexico', 'basic', 1399, 2200, 139, 7, null, 'new_mexico', 7, true),

('new-mexico-ultimate', 'New Mexico Ultimate', 'New Mexico Ultimate', 'نيو مكسيكو المتكامل',
 '[{"k":"llc_creation"},{"k":"registered_agent"},{"k":"us_phone"},{"k":"ein"},{"k":"stripe_2"},{"k":"paypal_business"},{"k":"wise_business"},{"k":"mercury_account"},{"k":"payoneer_business"},{"k":"shopify_payment"}]'::jsonb,
 'new_mexico', 'ultimate', 1899, 2700, 188, 14, 'best_value', 'new_mexico', 8, true),

('new-mexico-ultimate-launch', 'New Mexico Ultimate Launch', 'New Mexico Ultimate Launch', 'نيو مكسيكو الإطلاق المتكامل',
 '[{"k":"all_ultimate"},{"k":"store_setup"},{"k":"shopify_payment"}]'::jsonb,
 'new_mexico', 'ultimate_launch', 2399, 3500, 238, 16, null, 'new_mexico', 9, true);
