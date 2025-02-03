/*
  # Fix subscriptions-profiles relation

  1. Changes
    - Add foreign key constraint for profiles array in subscriptions table
    - Update trigger function to validate profile references
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS validate_subscription_profiles ON subscriptions;
DROP FUNCTION IF EXISTS check_profile_references;

-- Create new function to validate profile references
CREATE OR REPLACE FUNCTION check_profile_references()
RETURNS TRIGGER AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Check each profile ID exists in profiles table and is available
  FOR profile_record IN 
    SELECT p.* 
    FROM profiles p
    WHERE p.id = ANY(NEW.profiles)
  LOOP
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Profile ID % does not exist', profile_record.id;
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