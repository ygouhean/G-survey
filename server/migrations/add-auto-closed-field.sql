-- Migration pour ajouter le champ autoClosedAt
-- Date: 2025-11-02

-- Ajouter le champ autoClosedAt à la table surveys
ALTER TABLE surveys 
ADD COLUMN IF NOT EXISTS "autoClosedAt" TIMESTAMP;

COMMENT ON COLUMN surveys."autoClosedAt" IS 'Date de fermeture automatique du sondage';

-- Afficher un message de succès
DO $$
BEGIN
  RAISE NOTICE 'Migration réussie : Champ autoClosedAt ajouté à la table surveys';
END $$;






