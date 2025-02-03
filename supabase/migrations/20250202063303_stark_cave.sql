-- Supprimer toutes les données existantes
TRUNCATE TABLE store_settings;

-- Insérer une seule ligne avec un ID fixe
INSERT INTO store_settings (
  id,
  store_name,
  store_description,
  store_logo_url,
  store_banner_url,
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
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
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
    "description": "Découvrez notre sélection de produits et services streaming et high-tech",
    "keywords": ["streaming", "netflix", "disney+", "prime video", "accessoires", "informatique"]
  }'::jsonb,
  '{
    "facebook": "https://facebook.com/dinitech",
    "instagram": "https://instagram.com/dinitech",
    "whatsapp": "+261341234567"
  }'::jsonb
);

-- Ajouter une contrainte pour s'assurer qu'il n'y a qu'une seule ligne
ALTER TABLE store_settings ADD CONSTRAINT store_settings_single_row CHECK (id = 'c3d5e1f2-1234-5678-90ab-cdef01234567');