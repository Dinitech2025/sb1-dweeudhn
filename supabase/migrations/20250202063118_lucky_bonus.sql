-- Enrichir la table products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS image text,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS reviews_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS brand text,
ADD COLUMN IF NOT EXISTS sku text UNIQUE,
ADD COLUMN IF NOT EXISTS weight numeric,
ADD COLUMN IF NOT EXISTS dimensions jsonb DEFAULT '{"length": 0, "width": 0, "height": 0}'::jsonb,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text;

-- Enrichir la table services
ALTER TABLE services
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS reviews_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS availability jsonb DEFAULT '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": true, "sunday": false}'::jsonb,
ADD COLUMN IF NOT EXISTS requirements text[],
ADD COLUMN IF NOT EXISTS includes text[],
ADD COLUMN IF NOT EXISTS excludes text[],
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text;

-- Insérer des produits d'exemple
INSERT INTO products (
  name,
  description,
  price,
  stock,
  image,
  category,
  featured,
  rating,
  reviews_count,
  brand,
  sku,
  weight,
  dimensions,
  tags,
  meta_title,
  meta_description
) VALUES
(
  'Netflix Premium 4K',
  'Abonnement Netflix Premium avec 4 écrans simultanés et qualité 4K HDR',
  45000,
  100,
  'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'streaming',
  true,
  4.8,
  156,
  'Netflix',
  'NF-PREMIUM-4K',
  0,
  '{"length": 0, "width": 0, "height": 0}'::jsonb,
  ARRAY['netflix', 'streaming', '4k', 'premium'],
  'Netflix Premium 4K - 4 écrans simultanés',
  'Profitez de Netflix en qualité 4K HDR sur 4 écrans simultanés'
),
(
  'Disney+ Standard',
  'Abonnement Disney+ avec 2 écrans simultanés en HD',
  25000,
  100,
  'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'streaming',
  true,
  4.7,
  98,
  'Disney+',
  'DP-STANDARD-HD',
  0,
  '{"length": 0, "width": 0, "height": 0}'::jsonb,
  ARRAY['disney+', 'streaming', 'hd'],
  'Disney+ Standard HD - 2 écrans simultanés',
  'Accédez au catalogue Disney+ en HD sur 2 écrans simultanés'
),
(
  'Clé HDMI 4K',
  'Streaming stick compatible 4K HDR avec télécommande vocale',
  85000,
  50,
  'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'accessories',
  true,
  4.6,
  72,
  'DINITECH',
  'DT-HDMI-4K',
  150,
  '{"length": 10, "width": 3, "height": 1}'::jsonb,
  ARRAY['hdmi', '4k', 'streaming', 'stick'],
  'Clé HDMI 4K HDR - Streaming Stick',
  'Transformez votre TV en Smart TV avec notre clé HDMI 4K'
),
(
  'Câble HDMI 2m',
  'Câble HDMI 2.0 haute vitesse compatible 4K 60Hz',
  25000,
  200,
  'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'accessories',
  false,
  4.5,
  45,
  'DINITECH',
  'DT-CABLE-HDMI-2M',
  100,
  '{"length": 200, "width": 2, "height": 1}'::jsonb,
  ARRAY['hdmi', 'cable', '4k'],
  'Câble HDMI 2m - Compatible 4K 60Hz',
  'Câble HDMI haute qualité pour une transmission parfaite en 4K'
);

-- Insérer des services d'exemple
INSERT INTO services (
  name,
  description,
  price,
  duration_minutes,
  category,
  featured,
  rating,
  reviews_count,
  availability,
  requirements,
  includes,
  excludes,
  tags,
  meta_title,
  meta_description
) VALUES
(
  'Installation Netflix',
  'Configuration complète de votre compte Netflix sur tous vos appareils',
  10000,
  30,
  'services',
  true,
  4.9,
  203,
  '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": true, "sunday": false}'::jsonb,
  ARRAY['Smart TV ou appareil compatible', 'Connexion Internet stable'],
  ARRAY['Configuration du compte', 'Installation sur 3 appareils', 'Guide d''utilisation'],
  ARRAY['Abonnement Netflix non inclus'],
  ARRAY['netflix', 'installation', 'configuration'],
  'Installation Netflix - Configuration Complète',
  'Service d''installation et configuration de Netflix sur tous vos appareils'
),
(
  'Support Technique',
  'Assistance technique pour tous vos problèmes de streaming',
  20000,
  60,
  'services',
  true,
  4.8,
  167,
  '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": true, "sunday": true}'::jsonb,
  ARRAY['Appareil concerné disponible'],
  ARRAY['Diagnostic complet', 'Résolution des problèmes', 'Conseils d''optimisation'],
  ARRAY['Réparation matérielle', 'Remplacement de pièces'],
  ARRAY['support', 'technique', 'dépannage'],
  'Support Technique Streaming - Assistance Professionnelle',
  'Service de support technique professionnel pour tous vos problèmes de streaming'
),
(
  'Formation Streaming',
  'Formation complète à l''utilisation des services de streaming',
  25000,
  45,
  'services',
  false,
  4.7,
  89,
  '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": false, "sunday": false}'::jsonb,
  ARRAY['Aucun prérequis'],
  ARRAY['Support de formation', 'Exercices pratiques', 'Suivi post-formation'],
  ARRAY['Matériel non fourni'],
  ARRAY['formation', 'streaming', 'apprentissage'],
  'Formation Streaming - Devenez un Expert',
  'Formation complète pour maîtriser l''utilisation des services de streaming'
);