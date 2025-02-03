/*
  # Add duration_months to subscription_plans

  1. Changes
    - Add `duration_months` column to `subscription_plans` table with default value of 1
    - Update existing records to have duration_months = 1
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' 
    AND column_name = 'duration_months'
  ) THEN
    ALTER TABLE subscription_plans 
    ADD COLUMN duration_months integer NOT NULL DEFAULT 1;
  END IF;
END $$;

-- Update existing records to have duration_months = 1
UPDATE subscription_plans 
SET duration_months = 1 
WHERE duration_months IS NULL;
