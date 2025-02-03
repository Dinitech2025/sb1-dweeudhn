/*
  # Add RLS policies for all tables

  1. Changes
    - Add INSERT policies for all tables
    - Add UPDATE policies for relevant tables
    - Keep existing SELECT policies

  2. Security
    - All policies are scoped to authenticated users
    - Maintains data access control while allowing necessary operations
*/

-- Add INSERT and UPDATE policies for platforms
CREATE POLICY "Allow authenticated users to insert platforms"
  ON platforms FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add INSERT and UPDATE policies for accounts
CREATE POLICY "Allow authenticated users to insert accounts"
  ON accounts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update accounts"
  ON accounts FOR UPDATE
  TO authenticated
  USING (true);

-- Add INSERT and UPDATE policies for profiles
CREATE POLICY "Allow authenticated users to insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (true);

-- Add INSERT and UPDATE policies for customers
CREATE POLICY "Allow authenticated users to insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true);

-- Add INSERT and UPDATE policies for subscription plans
CREATE POLICY "Allow authenticated users to insert subscription plans"
  ON subscription_plans FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update subscription plans"
  ON subscription_plans FOR UPDATE
  TO authenticated
  USING (true);

-- Add INSERT and UPDATE policies for subscriptions
CREATE POLICY "Allow authenticated users to insert subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (true);