-- Supprimer la table existante si elle existe
DROP TABLE IF EXISTS app_settings CASCADE;

-- Créer la table app_settings avec un ID fixe
CREATE TABLE app_settings (
  id uuid PRIMARY KEY DEFAULT 'a1b2c3d4-5678-90ab-cdef-123456789abc'::uuid,
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

-- Activer RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Créer une politique RLS qui permet à tous les utilisateurs de lire les paramètres
CREATE POLICY "Tout le monde peut lire les paramètres"
  ON app_settings FOR SELECT
  USING (true);

-- Créer une politique RLS qui permet aux administrateurs de modifier les paramètres
CREATE POLICY "Les administrateurs peuvent modifier les paramètres"
  ON app_settings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insérer les données initiales avec l'ID fixe
INSERT INTO app_settings (id)
VALUES ('a1b2c3d4-5678-90ab-cdef-123456789abc')
ON CONFLICT (id) DO NOTHING;

-- Créer un trigger pour empêcher la suppression de la ligne
CREATE OR REPLACE FUNCTION prevent_app_settings_deletion()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Cannot delete app settings';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_delete_app_settings
  BEFORE DELETE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION prevent_app_settings_deletion();

-- Créer un trigger pour empêcher l'insertion de lignes supplémentaires
CREATE OR REPLACE FUNCTION prevent_multiple_app_settings()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM app_settings) > 0 THEN
    RAISE EXCEPTION 'Only one row is allowed in app_settings table';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_app_settings
  BEFORE INSERT ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION prevent_multiple_app_settings();
