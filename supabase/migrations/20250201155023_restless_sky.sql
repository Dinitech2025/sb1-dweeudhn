/*
  # Add max_profiles to platforms table

  1. Changes
    - Add `max_profiles` column to `platforms` table with default value of 5
    - Update existing records to have max_profiles = 5
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'platforms' 
    AND column_name = 'max_profiles'
  ) THEN
    ALTER TABLE platforms 
    ADD COLUMN max_profiles integer NOT NULL DEFAULT 5;
  END IF;
END $$;

-- Update existing records to have max_profiles = 5
UPDATE platforms 
SET max_profiles = 5 
WHERE max_profiles IS NULL;
