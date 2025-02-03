/*
  # Update subscriptions table to support multiple profiles

  1. Changes
    - Add profiles column to store multiple profile IDs
    - Remove profile_id column (will be replaced by profiles)
    - Add constraint to ensure at least one profile
  
  2. Data Migration
    - Move existing profile_id values to profiles
*/

-- First create the new column as JSONB to store array of profile IDs
ALTER TABLE subscriptions 
ADD COLUMN profiles uuid[] NOT NULL DEFAULT '{}';

-- Copy existing profile_id values to profiles
UPDATE subscriptions 
SET profiles = ARRAY[profile_id]
WHERE profile_id IS NOT NULL;

-- Drop the profile_id column and its foreign key
ALTER TABLE subscriptions
DROP COLUMN profile_id;

-- Add constraint to ensure at least one profile
ALTER TABLE subscriptions
ADD CONSTRAINT subscriptions_profiles_not_empty 
CHECK (array_length(profiles, 1) > 0);

-- Create a trigger function to validate profile references
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
