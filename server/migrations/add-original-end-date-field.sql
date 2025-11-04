-- Migration pour ajouter le champ originalEndDate
-- Date: 2025-11-02

-- Ajouter le champ originalEndDate à la table surveys
ALTER TABLE surveys 
ADD COLUMN IF NOT EXISTS "originalEndDate" TIMESTAMP;

COMMENT ON COLUMN surveys."originalEndDate" IS 'Date de fin originale du sondage (pour historique des prolongations)';

-- Pour les sondages existants avec une endDate, copier endDate vers originalEndDate
UPDATE surveys 
SET "originalEndDate" = "endDate"
WHERE "endDate" IS NOT NULL AND "originalEndDate" IS NULL;

-- Afficher un message de succès
DO $$
BEGIN
  RAISE NOTICE 'Migration réussie : Champ originalEndDate ajouté à la table surveys';
END $$;







