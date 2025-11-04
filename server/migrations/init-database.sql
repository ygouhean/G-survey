-- =====================================================
-- Script d'Initialisation Complète de la Base de Données
-- =====================================================
-- Ce script crée toutes les tables nécessaires pour G-Survey
-- À exécuter dans Supabase SQL Editor ou via psql
--
-- IMPORTANT : Assurez-vous que PostGIS est activé avant d'exécuter ce script
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- 1. Créer les ENUMs nécessaires
-- =====================================================

-- ENUM pour les rôles utilisateur
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
        CREATE TYPE enum_users_role AS ENUM ('admin', 'supervisor', 'field_agent');
    END IF;
END $$;

-- ENUM pour le statut des sondages
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_surveys_status') THEN
        CREATE TYPE enum_surveys_status AS ENUM ('draft', 'active', 'paused', 'closed');
    END IF;
END $$;

-- ENUM pour le statut des réponses
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_responses_status') THEN
        CREATE TYPE enum_responses_status AS ENUM ('completed', 'partial', 'synced', 'pending_sync');
    END IF;
END $$;

-- ENUM pour les types de notifications
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_notifications_type') THEN
        CREATE TYPE enum_notifications_type AS ENUM (
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

-- =====================================================
-- 2. Créer les tables (dans l'ordre des dépendances)
-- =====================================================

-- Table teams (doit être créée en premier car users y fait référence)
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    "supervisorId" UUID,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    gender VARCHAR(20),
    country VARCHAR(100),
    sector VARCHAR(100),
    "organization_type" VARCHAR(100),
    role enum_users_role DEFAULT 'field_agent' NOT NULL,
    "teamId" UUID REFERENCES teams(id) ON DELETE SET NULL,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "lastLogin" TIMESTAMP WITH TIME ZONE,
    "reset_password_token" VARCHAR(255),
    "reset_password_expire" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Ajouter la référence supervisorId dans teams (après création de users)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS "supervisorId" UUID REFERENCES users(id) ON DELETE SET NULL;

-- Table surveys
CREATE TABLE IF NOT EXISTS surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    status enum_surveys_status DEFAULT 'draft' NOT NULL,
    "autoClosedAt" TIMESTAMP WITH TIME ZONE,
    "targetResponses" INTEGER DEFAULT 0 NOT NULL,
    "responseCount" INTEGER DEFAULT 0 NOT NULL,
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE,
    "originalEndDate" TIMESTAMP WITH TIME ZONE,
    "createdById" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{"allowAnonymous": false, "requireGeolocation": false, "allowOfflineSubmission": true, "showProgressBar": true, "randomizeQuestions": false}'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table survey_assignees (table de liaison many-to-many)
CREATE TABLE IF NOT EXISTS "survey_assignees" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "surveyId" UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "assignedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "assignedBy" UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE("surveyId", "userId")
);

-- Table responses
CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "surveyId" UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    "respondentId" UUID REFERENCES users(id) ON DELETE SET NULL,
    answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    location GEOMETRY(POINT, 4326),
    "deviceInfo" JSONB,
    metadata JSONB,
    "npsScore" INTEGER CHECK ("npsScore" >= 0 AND "npsScore" <= 10),
    "csatScore" INTEGER CHECK ("csatScore" >= 1 AND "csatScore" <= 5),
    "cesScore" INTEGER CHECK ("cesScore" >= 1 AND "cesScore" <= 7),
    status enum_responses_status DEFAULT 'completed' NOT NULL,
    "submittedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table questions (pour les réponses avec questions individuelles)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "questionId" VARCHAR(255) NOT NULL,
    "questionType" VARCHAR(50),
    value JSONB,
    geolocation GEOMETRY(POINT, 4326),
    "areaMeasurement" JSONB
);

-- Table answers (pour les réponses détaillées)
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "questionId" VARCHAR(255) NOT NULL,
    "questionType" VARCHAR(50),
    value JSONB,
    geolocation GEOMETRY(POINT, 4326),
    "areaMeasurement" JSONB
);

-- Table notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type enum_notifications_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "relatedUserId" UUID REFERENCES users(id) ON DELETE SET NULL,
    "relatedSurveyId" UUID REFERENCES surveys(id) ON DELETE CASCADE,
    "isRead" BOOLEAN DEFAULT false NOT NULL,
    link VARCHAR(500),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 3. Créer les index pour améliorer les performances
-- =====================================================

-- Index pour users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_teamId ON users("teamId");
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_isActive ON users("isActive");

-- Index pour surveys
CREATE INDEX IF NOT EXISTS idx_surveys_createdById ON surveys("createdById");
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_endDate ON surveys("endDate");

-- Index pour responses
CREATE INDEX IF NOT EXISTS idx_responses_surveyId ON responses("surveyId");
CREATE INDEX IF NOT EXISTS idx_responses_respondentId ON responses("respondentId");
CREATE INDEX IF NOT EXISTS idx_responses_status ON responses(status);
CREATE INDEX IF NOT EXISTS idx_responses_submittedAt ON responses("submittedAt");
-- Index spatial pour les réponses avec géolocalisation
CREATE INDEX IF NOT EXISTS idx_responses_location ON responses USING GIST(location);

-- Index pour survey_assignees
CREATE INDEX IF NOT EXISTS idx_survey_assignees_surveyId ON "survey_assignees"("surveyId");
CREATE INDEX IF NOT EXISTS idx_survey_assignees_userId ON "survey_assignees"("userId");

-- Index pour notifications
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_isRead ON notifications("isRead");
CREATE INDEX IF NOT EXISTS idx_notifications_userId_isRead ON notifications("userId", "isRead");
CREATE INDEX IF NOT EXISTS idx_notifications_createdAt ON notifications("createdAt" DESC);

-- =====================================================
-- 4. Créer les triggers pour mettre à jour updatedAt
-- =====================================================

-- Fonction pour mettre à jour updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour chaque table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON surveys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. Message de confirmation
-- =====================================================

DO $$ 
BEGIN
    RAISE NOTICE '✅ Base de données initialisée avec succès !';
    RAISE NOTICE '   Tables créées : users, teams, surveys, responses, notifications';
    RAISE NOTICE '   Index créés pour améliorer les performances';
    RAISE NOTICE '   Triggers créés pour updatedAt';
END $$;

