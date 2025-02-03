-- Check if store_settings table exists and drop if needed
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'store_settings') THEN
    DROP TABLE store_settings CASCADE;
  END IF;
END $$;

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

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'store_settings' 
    AND policyname = 'Les administrateurs peuvent gerer les parametres de la boutique'
  ) THEN
    CREATE POLICY "Les administrateurs peuvent gerer les parametres de la boutique"
      ON store_settings FOR ALL
      TO authenticated
      USING (auth.jwt() ->> 'role' = 'admin')
      WITH CHECK (auth.jwt() ->> 'role' = 'admin');
  END IF;
END $$;

-- Insert initial data if not exists
INSERT INTO store_settings DEFAULT VALUES
ON CONFLICT DO NOTHING;
