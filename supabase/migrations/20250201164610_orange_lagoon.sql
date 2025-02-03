/*
  # Add contact channel to customers table
  
  1. Changes
    - Add contact_channel column to customers table with validation
    - Set default value and constraints
    - Update existing rows to use default value
*/

DO $$ 
BEGIN
  -- Add contact_channel column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' 
    AND column_name = 'contact_channel'
  ) THEN
    -- Add the column first without constraints
    ALTER TABLE customers 
    ADD COLUMN contact_channel text;

    -- Update existing rows to use default value
    UPDATE customers 
    SET contact_channel = 'facebook_sb' 
    WHERE contact_channel IS NULL;

    -- Now add NOT NULL constraint and CHECK constraint
    ALTER TABLE customers 
    ALTER COLUMN contact_channel SET NOT NULL,
    ALTER COLUMN contact_channel SET DEFAULT 'facebook_sb',
    ADD CONSTRAINT customers_contact_channel_check 
    CHECK (contact_channel IN (
      'facebook_sb',
      'whatsapp_yas',
      'email',
      'sms_yas',
      'facebook_sab',
      'facebook_ssb',
      'facebook_bnk',
      'sms_orange',
      'call_yas',
      'call_orange'
    ));
  END IF;
END $$;
