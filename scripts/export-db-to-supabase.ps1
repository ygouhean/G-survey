# Script PowerShell pour exporter la base de données locale et l'importer sur Supabase
# Usage: .\export-db-to-supabase.ps1 [-ImportToSupabase] [-SupabaseUri "postgresql://..."]

param(
    [switch]$ImportToSupabase,
    [string]$SupabaseUri = "",
    [string]$InputFile = ""
)

# Couleurs pour les messages
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Error { Write-ColorOutput Red $args }
function Write-Info { Write-ColorOutput Cyan $args }
function Write-Warning { Write-ColorOutput Yellow $args }

# Vérifier que pg_dump et psql sont disponibles
function Test-PostgreSQLTools {
    try {
        $pgDumpVersion = pg_dump --version 2>&1
        $psqlVersion = psql --version 2>&1
        Write-Success "✅ PostgreSQL tools détectés:"
        Write-Info "   - pg_dump: $pgDumpVersion"
        Write-Info "   - psql: $psqlVersion"
        return $true
    } catch {
        Write-Error "❌ PostgreSQL tools non trouvés!"
        Write-Warning "   Ajoutez PostgreSQL au PATH:"
        Write-Warning "   C:\Program Files\PostgreSQL\17\bin"
        return $false
    }
}

# Charger les variables d'environnement depuis .env
function Load-EnvFile {
    $envFile = Join-Path $PSScriptRoot "..\.env"
    if (Test-Path $envFile) {
        Write-Info "📄 Chargement des variables depuis .env..."
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                # Supprimer les guillemets si présents
                $value = $value -replace '^["\']|["\']$', ''
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
                Write-Info "   ✓ $name"
            }
        }
        return $true
    } else {
        Write-Warning "⚠️  Fichier .env non trouvé, utilisation des valeurs par défaut"
        return $false
    }
}

# Exporter la base de données locale
function Export-LocalDatabase {
    $host = [Environment]::GetEnvironmentVariable("POSTGRES_HOST", "Process") ?? "localhost"
    $port = [Environment]::GetEnvironmentVariable("POSTGRES_PORT", "Process") ?? "5432"
    $db = [Environment]::GetEnvironmentVariable("POSTGRES_DB", "Process") ?? "gsurvey"
    $user = [Environment]::GetEnvironmentVariable("POSTGRES_USER", "Process") ?? "postgres"
    $password = [Environment]::GetEnvironmentVariable("POSTGRES_PASSWORD", "Process") ?? "postgres"
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $outputFile = Join-Path $PSScriptRoot "..\backup_gsurvey_$timestamp.sql"
    
    Write-Info "📤 Export de la base de données locale..."
    Write-Info "   Host: $host"
    Write-Info "   Port: $port"
    Write-Info "   Database: $db"
    Write-Info "   User: $user"
    
    # Définir la variable d'environnement PGPASSWORD
    $env:PGPASSWORD = $password
    
    try {
        # Exporter en format SQL
        pg_dump -h $host -p $port -U $user -d $db -F p -n public --no-owner --no-acl -f $outputFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✅ Export réussi: $outputFile"
            return $outputFile
        } else {
            Write-Error "❌ Erreur lors de l'export (code: $LASTEXITCODE)"
            return $null
        }
    } catch {
        Write-Error "❌ Erreur: $_"
        return $null
    } finally {
        # Nettoyer la variable d'environnement
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    }
}

# Nettoyer le fichier SQL pour Supabase
function Clean-SQLFileForSupabase {
    param([string]$InputFile)
    
    if (-not (Test-Path $InputFile)) {
        Write-Error "❌ Fichier non trouvé: $InputFile"
        return $null
    }
    
    $outputFile = $InputFile -replace '\.sql$', '_cleaned.sql'
    Write-Info "🧹 Nettoyage du fichier SQL pour Supabase..."
    
    $content = Get-Content $InputFile -Raw
    
    # Supprimer les commandes CREATE DATABASE
    $content = $content -replace 'CREATE DATABASE .+?;', ''
    $content = $content -replace 'ALTER DATABASE .+? OWNER TO .+?;', ''
    
    # Supprimer les commandes CREATE EXTENSION (PostGIS sera activé manuellement)
    $content = $content -replace 'CREATE EXTENSION IF NOT EXISTS .+?;', ''
    $content = $content -replace 'CREATE EXTENSION .+?;', ''
    
    # Supprimer les commandes ALTER EXTENSION
    $content = $content -replace 'ALTER EXTENSION .+?;', ''
    
    # Supprimer les commandes SET search_path
    $content = $content -replace "SET search_path = .+?;", ''
    
    # Supprimer les commentaires de pg_dump
    $content = $content -replace '^--.*$', '' -replace '\r\n\r\n', "`r`n"
    
    # Nettoyer les lignes vides multiples
    $content = $content -replace "(\r?\n\s*){3,}", "`r`n`r`n"
    
    # Ajouter un commentaire en haut
    $header = @"
-- Export G-Survey pour Supabase
-- Généré le $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
-- IMPORTANT: Activez PostGIS avant d'importer:
--   CREATE EXTENSION IF NOT EXISTS postgis;

"@
    
    $content = $header + $content
    
    Set-Content -Path $outputFile -Value $content -Encoding UTF8
    Write-Success "✅ Fichier nettoyé: $outputFile"
    
    return $outputFile
}

# Importer dans Supabase
function Import-ToSupabase {
    param(
        [string]$SupabaseUri,
        [string]$SqlFile
    )
    
    if (-not $SupabaseUri) {
        Write-Warning "⚠️  URI Supabase non fournie"
        Write-Info "Format attendu: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
        $SupabaseUri = Read-Host "Entrez l'URI de connexion Supabase"
    }
    
    if (-not $SqlFile) {
        Write-Error "❌ Fichier SQL non spécifié"
        return $false
    }
    
    if (-not (Test-Path $SqlFile)) {
        Write-Error "❌ Fichier non trouvé: $SqlFile"
        return $false
    }
    
    Write-Info "📥 Import vers Supabase..."
    Write-Warning "⚠️  Assurez-vous que PostGIS est activé sur Supabase !"
    Write-Info "   Exécutez dans SQL Editor: CREATE EXTENSION IF NOT EXISTS postgis;"
    
    $confirm = Read-Host "Continuer l'import ? (O/N)"
    if ($confirm -ne "O" -and $confirm -ne "o") {
        Write-Info "Import annulé"
        return $false
    }
    
    try {
        # Extraire le mot de passe de l'URI pour PGPASSWORD
        if ($SupabaseUri -match 'postgresql://[^:]+:([^@]+)@') {
            $password = $matches[1]
            $env:PGPASSWORD = $password
        }
        
        psql $SupabaseUri -f $SqlFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✅ Import réussi dans Supabase !"
            return $true
        } else {
            Write-Error "❌ Erreur lors de l'import (code: $LASTEXITCODE)"
            return $false
        }
    } catch {
        Write-Error "❌ Erreur: $_"
        return $false
    } finally {
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    }
}

# Script principal
Write-Info "🚀 Script d'export/import G-Survey vers Supabase"
Write-Info "=================================================="
Write-Info ""

# Vérifier les outils PostgreSQL
if (-not (Test-PostgreSQLTools)) {
    exit 1
}

Write-Info ""

# Charger les variables d'environnement
Load-EnvFile

Write-Info ""

# Si un fichier d'entrée est fourni, nettoyer et importer
if ($InputFile) {
    $cleanedFile = Clean-SQLFileForSupabase -InputFile $InputFile
    if ($cleanedFile -and $ImportToSupabase) {
        Import-ToSupabase -SupabaseUri $SupabaseUri -SqlFile $cleanedFile
    }
    exit 0
}

# Sinon, exporter depuis la base locale
$exportedFile = Export-LocalDatabase

if (-not $exportedFile) {
    Write-Error "❌ Échec de l'export"
    exit 1
}

Write-Info ""

# Nettoyer le fichier pour Supabase
$cleanedFile = Clean-SQLFileForSupabase -InputFile $exportedFile

if (-not $cleanedFile) {
    Write-Error "❌ Échec du nettoyage"
    exit 1
}

Write-Info ""
Write-Success "✅ Fichier prêt pour Supabase: $cleanedFile"
Write-Info ""

# Instructions pour l'import manuel
Write-Info "📋 Prochaines étapes:"
Write-Info "   1. Activez PostGIS sur Supabase (SQL Editor):"
Write-Info "      CREATE EXTENSION IF NOT EXISTS postgis;"
Write-Info ""
Write-Info "   2. Importez le fichier:"
Write-Info "      psql `"postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`" -f `"$cleanedFile`""
Write-Info ""
Write-Info "   3. Ou utilisez ce script avec -ImportToSupabase:"
Write-Info "      .\export-db-to-supabase.ps1 -ImportToSupabase -SupabaseUri `"postgresql://...`" -InputFile `"$cleanedFile`""
Write-Info ""

# Si l'option d'import automatique est activée
if ($ImportToSupabase) {
    Import-ToSupabase -SupabaseUri $SupabaseUri -SqlFile $cleanedFile
}





