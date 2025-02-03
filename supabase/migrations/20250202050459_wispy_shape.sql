-- Insérer les données initiales dans app_settings si elles n'existent pas
INSERT INTO app_settings (
  site_name,
  site_description,
  contact_email,
  contact_phone,
  address,
  currency,
  currency_symbol,
  tax_rate,
  shipping_fee,
  min_order_amount,
  max_order_amount,
  order_prefix,
  invoice_prefix,
  social_media,
  payment_methods,
  mobile_money_numbers,
  bank_accounts,
  business_hours,
  maintenance_mode
) 
SELECT
  'DINITECH',
  'Votre partenaire streaming et technologie',
  'contact@dinitech.mg',
  '+261 34 12 345 67',
  'Antananarivo, Madagascar',
  'MGA',
  'Ar',
  20,
  5000,
  10000,
  1000000,
  'CMD',
  'FAC',
  '{"facebook": "https://facebook.com/dinitech", "instagram": "https://instagram.com/dinitech", "whatsapp": "+261341234567"}'::jsonb,
  '{"cash": true, "mobile_money": true, "bank_transfer": true}'::jsonb,
  '{
    "orange": ["+261320000001", "+261320000002"],
    "airtel": ["+261330000001", "+261330000002"],
    "telma": ["+261340000001", "+261340000002"]
  }'::jsonb,
  '[
    {
      "bank_name": "BNI Madagascar",
      "account_name": "DINITECH SARL",
      "account_number": "00000 00000 00000000000 00"
    },
    {
      "bank_name": "BOA Madagascar",
      "account_name": "DINITECH SARL",
      "account_number": "00000 00000 00000000000 00"
    }
  ]'::jsonb,
  '[
    {"day": "Lundi", "open": "08:00", "close": "17:00", "closed": false},
    {"day": "Mardi", "open": "08:00", "close": "17:00", "closed": false},
    {"day": "Mercredi", "open": "08:00", "close": "17:00", "closed": false},
    {"day": "Jeudi", "open": "08:00", "close": "17:00", "closed": false},
    {"day": "Vendredi", "open": "08:00", "close": "17:00", "closed": false},
    {"day": "Samedi", "open": "08:00", "close": "12:00", "closed": false},
    {"day": "Dimanche", "open": "00:00", "close": "00:00", "closed": true}
  ]'::jsonb,
  false
WHERE NOT EXISTS (SELECT 1 FROM app_settings);
