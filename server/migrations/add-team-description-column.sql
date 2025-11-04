-- Migration: Ajouter la colonne description et isActive à la table teams
-- Date: 2025-11-04
-- Description: Ajoute les colonnes manquantes description et isActive à la table teams

-- Ajouter la colonne description si elle n'existe pas
ALTER TABLE teams ADD COLUMN IF NOT EXISTS description TEXT;

-- Ajouter la colonne isActive si elle n'existe pas
ALTER TABLE teams ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true NOT NULL;

-- Message de confirmation
DO $$ 
BEGIN
    RAISE NOTICE '✅ Migration terminée : colonnes description et isActive ajoutées à la table teams';
END $$;

