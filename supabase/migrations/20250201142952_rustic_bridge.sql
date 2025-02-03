/*
  # Streaming Service Subscription Management Schema

  1. New Tables
    - `platforms` - Streaming platforms (Netflix, Prime Video, etc.)
      - `id` (uuid, primary key)
      - `name` (text) - Platform name
      - `logo_url` (text) - Platform logo URL
      - `created_at` (timestamp)
      
    - `accounts` - Main streaming accounts
      - `id` (uuid, primary key)
      - `platform_id` (uuid, foreign key)
      - `account_email` (text) - Account login email
      - `expiration_date` (date) - Account expiration date
      - `is_active` (boolean) - Account active status
      - `max_profiles` (int) - Maximum number of profiles
      - `created_at` (timestamp)
      
    - `profiles` - Individual profiles within accounts
      - `id` (uuid, primary key)
      - `account_id` (uuid, foreign key)
      - `profile_name` (text)
      - `is_available` (boolean)
      - `created_at` (timestamp)
      
    - `customers` - Customer information
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone` (text)
      - `email` (text)
      - `created_at` (timestamp)
      
    - `subscription_plans` - Available subscription plans
      - `id` (uuid, primary key)
      - `platform_id` (uuid, foreign key)
      - `name` (text)
      - `profiles_count` (int)
      - `price_ar` (numeric) - Price in Ariary
      - `created_at` (timestamp)
      
    - `subscriptions` - Customer subscriptions
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `profile_id` (uuid, foreign key)
      - `plan_id` (uuid, foreign key)
      - `start_date` (date)
      - `end_date` (date)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Platforms table
CREATE TABLE platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read platforms"
  ON platforms FOR SELECT
  TO authenticated
  USING (true);

-- Accounts table
CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id uuid REFERENCES platforms(id),
  account_email text NOT NULL,
  expiration_date date NOT NULL,
  is_active boolean DEFAULT true,
  max_profiles int NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage accounts"
  ON accounts FOR ALL
  TO authenticated
  USING (true);

-- Profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES accounts(id),
  profile_name text NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (true);

-- Customers table
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage customers"
  ON customers FOR ALL
  TO authenticated
  USING (true);

-- Subscription plans table
CREATE TABLE subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id uuid REFERENCES platforms(id),
  name text NOT NULL,
  profiles_count int NOT NULL,
  price_ar numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage subscription plans"
  ON subscription_plans FOR ALL
  TO authenticated
  USING (true);

-- Subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  profile_id uuid REFERENCES profiles(id),
  plan_id uuid REFERENCES subscription_plans(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage subscriptions"
  ON subscriptions FOR ALL
  TO authenticated
  USING (true);

-- Create views for common queries
CREATE VIEW available_profiles AS
SELECT 
  p.*,
  a.platform_id,
  a.expiration_date,
  a.is_active
FROM profiles p
JOIN accounts a ON p.account_id = a.id
WHERE p.is_available = true
  AND a.is_active = true
  AND a.expiration_date > CURRENT_DATE;

-- Create function to check expiring accounts
CREATE OR REPLACE FUNCTION get_expiring_accounts(days_threshold int)
RETURNS TABLE (
  account_id uuid,
  platform_name text,
  expiration_date date,
  days_remaining int
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as account_id,
    p.name as platform_name,
    a.expiration_date,
    (a.expiration_date - CURRENT_DATE) as days_remaining
  FROM accounts a
  JOIN platforms p ON a.platform_id = p.id
  WHERE a.is_active = true
    AND (a.expiration_date - CURRENT_DATE) <= days_threshold
  ORDER BY days_remaining;
END;
$$ LANGUAGE plpgsql;
