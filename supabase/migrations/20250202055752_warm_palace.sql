-- Ensure we have exactly one row in store_settings
TRUNCATE TABLE store_settings;

-- Insert the default row with a fixed ID to ensure uniqueness
INSERT INTO store_settings (
  id,
  store_name,
  store_description,
  store_email,
  store_phone,
  store_address,
  store_enabled,
  allow_guest_checkout,
  show_out_of_stock,
  low_stock_threshold,
  order_statuses,
  shipping_zones,
  product_categories,
  featured_products,
  seo_settings,
  social_links
) VALUES (
  'c3d5e1f2-1234-5678-90ab-cdef01234567',
  'DINITECH Store',
  'Votre partenaire streaming et technologie',
  'contact@dinitech.mg',
  '+261 34 12 345 67',
  'Antananarivo, Madagascar',
  true,
  false,
  true,
  5,
  '[
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded"
  ]'::jsonb,
  '[
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
  '[
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
  '[]'::jsonb,
  '{
    "title": "DINITECH Store - Votre partenaire streaming et technologie",
    "description": "Decouvrez notre selection de produits et services streaming et high-tech",
    "keywords": ["streaming", "netflix", "disney+", "prime video", "accessoires", "informatique"]
  }'::jsonb,
  '{
    "facebook": "https://facebook.com/dinitech",
    "instagram": "https://instagram.com/dinitech",
    "whatsapp": "+261341234567"
  }'::jsonb
);

-- Add a unique constraint to ensure only one row exists
ALTER TABLE store_settings ADD CONSTRAINT store_settings_single_row UNIQUE (id);
