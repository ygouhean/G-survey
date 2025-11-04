#!/bin/bash

# Script Bash pour exporter la base de données locale et l'importer sur Supabase
# Usage: ./export-db-to-supabase.sh [-i] [-u "postgresql://..."] [-f "backup.sql"]

set -e

IMPORT_TO_SUPABASE=false
SUPABASE_URI=""
INPUT_FILE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -i|--import)
            IMPORT_TO_SUPABASE=true
            shift
            ;;
        -u|--uri)
            SUPABASE_URI="$2"
            shift 2
            ;;
        -f|--file)
            INPUT_FILE="$2"
            shift 2
            ;;
        *)
            echo "Usage: $0 [-i|--import] [-u|--uri URI] [-f|--file FILE]"
            exit 1
            ;;
    esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function print_success() { echo -e "${GREEN}✅ $1${NC}"; }
function print_error() { echo -e "${RED}❌ $1${NC}"; }
function print_info() { echo -e "${CYAN}📄 $1${NC}"; }
function print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Vérifier que pg_dump et psql sont disponibles
function check_postgresql_tools() {
    if command -v pg_dump &> /dev/null && command -v psql &> /dev/null; then
        print_success "PostgreSQL tools détectés:"
        print_info "   - pg_dump: $(pg_dump --version)"
        print_info "   - psql: $(psql --version)"
        return 0
    else
        print_error "PostgreSQL tools non trouvés!"
        print_warning "   Installez PostgreSQL client:"
        print_warning "   - Debian/Ubuntu: sudo apt install postgresql-client"
        print_warning "   - macOS: brew install postgresql"
        return 1
    fi
}

# Charger les variables d'environnement depuis .env
function load_env_file() {
    local env_file="$(dirname "$0")/../.env"
    if [ -f "$env_file" ]; then
        print_info "📄 Chargement des variables depuis .env..."
        export $(grep -v '^#' "$env_file" | grep -v '^$' | xargs)
        return 0
    else
        print_warning "⚠️  Fichier .env non trouvé, utilisation des valeurs par défaut"
        return 1
    fi
}

# Exporter la base de données locale
function export_local_database() {
    local host="${POSTGRES_HOST:-localhost}"
    local port="${POSTGRES_PORT:-5432}"
    local db="${POSTGRES_DB:-gsurvey}"
    local user="${POSTGRES_USER:-postgres}"
    local password="${POSTGRES_PASSWORD:-postgres}"
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local output_file="$(dirname "$0")/../backup_gsurvey_${timestamp}.sql"
    
    print_info "📤 Export de la base de données locale..."
    print_info "   Host: $host"
    print_info "   Port: $port"
    print_info "   Database: $db"
    print_info "   User: $user"
    
    export PGPASSWORD="$password"
    
    if pg_dump -h "$host" -p "$port" -U "$user" -d "$db" -F p -n public --no-owner --no-acl -f "$output_file"; then
        print_success "✅ Export réussi: $output_file"
        unset PGPASSWORD
        echo "$output_file"
        return 0
    else
        print_error "❌ Erreur lors de l'export"
        unset PGPASSWORD
        return 1
    fi
}

# Nettoyer le fichier SQL pour Supabase
function clean_sql_file_for_supabase() {
    local input_file="$1"
    
    if [ ! -f "$input_file" ]; then
        print_error "❌ Fichier non trouvé: $input_file"
        return 1
    fi
    
    local output_file="${input_file%.sql}_cleaned.sql"
    print_info "🧹 Nettoyage du fichier SQL pour Supabase..."
    
    # Créer le fichier nettoyé
    {
        echo "-- Export G-Survey pour Supabase"
        echo "-- Généré le $(date '+%Y-%m-%d %H:%M:%S')"
        echo "-- IMPORTANT: Activez PostGIS avant d'importer:"
        echo "--   CREATE EXTENSION IF NOT EXISTS postgis;"
        echo ""
        
        # Supprimer les commandes CREATE DATABASE, ALTER DATABASE
        # Supprimer les commandes CREATE EXTENSION, ALTER EXTENSION
        # Supprimer les commandes SET search_path
        # Supprimer les commentaires de pg_dump
        sed -E \
            -e '/^CREATE DATABASE/d' \
            -e '/^ALTER DATABASE/d' \
            -e '/^CREATE EXTENSION/d' \
            -e '/^ALTER EXTENSION/d' \
            -e '/^SET search_path/d' \
            -e '/^--.*pg_dump/d' \
            "$input_file" | \
        sed -E '/^$/N;/^\n$/d'  # Supprimer les lignes vides multiples
    } > "$output_file"
    
    print_success "✅ Fichier nettoyé: $output_file"
    echo "$output_file"
}

# Importer dans Supabase
function import_to_supabase() {
    local supabase_uri="$1"
    local sql_file="$2"
    
    if [ -z "$supabase_uri" ]; then
        print_warning "⚠️  URI Supabase non fournie"
        print_info "Format attendu: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
        read -p "Entrez l'URI de connexion Supabase: " supabase_uri
    fi
    
    if [ -z "$sql_file" ] || [ ! -f "$sql_file" ]; then
        print_error "❌ Fichier SQL non trouvé: $sql_file"
        return 1
    fi
    
    print_info "📥 Import vers Supabase..."
    print_warning "⚠️  Assurez-vous que PostGIS est activé sur Supabase !"
    print_info "   Exécutez dans SQL Editor: CREATE EXTENSION IF NOT EXISTS postgis;"
    
    read -p "Continuer l'import ? (O/N): " confirm
    if [ "$confirm" != "O" ] && [ "$confirm" != "o" ]; then
        print_info "Import annulé"
        return 1
    fi
    
    # Extraire le mot de passe de l'URI pour PGPASSWORD
    if [[ "$supabase_uri" =~ postgresql://[^:]+:([^@]+)@ ]]; then
        export PGPASSWORD="${BASH_REMATCH[1]}"
    fi
    
    if psql "$supabase_uri" -f "$sql_file"; then
        print_success "✅ Import réussi dans Supabase !"
        unset PGPASSWORD
        return 0
    else
        print_error "❌ Erreur lors de l'import"
        unset PGPASSWORD
        return 1
    fi
}

# Script principal
print_info "🚀 Script d'export/import G-Survey vers Supabase"
print_info "=================================================="
echo ""

# Vérifier les outils PostgreSQL
if ! check_postgresql_tools; then
    exit 1
fi

echo ""

# Charger les variables d'environnement
load_env_file

echo ""

# Si un fichier d'entrée est fourni, nettoyer et importer
if [ -n "$INPUT_FILE" ]; then
    cleaned_file=$(clean_sql_file_for_supabase "$INPUT_FILE")
    if [ -n "$cleaned_file" ] && [ "$IMPORT_TO_SUPABASE" = true ]; then
        import_to_supabase "$SUPABASE_URI" "$cleaned_file"
    fi
    exit 0
fi

# Sinon, exporter depuis la base locale
exported_file=$(export_local_database)

if [ -z "$exported_file" ]; then
    print_error "❌ Échec de l'export"
    exit 1
fi

echo ""

# Nettoyer le fichier pour Supabase
cleaned_file=$(clean_sql_file_for_supabase "$exported_file")

if [ -z "$cleaned_file" ]; then
    print_error "❌ Échec du nettoyage"
    exit 1
fi

echo ""
print_success "✅ Fichier prêt pour Supabase: $cleaned_file"
echo ""

# Instructions pour l'import manuel
print_info "📋 Prochaines étapes:"
print_info "   1. Activez PostGIS sur Supabase (SQL Editor):"
print_info "      CREATE EXTENSION IF NOT EXISTS postgis;"
echo ""
print_info "   2. Importez le fichier:"
print_info "      psql \"postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres\" -f \"$cleaned_file\""
echo ""
print_info "   3. Ou utilisez ce script avec --import:"
print_info "      ./export-db-to-supabase.sh --import --uri \"postgresql://...\" --file \"$cleaned_file\""
echo ""

# Si l'option d'import automatique est activée
if [ "$IMPORT_TO_SUPABASE" = true ]; then
    import_to_supabase "$SUPABASE_URI" "$cleaned_file"
fi



