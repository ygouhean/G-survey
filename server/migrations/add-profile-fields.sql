-- Migration pour ajouter les champs de profil supplémentaires
-- Date: 2025-11-02

-- Ajout du champ username
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE;

-- Ajout du champ gender
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20);

-- Ajout du champ country
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- Ajout du champ sector (secteur d'activité)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS sector VARCHAR(100);

-- Ajout du champ organization_type
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS organization_type VARCHAR(100);

-- Ajout d'un index sur username pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Commentaires pour documentation
COMMENT ON COLUMN users.username IS 'Nom d''utilisateur unique';
COMMENT ON COLUMN users.gender IS 'Genre de l''utilisateur (male, female, other)';
COMMENT ON COLUMN users.country IS 'Pays de l''utilisateur';
COMMENT ON COLUMN users.sector IS 'Secteur d''activité';
COMMENT ON COLUMN users.organization_type IS 'Type d''organisation';


