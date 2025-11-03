-- Migration: Ajouter le type de notification 'user_registered'
-- Date: 2025-11-02
-- Description: Ajoute le type 'user_registered' à l'ENUM des types de notifications

-- Étape 1: Créer un nouveau type ENUM avec toutes les valeurs
DO $$ 
BEGIN
    -- Vérifier si le type existe déjà
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_notifications_type_new') THEN
        CREATE TYPE enum_notifications_type_new AS ENUM (
            'survey_assigned',
            'survey_completed',
            'response_submitted',
            'survey_closed',
            'team_joined',
            'survey_created',
            'user_registered'
        );
    END IF;
END $$;

-- Étape 2: Ajouter une colonne temporaire avec le nouveau type
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type_new enum_notifications_type_new;

-- Étape 3: Copier les données de l'ancienne colonne vers la nouvelle
UPDATE notifications SET type_new = type::text::enum_notifications_type_new;

-- Étape 4: Supprimer l'ancienne colonne
ALTER TABLE notifications DROP COLUMN IF EXISTS type CASCADE;

-- Étape 5: Renommer la nouvelle colonne
ALTER TABLE notifications RENAME COLUMN type_new TO type;

-- Étape 6: Ajouter la contrainte NOT NULL
ALTER TABLE notifications ALTER COLUMN type SET NOT NULL;

-- Étape 7: Supprimer l'ancien type ENUM (si aucune autre table ne l'utilise)
DROP TYPE IF EXISTS enum_notifications_type CASCADE;

-- Étape 8: Renommer le nouveau type
ALTER TYPE enum_notifications_type_new RENAME TO enum_notifications_type;

-- Message de confirmation
DO $$ 
BEGIN
    RAISE NOTICE '✅ Migration terminée : type user_registered ajouté aux notifications';
END $$;

