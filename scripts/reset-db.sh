#!/bin/bash

# ============================================
# G-Survey - Script de Réinitialisation DB
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}⚠️  ATTENTION : Réinitialisation de la base de données${NC}"
echo ""
echo "Cette action va SUPPRIMER toutes les données :"
echo "  - Tous les utilisateurs (sauf l'admin par défaut)"
echo "  - Tous les sondages"
echo "  - Toutes les réponses"
echo "  - Toutes les équipes"
echo ""
read -p "Êtes-vous sûr ? (tapez 'OUI' pour continuer) : " confirmation

if [ "$confirmation" != "OUI" ]; then
    echo -e "${YELLOW}Opération annulée${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🗑️  Suppression de la base de données...${NC}"

# Vérifier si MongoDB est dans Docker
if docker ps --format '{{.Names}}' | grep -q '^g-survey-mongodb$'; then
    echo "Réinitialisation via Docker..."
    docker exec g-survey-mongodb mongosh gsurvey --eval "db.dropDatabase()"
else
    echo "Réinitialisation locale..."
    mongosh gsurvey --eval "db.dropDatabase()"
fi

echo -e "${GREEN}✅ Base de données réinitialisée${NC}"
echo ""
echo -e "${BLUE}🔄 Redémarrage du serveur...${NC}"
echo "L'admin par défaut sera recréé au prochain démarrage"
echo ""
echo "Démarrez le serveur avec : ${YELLOW}npm run dev${NC}"
echo ""
