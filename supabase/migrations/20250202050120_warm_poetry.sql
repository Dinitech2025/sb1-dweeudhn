/*
  # Configuration des paramètres de l'application et du site e-commerce

  1. Nouvelles Tables
    - `app_settings` : Paramètres globaux de l'application
    - `user_roles` : Rôles des utilisateurs
    - `user_permissions` : Permissions disponibles
    - `user_role_permissions` : Association rôles-permissions
    - `ecommerce_settings` : Paramètres spécifiques au site e-commerce

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques d'accès pour les administrateurs

  3. Données Initiales
    - Paramètres par défaut
    - Rôles et permissions de base
*/

-- Table des paramètres de l'application
CREATE TABLE app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'DINITECH',
  site_description text,
  contact_email text,
  contact_phone text,
  address text,
  currency text NOT NULL DEFAULT 'MGA',
  currency_symbol text NOT NULL DEFAULT 'Ar',
  tax_rate numeric NOT NULL DEFAULT 0,
  shipping_fee numeric NOT NULL DEFAULT 0,
  min_order_amount numeric NOT NULL DEFAULT 0,
  max_order_amount numeric NOT NULL DEFAULT 0,
  order_prefix text NOT NULL DEFAULT 'CMD',
  invoice_prefix text NOT NULL DEFAULT 'FAC',
  social_media jsonb DEFAULT '{"facebook": null, "instagram": null, "whatsapp": null}'::jsonb,
  payment_methods jsonb DEFAULT '{"cash": true, "mobile_money": true, "bank_transfer": false}'::jsonb,
  mobile_money_numbers jsonb DEFAULT '{"orange": [], "airtel": [], "telma": []}'::jsonb,
  bank_accounts jsonb DEFAULT '[]'::jsonb,
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

-- Table des paramètres e-commerce
CREATE TABLE ecommerce_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
  shipping_zones jsonb DEFAULT '[]'::jsonb,
  product_categories jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des rôles utilisateur
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Table des permissions
CREATE TABLE user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  module text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table de liaison rôles-permissions
CREATE TABLE user_role_permissions (
  role_id uuid REFERENCES user_roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES user_permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

-- Activer RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_permissions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Les administrateurs peuvent gérer les paramètres"
  ON app_settings FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Les administrateurs peuvent gérer les paramètres e-commerce"
  ON ecommerce_settings FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Les administrateurs peuvent gérer les rôles"
  ON user_roles FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Les administrateurs peuvent gérer les permissions"
  ON user_permissions FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Les administrateurs peuvent gérer les permissions des rôles"
  ON user_role_permissions FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Insérer les données initiales
INSERT INTO app_settings (id) VALUES (gen_random_uuid());
INSERT INTO ecommerce_settings (id) VALUES (gen_random_uuid());

-- Insérer les rôles de base
INSERT INTO user_roles (name, description, is_system) VALUES
  ('admin', 'Administrateur système avec tous les droits', true),
  ('manager', 'Gestionnaire avec droits limités', true),
  ('staff', 'Personnel avec droits basiques', true);

-- Insérer les permissions de base
INSERT INTO user_permissions (name, description, module) VALUES
  ('settings.view', 'Voir les paramètres', 'settings'),
  ('settings.edit', 'Modifier les paramètres', 'settings'),
  ('users.view', 'Voir les utilisateurs', 'users'),
  ('users.create', 'Créer des utilisateurs', 'users'),
  ('users.edit', 'Modifier des utilisateurs', 'users'),
  ('users.delete', 'Supprimer des utilisateurs', 'users'),
  ('roles.view', 'Voir les rôles', 'roles'),
  ('roles.manage', 'Gérer les rôles', 'roles'),
  ('products.view', 'Voir les produits', 'products'),
  ('products.manage', 'Gérer les produits', 'products'),
  ('orders.view', 'Voir les commandes', 'orders'),
  ('orders.manage', 'Gérer les commandes', 'orders'),
  ('customers.view', 'Voir les clients', 'customers'),
  ('customers.manage', 'Gérer les clients', 'customers'),
  ('reports.view', 'Voir les rapports', 'reports');

-- Donner toutes les permissions au rôle admin
INSERT INTO user_role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM user_roles WHERE name = 'admin'),
  id
FROM user_permissions;