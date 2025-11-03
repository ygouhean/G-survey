#!/bin/bash

# Script Bash pour ajouter les champs de profil à la base de données
# Date: 2025-11-02
# Description: Ajoute username, gender, country, sector, organization_type à la table users

echo "========================================"
echo "  Migration: Ajout des champs de profil"
echo "========================================"
echo ""

# Charger les variables d'environnement depuis .env si disponible
ENV_FILE="$(dirname "$0")/../.env"
if [ -f "$ENV_FILE" ]; then
    echo "Chargement des variables d'environnement depuis .env..."
    export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
fi

# Configuration de la base de données (avec valeurs par défaut)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-gsurvey}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

echo "Configuration:"
echo "  Hôte: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Base de données: $DB_NAME"
echo "  Utilisateur: $DB_USER"
echo ""

# Définir la variable d'environnement PGPASSWORD pour éviter la demande de mot de passe
export PGPASSWORD=$DB_PASSWORD

# Chemin vers le fichier de migration
MIGRATION_FILE="$(dirname "$0")/../server/migrations/add-profile-fields.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Erreur: Le fichier de migration n'existe pas: $MIGRATION_FILE"
    exit 1
fi

echo "Fichier de migration trouvé: $MIGRATION_FILE"
echo ""

# Vérifier si psql est disponible
if ! command -v psql &> /dev/null; then
    echo "❌ Erreur: psql n'est pas installé ou n'est pas dans le PATH"
    echo "Veuillez installer PostgreSQL"
    exit 1
fi

echo "Application de la migration..."

# Exécuter la migration
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"; then
    echo ""
    echo "✅ Migration appliquée avec succès !"
    echo ""
    echo "Nouveaux champs ajoutés à la table users:"
    echo "  - username (VARCHAR 255, UNIQUE)"
    echo "  - gender (VARCHAR 20)"
    echo "  - country (VARCHAR 100)"
    echo "  - sector (VARCHAR 100)"
    echo "  - organization_type (VARCHAR 100)"
    echo ""
    echo "Vous pouvez maintenant utiliser les nouvelles fonctionnalités de profil !"
else
    echo ""
    echo "❌ Erreur lors de l'application de la migration"
    exit 1
fi

# Nettoyer la variable d'environnement du mot de passe
unset PGPASSWORD

echo ""
echo "========================================"
echo "  Migration terminée"
echo "========================================"


