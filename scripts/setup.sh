#!/bin/bash

# ============================================
# G-Survey - Script de Configuration Initiale
# ============================================

set -e  # Arrêter en cas d'erreur

echo "🚀 Configuration de G-Survey..."
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier Node.js
echo -e "${BLUE}📦 Vérification des prérequis...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé !${NC}"
    echo "Installez Node.js depuis https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ requis. Version actuelle: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé !${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# Vérifier MongoDB ou Docker
echo ""
echo -e "${BLUE}🔍 Vérification de MongoDB...${NC}"
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✅ MongoDB installé localement${NC}"
    MONGODB_LOCAL=true
elif command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker disponible - MongoDB sera lancé dans Docker${NC}"
    MONGODB_LOCAL=false
else
    echo -e "${YELLOW}⚠️  Ni MongoDB ni Docker ne sont installés${NC}"
    echo "Installez MongoDB ou Docker pour continuer"
    exit 1
fi

# Créer le fichier .env si inexistant
echo ""
echo -e "${BLUE}⚙️  Configuration de l'environnement...${NC}"
if [ ! -f .env ]; then
    echo "Création du fichier .env..."
    cp .env.example .env
    echo -e "${GREEN}✅ Fichier .env créé${NC}"
else
    echo -e "${YELLOW}⚠️  Fichier .env existe déjà${NC}"
fi

# Installer les dépendances
echo ""
echo -e "${BLUE}📦 Installation des dépendances...${NC}"
npm install
echo -e "${GREEN}✅ Dépendances installées${NC}"

# Démarrer MongoDB si nécessaire
echo ""
if [ "$MONGODB_LOCAL" = false ]; then
    echo -e "${BLUE}🐳 Démarrage de MongoDB dans Docker...${NC}"
    
    # Vérifier si le conteneur existe déjà
    if docker ps -a --format '{{.Names}}' | grep -q '^g-survey-mongodb$'; then
        echo "Conteneur MongoDB existe déjà. Démarrage..."
        docker start g-survey-mongodb
    else
        echo "Création du conteneur MongoDB..."
        docker run -d \
            --name g-survey-mongodb \
            -p 27017:27017 \
            -v g-survey-mongodb-data:/data/db \
            mongo:latest
    fi
    
    echo -e "${GREEN}✅ MongoDB démarré sur localhost:27017${NC}"
else
    echo -e "${BLUE}🔧 Démarrage de MongoDB local...${NC}"
    if sudo systemctl is-active --quiet mongod; then
        echo -e "${GREEN}✅ MongoDB déjà en cours d'exécution${NC}"
    else
        sudo systemctl start mongod
        echo -e "${GREEN}✅ MongoDB démarré${NC}"
    fi
fi

# Afficher les informations finales
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Configuration terminée avec succès ! ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📝 Prochaines étapes :${NC}"
echo ""
echo "1. Démarrez l'application :"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo "2. Ouvrez votre navigateur :"
echo -e "   ${YELLOW}http://localhost:5173${NC}"
echo ""
echo "3. Connectez-vous avec :"
echo -e "   Email    : ${YELLOW}admin@gsurvey.com${NC}"
echo -e "   Password : ${YELLOW}Admin@123${NC}"
echo ""
echo -e "${YELLOW}⚠️  N'oubliez pas de changer le mot de passe admin !${NC}"
echo ""
