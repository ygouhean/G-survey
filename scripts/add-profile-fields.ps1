# Script PowerShell pour ajouter les champs de profil à la base de données
# Date: 2025-11-02
# Description: Ajoute username, gender, country, sector, organization_type à la table users

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Migration: Ajout des champs de profil" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Charger les variables d'environnement depuis .env si disponible
$envFile = Join-Path $PSScriptRoot ".." ".env"
if (Test-Path $envFile) {
    Write-Host "Chargement des variables d'environnement depuis .env..." -ForegroundColor Yellow
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Configuration de la base de données
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "gsurvey" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "postgres" }

Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  Hôte: $DB_HOST"
Write-Host "  Port: $DB_PORT"
Write-Host "  Base de données: $DB_NAME"
Write-Host "  Utilisateur: $DB_USER"
Write-Host ""

# Définir la variable d'environnement PGPASSWORD pour éviter la demande de mot de passe
$env:PGPASSWORD = $DB_PASSWORD

# Chemin vers le fichier de migration
$migrationFile = Join-Path $PSScriptRoot ".." "server" "migrations" "add-profile-fields.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Erreur: Le fichier de migration n'existe pas: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "Fichier de migration trouvé: $migrationFile" -ForegroundColor Green
Write-Host ""

# Vérifier si psql est disponible
$psqlCommand = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlCommand) {
    Write-Host "❌ Erreur: psql n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "Veuillez installer PostgreSQL ou ajouter le dossier bin de PostgreSQL à votre PATH" -ForegroundColor Yellow
    Write-Host "Exemple: C:\Program Files\PostgreSQL\17\bin" -ForegroundColor Yellow
    exit 1
}

Write-Host "Application de la migration..." -ForegroundColor Yellow

# Exécuter la migration
try {
    $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $migrationFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration appliquée avec succès !" -ForegroundColor Green
        Write-Host ""
        Write-Host "Nouveaux champs ajoutés à la table users:" -ForegroundColor Cyan
        Write-Host "  - username (VARCHAR 255, UNIQUE)" -ForegroundColor White
        Write-Host "  - gender (VARCHAR 20)" -ForegroundColor White
        Write-Host "  - country (VARCHAR 100)" -ForegroundColor White
        Write-Host "  - sector (VARCHAR 100)" -ForegroundColor White
        Write-Host "  - organization_type (VARCHAR 100)" -ForegroundColor White
        Write-Host ""
        Write-Host "Vous pouvez maintenant utiliser les nouvelles fonctionnalités de profil !" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Erreur lors de l'application de la migration" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
    exit 1
} finally {
    # Nettoyer la variable d'environnement du mot de passe
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Migration terminée" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan


