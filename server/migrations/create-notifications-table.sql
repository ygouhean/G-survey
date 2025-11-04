-- =====================================================
-- Migration : Création de la Table Notifications
-- =====================================================

-- Créer la table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  type VARCHAR(50) NOT NULL CHECK (
    type IN (
      'survey_assigned',
      'survey_completed', 
      'response_submitted',
      'survey_closed',
      'team_joined',
      'survey_created'
    )
  ),
  
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "relatedUserId" UUID REFERENCES users(id) ON DELETE SET NULL,
  "relatedSurveyId" UUID REFERENCES surveys(id) ON DELETE CASCADE,
  
  "isRead" BOOLEAN DEFAULT FALSE NOT NULL,
  link VARCHAR(500),
  
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_isRead ON notifications("isRead");
CREATE INDEX IF NOT EXISTS idx_notifications_userId_isRead ON notifications("userId", "isRead");
CREATE INDEX IF NOT EXISTS idx_notifications_createdAt ON notifications("createdAt" DESC);

-- Commentaires pour la documentation
COMMENT ON TABLE notifications IS 'Table des notifications pour les utilisateurs';
COMMENT ON COLUMN notifications."userId" IS 'Utilisateur qui reçoit la notification';
COMMENT ON COLUMN notifications."relatedUserId" IS 'Utilisateur qui a déclenché l''action';
COMMENT ON COLUMN notifications."relatedSurveyId" IS 'Sondage lié à la notification';
COMMENT ON COLUMN notifications."isRead" IS 'Indique si la notification a été lue';
COMMENT ON COLUMN notifications.link IS 'Lien vers la ressource concernée';

-- Afficher un message de confirmation
SELECT '✅ Table notifications créée avec succès!' as status;

-- Vérifier la structure de la table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;







