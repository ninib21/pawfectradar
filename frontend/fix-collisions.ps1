# 🔧 Pawfectradar Frontend Collision Fixer (Windows PowerShell)
# - Fixes "Identifier 'X' has already been declared" from lucide-react vs app imports
# - Cleans duplicate React imports
# - (Optional) ensures Vite @ alias exists

$ErrorActionPreference = 'Stop'

# 0) Ensure we're in the frontend folder
if (-not (Test-Path package.json)) {
  if (Test-Path ..\package.json) { Set-Location .. }
  if (-not (Test-Path package.json)) { Write-Error "Run this INSIDE your FRONTEND folder (where package.json is)."; exit 1 }
}

# 1) Create a backup folder for modified files
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "scripts\backup-frontend-$stamp"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# 2) Icons likely to clash with domain names. We'll alias them to <Name>Icon.
$iconMap = @{
  'User'        = 'UserIcon'
  'Review'      = 'ReviewIcon'
  'Calendar'    = 'CalendarIcon'
  'Shield'      = 'ShieldIcon'
  'Star'        = 'StarIcon'
  'Settings'    = 'SettingsIcon'
  'MapPin'      = 'MapPinIcon'
  'DollarSign'  = 'DollarSignIcon'
  'CheckCircle' = 'CheckCircleIcon'
  'TrendingUp'  = 'TrendingUpIcon'
}

# 3) Process all JS/TS/JSX/TSX files
$files = Get-ChildItem -Recurse -File -Include *.jsx,*.tsx,*.js,*.ts

foreach ($f in $files) {
  $code = Get-Content $f.FullName -Raw
  $orig = $code

  # --- A) Remove duplicate default React import when "* as React" exists ---
  $hasStar   = [regex]::IsMatch($code, '(?m)^\s*import\s+\*\s+as\s+React\s+from\s+["'']react["'']\s*;?\s*$')
  $hasDefault= [regex]::IsMatch($code, '(?m)^\s*import\s+React\s+from\s+["'']react["'']\s*;?\s*$')
  if ($hasStar -and $hasDefault) {
    $code = [regex]::Replace($code, '(?m)^\s*import\s+React\s+from\s+["'']react["'']\s*;?\s*\r?\n', '')
  }

  # --- B) For any lucide-react import, alias clashing names and update JSX tags ---
  if ($code -match "from\s+['""]lucide-react['""]") {

    # For each icon, alias in import lines and replace JSX tags
    foreach ($k in $iconMap.Keys) {
      $alias = $iconMap[$k]

      # 1) In import lines FROM lucide-react, change "{ ..., User, ... }" to "{ ..., User as UserIcon, ... }"
      $code = [regex]::Replace($code, '(?m)^\s*import\s*\{[^}]*\}\s*from\s*["'']lucide-react["'']\s*;?\s*$', {
        param($m)
        $line = $m.Value
        if ($line -match "\b$k\b" -and $line -notmatch "\b$k\s+as\s+$alias\b") {
          # Replace only the standalone token inside the braces
          # (avoid replacing substrings of other identifiers)
          $line = $line -replace "(?<=\{[^}]*)\b$k\b", "$k as $alias"
        }
        return $line
      })

      # 2) Replace JSX usages: <User ...> and </User> -> <UserIcon ...>, </UserIcon>
      $code = $code -replace "<\s*$k(\b|[\s>])", "<$alias`$1"
      $code = $code -replace "</\s*$k\s*>", "</$alias>"
    }
  }

  # --- C) Clean stray leading semicolon lines (seen in earlier errors) ---
  $code = [regex]::Replace($code, '^(;\s*\r?\n)+', '', 'Multiline')

  if ($code -ne $orig) {
    # backup original then write fixed
    Copy-Item $f.FullName (Join-Path $backupDir $f.Name) -Force
    Set-Content $f.FullName $code -Encoding UTF8
    Write-Host "✅ Fixed: $($f.FullName)"
  }
}

# 4) Ensure Vite config has '@' alias (optional but helpful)
$vite = 'vite.config.mjs'
if (Test-Path $vite) {
  $v = Get-Content $vite -Raw
  $changed = $false
  if ($v -notmatch "@vitejs/plugin-react") { $v = "import react from '@vitejs/plugin-react';`n" + $v; $changed = $true }
  if ($v -notmatch "alias") {
    $inject = @"
  resolve: {
    alias: {
      '@': require('node:path').resolve(process.cwd(), 'src'),
    },
  },
"@
    $v = $v -replace "defineConfig\(\{", "defineConfig({`n$inject"
    $changed = $true
  }
  if ($changed) { Set-Content $vite $v -Encoding UTF8; Write-Host "🛠️  Patched vite.config.mjs with @ alias" }
}

Write-Host "`n🎉 Done. Restart the dev server:"
Write-Host "  npm run dev"
Write-Host "If you still see a collision, paste the exact error line and I'll extend the alias map."
