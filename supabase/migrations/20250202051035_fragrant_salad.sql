-- Drop existing settings tables to start fresh
DROP TABLE IF EXISTS store_settings CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;

-- Create store_settings table
CREATE TABLE store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text NOT NULL DEFAULT 'DINITECH Store',
  store_description text,
  store_logo_url text,
  store_banner_url text,
  store_email text,
  store_phone text,
  store_address text,
  store_enabled boolean NOT NULL DEFAULT true,
  allow_guest_checkout boolean NOT NULL DEFAULT false,
  show_out_of_stock boolean NOT NULL DEFAULT true,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  order_statuses jsonb DEFAULT '[
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded"
  ]'::jsonb,
  shipping_zones jsonb DEFAULT '[
    {
      "name": "Antananarivo",
      "fee": 5000,
      "min_delivery_days": 1,
      "max_delivery_days": 2
    },
    {
      "name": "Province",
      "fee": 10000,
      "min_delivery_days": 3,
      "max_delivery_days": 5
    }
  ]'::jsonb,
  product_categories jsonb DEFAULT '[
    {
      "id": "streaming",
      "name": "Streaming",
      "description": "Abonnements et accessoires streaming"
    },
    {
      "id": "accessories",
      "name": "Accessoires",
      "description": "Accessoires informatiques et electroniques"
    },
    {
      "id": "services",
      "name": "Services",
      "description": "Services installation et support"
    }
  ]'::jsonb,
  featured_products jsonb DEFAULT '[]'::jsonb,
  seo_settings jsonb DEFAULT '{
    "title": "DINITECH Store - Votre partenaire streaming et technologie",
    "description": "Decouvrez notre selection de produits et services streaming et high-tech",
    "keywords": ["streaming", "netflix", "disney+", "prime video", "accessoires", "informatique"]
  }'::jsonb,
  social_links jsonb DEFAULT '{
    "facebook": "https://facebook.com/dinitech",
    "instagram": "https://instagram.com/dinitech",
    "whatsapp": "+261341234567"
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create app_settings table
CREATE TABLE app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'DINITECH',
  site_description text DEFAULT 'Votre partenaire streaming et technologie',
  contact_email text DEFAULT 'contact@dinitech.mg',
  contact_phone text DEFAULT '+261 34 12 345 67',
  address text DEFAULT 'Antananarivo, Madagascar',
  currency text NOT NULL DEFAULT 'MGA',
  currency_symbol text NOT NULL DEFAULT 'Ar',
  tax_rate numeric NOT NULL DEFAULT 20,
  shipping_fee numeric NOT NULL DEFAULT 5000,
  min_order_amount numeric NOT NULL DEFAULT 10000,
  max_order_amount numeric NOT NULL DEFAULT 1000000,
  order_prefix text NOT NULL DEFAULT 'CMD',
  invoice_prefix text NOT NULL DEFAULT 'FAC',
  social_media jsonb DEFAULT '{
    "facebook": "https://facebook.com/dinitech",
    "instagram": "https://instagram.com/dinitech",
    "whatsapp": "+261341234567"
  }'::jsonb,
  payment_methods jsonb DEFAULT '{
    "cash": true,
    "mobile_money": true,
    "bank_transfer": true
  }'::jsonb,
  mobile_money_numbers jsonb DEFAULT '{
    "orange": ["+261320000001", "+261320000002"],
    "airtel": ["+261330000001", "+261330000002"],
    "telma": ["+261340000001", "+261340000002"]
  }'::jsonb,
  bank_accounts jsonb DEFAULT '[
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
  business_hours jsonb DEFAULT '[
    {"day": "Lundi", "open": "08:00", "close": "17:00", "closed": false},
    {"day": "Mardi", "open": "08:00", "close": "17:00", "closed": false},
    {"day": "Mercredi", "open": "08:00", "close": "17:00", "closed": false},
    {"day": "Jeudi", "open": "08:00", "close": "17:00", "closed": false},
    {"day": "Vendredi", "open": "08:00", "close": "17:00", "closed": false},
    {"day": "Samedi", "open": "08:00", "close": "12:00", "closed": false},
    {"day": "Dimanche", "open": "00:00", "close": "00:00", "closed": true}
  ]'::jsonb,
  maintenance_mode boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Les administrateurs peuvent gerer les parametres de la boutique"
  ON store_settings FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Les administrateurs peuvent gerer les parametres"
  ON app_settings FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Insert initial data
INSERT INTO store_settings DEFAULT VALUES;
INSERT INTO app_settings DEFAULT VALUES;
