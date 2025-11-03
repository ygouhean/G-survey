#!/bin/bash
# Script Bash pour ajouter le type de notification user_registered
# Linux/Mac

echo "🔄 Application de la migration : add-user-registered-notification-type.sql"

# Vérifier si psql est disponible
if ! command -v psql &> /dev/null; then
    echo "❌ Erreur : psql n'est pas installé"
    echo "📝 Veuillez installer PostgreSQL"
    exit 1
fi

# Récupérer les informations de connexion
export PGPASSWORD="gsurvey2024"
DB_NAME="gsurvey_db"
DB_USER="gsurvey_user"
DB_HOST="localhost"
DB_PORT="5432"

echo "📊 Base de données : $DB_NAME"
echo "👤 Utilisateur : $DB_USER"
echo "🖥️  Serveur : $DB_HOST:$DB_PORT"
echo ""

# Exécuter la migration
MIGRATION_FILE="$(dirname "$0")/../server/migrations/add-user-registered-notification-type.sql"

echo "📂 Fichier de migration : $MIGRATION_FILE"
echo ""

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Erreur : Fichier de migration non trouvé"
    exit 1
fi

echo "⏳ Exécution de la migration..."

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration appliquée avec succès !"
    echo ""
    echo "📋 Prochaines étapes :"
    echo "  1. Redémarrer le serveur backend : cd server && npm start"
    echo "  2. Créer un nouveau compte pour tester"
    echo "  3. Se connecter en tant qu'admin pour voir la notification"
    echo ""
else
    echo ""
    echo "❌ Erreur lors de l'application de la migration"
    echo "📝 Vérifiez les logs ci-dessus pour plus de détails"
    echo ""
    exit 1
fi

# Nettoyer la variable d'environnement
unset PGPASSWORD

