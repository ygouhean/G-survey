-- Migration: Ajouter les champs pour la réinitialisation de mot de passe
-- Date: 2025-11-03
-- Description: Ajoute reset_password_token et reset_password_expire à la table users

-- Ajouter la colonne reset_password_token
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255) NULL;

-- Ajouter la colonne reset_password_expire
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_password_expire TIMESTAMP NULL;

-- Créer un index pour améliorer les performances lors de la recherche par token
CREATE INDEX IF NOT EXISTS idx_users_reset_token 
ON users(reset_password_token) 
WHERE reset_password_token IS NOT NULL;

-- Message de confirmation
DO $$ 
BEGIN
    RAISE NOTICE '✅ Migration terminée : Champs de réinitialisation de mot de passe ajoutés';
END $$;


