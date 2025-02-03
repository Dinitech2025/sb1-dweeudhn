/*
  # Ajout des champs nom et mot de passe aux comptes

  1. Modifications
    - Ajout de la colonne `name` pour le nom du compte
    - Ajout de la colonne `password` pour le mot de passe du compte
*/

DO $$ 
BEGIN
  -- Ajout de la colonne name si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'accounts' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE accounts 
    ADD COLUMN name text;
  END IF;

  -- Ajout de la colonne password si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'accounts' 
    AND column_name = 'password'
  ) THEN
    ALTER TABLE accounts 
    ADD COLUMN password text;
  END IF;
END $$;
