# ============================================
# G-Survey - Script de Réinitialisation DB (Windows)
# ============================================

Write-Host "⚠️  ATTENTION : Réinitialisation de la base de données" -ForegroundColor Red
Write-Host ""
Write-Host "Cette action va SUPPRIMER toutes les données :"
Write-Host "  - Tous les utilisateurs (sauf l'admin par défaut)"
Write-Host "  - Tous les sondages"
Write-Host "  - Toutes les réponses"
Write-Host "  - Toutes les équipes"
Write-Host ""

$confirmation = Read-Host "Êtes-vous sûr ? (tapez 'OUI' pour continuer)"

if ($confirmation -ne "OUI") {
    Write-Host "Opération annulée" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🗑️  Suppression de la base de données..." -ForegroundColor Blue

# Charger les variables d'environnement
$envFile = ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#][^=]*)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

$dbName = $env:POSTGRES_DB
if (-not $dbName) {
    $dbName = "gsurvey"
}

$dbUser = $env:POSTGRES_USER
if (-not $dbUser) {
    $dbUser = "postgres"
}

Write-Host "Connexion à PostgreSQL..."
$env:PGPASSWORD = $env:POSTGRES_PASSWORD

# Supprimer toutes les tables
$sql = @"
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
CREATE EXTENSION IF NOT EXISTS postgis;
"@

$sql | psql -U $dbUser -d $dbName -h localhost

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de données réinitialisée" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de la réinitialisation" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Redémarrage du serveur..." -ForegroundColor Blue
Write-Host "L'admin par défaut sera recréé au prochain démarrage"
Write-Host ""
Write-Host "Démarrez le serveur avec : npm run dev" -ForegroundColor Yellow
Write-Host ""


