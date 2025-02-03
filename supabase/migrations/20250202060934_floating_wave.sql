-- Drop existing constraints and data
DROP TABLE IF EXISTS store_settings CASCADE;

-- Recreate the table with a fixed primary key
CREATE TABLE store_settings (
  id uuid PRIMARY KEY DEFAULT 'c3d5e1f2-1234-5678-90ab-cdef01234567'::uuid,
  store_name text NOT NULL DEFAULT 'Boutik''nakà',
  store_description text DEFAULT 'Service d''achat en ligne à Mada',
  store_logo_url text DEFAULT 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  store_banner_url text,
  store_email text DEFAULT 'contact@boutiknaka.mg',
  store_phone text DEFAULT '+261 34 12 345 67',
  store_address text DEFAULT 'Antananarivo, Madagascar',
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
    "title": "Boutik''nakà - Service d''achat en ligne à Madagascar",
    "description": "Découvrez notre sélection de produits et services à Madagascar",
    "keywords": ["boutique", "madagascar", "e-commerce", "shopping"]
  }'::jsonb,
  social_links jsonb DEFAULT '{
    "facebook": "https://facebook.com/boutiknaka",
    "instagram": "https://instagram.com/boutiknaka",
    "whatsapp": "+261341234567"
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Tout le monde peut lire les paramètres de la boutique"
  ON store_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Les administrateurs peuvent modifier les paramètres de la boutique"
  ON store_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert the default row
INSERT INTO store_settings (id) VALUES ('c3d5e1f2-1234-5678-90ab-cdef01234567');

-- Add a trigger to prevent multiple rows
CREATE OR REPLACE FUNCTION prevent_multiple_store_settings()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM store_settings) > 0 THEN
    RAISE EXCEPTION 'Only one row is allowed in store_settings table';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_store_settings
  BEFORE INSERT ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION prevent_multiple_store_settings();