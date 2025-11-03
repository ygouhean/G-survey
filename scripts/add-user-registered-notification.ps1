# Script PowerShell pour ajouter le type de notification user_registered
# Windows

Write-Host "🔄 Application de la migration : add-user-registered-notification-type.sql" -ForegroundColor Cyan

# Vérifier si psql est disponible
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "❌ Erreur : psql n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "📝 Veuillez installer PostgreSQL et ajouter psql au PATH" -ForegroundColor Yellow
    exit 1
}

# Récupérer les informations de connexion
$env:PGPASSWORD = "gsurvey2024"
$dbName = "gsurvey_db"
$dbUser = "gsurvey_user"
$dbHost = "localhost"
$dbPort = "5432"

Write-Host "📊 Base de données : $dbName" -ForegroundColor Blue
Write-Host "👤 Utilisateur : $dbUser" -ForegroundColor Blue
Write-Host "🖥️  Serveur : $dbHost`:$dbPort" -ForegroundColor Blue
Write-Host ""

# Exécuter la migration
$migrationFile = Join-Path $PSScriptRoot "..\server\migrations\add-user-registered-notification-type.sql"

Write-Host "📂 Fichier de migration : $migrationFile" -ForegroundColor Blue
Write-Host ""

if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Erreur : Fichier de migration non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host "⏳ Exécution de la migration..." -ForegroundColor Yellow

psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $migrationFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migration appliquée avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Prochaines étapes :" -ForegroundColor Cyan
    Write-Host "  1. Redémarrer le serveur backend : cd server && npm start" -ForegroundColor White
    Write-Host "  2. Créer un nouveau compte pour tester" -ForegroundColor White
    Write-Host "  3. Se connecter en tant qu'admin pour voir la notification" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors de l'application de la migration" -ForegroundColor Red
    Write-Host "📝 Vérifiez les logs ci-dessus pour plus de détails" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Nettoyer la variable d'environnement
Remove-Item Env:PGPASSWORD

