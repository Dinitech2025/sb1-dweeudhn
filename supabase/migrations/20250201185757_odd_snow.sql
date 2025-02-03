/*
  # Fix subscriptions-profiles relation v2

  1. Changes
    - Drop existing trigger and function
    - Create new function to validate profile references
    - Add proper foreign key constraint for profiles array
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS validate_subscription_profiles ON subscriptions;
DROP FUNCTION IF EXISTS check_profile_references;

-- Create new function to validate profile references
CREATE OR REPLACE FUNCTION check_profile_references()
RETURNS TRIGGER AS $$
DECLARE
  profile_id uuid;
BEGIN
  -- Check each profile ID exists in profiles table
  FOREACH profile_id IN ARRAY NEW.profiles
  LOOP
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = profile_id) THEN
      RAISE EXCEPTION 'Profile ID % does not exist', profile_id;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate profile references before insert/update
CREATE TRIGGER validate_subscription_profiles
  BEFORE INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION check_profile_references();

-- Add comment to explain the relationship
COMMENT ON COLUMN subscriptions.profiles IS 'Array of profile IDs associated with this subscription';

-- Create a join table for subscriptions and profiles
CREATE TABLE IF NOT EXISTS subscription_profiles (
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (subscription_id, profile_id)
);

-- Create function to sync profiles array with join table
CREATE OR REPLACE FUNCTION sync_subscription_profiles()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete old entries
  DELETE FROM subscription_profiles WHERE subscription_id = NEW.id;
  
  -- Insert new entries
  INSERT INTO subscription_profiles (subscription_id, profile_id)
  SELECT NEW.id, unnest(NEW.profiles);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync profiles array with join table
CREATE TRIGGER sync_subscription_profiles_trigger
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_subscription_profiles();