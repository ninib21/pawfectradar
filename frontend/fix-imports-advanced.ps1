# 🔧 Pawfectradar Frontend Import-Collision Auto-Fix (Windows PowerShell)
# - Dedupes/merges multiple `lucide-react` imports per file into ONE import
# - Aliases clashing icons (User, Calendar, Settings, Star, Shield, MapPin, DollarSign, CheckCircle, TrendingUp, Review) -> …Icon
# - Updates JSX tags to new icon names
# - Removes duplicate React imports (default + namespace)
# - Backs up each modified file to scripts/backup-frontend-<timestamp>/

$ErrorActionPreference = 'Stop'

# 0) Ensure we are in the FRONTEND folder
if (-not (Test-Path package.json)) { Write-Error "Run this INSIDE C:\Pawfectradar\frontend"; exit 1 }

# 1) Backup dir
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "scripts\backup-frontend-$stamp"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# 2) Icon names likely to collide with domain names — we will alias them to <Name>Icon
$collisionMap = @{
  'User'        = 'UserIcon'
  'Calendar'    = 'CalendarIcon'
  'Settings'    = 'SettingsIcon'
  'Star'        = 'StarIcon'
  'Shield'      = 'ShieldIcon'
  'MapPin'      = 'MapPinIcon'
  'DollarSign'  = 'DollarSignIcon'
  'CheckCircle' = 'CheckCircleIcon'
  'TrendingUp'  = 'TrendingUpIcon'
  'Review'      = 'ReviewIcon'
}

# 3) Helper: parse import spec item "Name" or "Name as Alias"
function Parse-Spec($s) {
  $m = [regex]::Match($s.Trim(), '^(?<base>[A-Za-z_]\w*)(?:\s+as\s+(?<alias>[A-Za-z_]\w*))?$')
  if (-not $m.Success) { return $null }
  return [pscustomobject]@{ base = $m.Groups['base'].Value; alias = $m.Groups['alias'].Value }
}

# 4) Process all source files
$files = Get-ChildItem -Recurse -File -Include *.jsx,*.tsx,*.js,*.ts | Where-Object { $_.FullName -match "\\src\\" }
foreach ($f in $files) {
  $code = Get-Content $f.FullName -Raw
  $orig = $code
  $modified = $false

  # A) Remove duplicate default React import when "* as React" exists
  $hasStar   = [regex]::IsMatch($code,'(?m)^\s*import\s+\*\s+as\s+React\s+from\s+["'']react["'']\s*;?\s*$')
  $hasDefault= [regex]::IsMatch($code,'(?m)^\s*import\s+React\s+from\s+["'']react["'']\s*;?\s*$')
  if ($hasStar -and $hasDefault) {
    $code = [regex]::Replace($code,'(?m)^\s*import\s+React\s+from\s+["'']react["'']\s*;?\s*\r?\n','')
    $modified = $true
  }

  # B) Gather all imported identifiers from non-lucide imports to detect collisions (e.g., import { User } from '@api/entities')
  $otherImportIdents = New-Object System.Collections.Generic.HashSet[string]
  foreach ($m in [regex]::Matches($code,'(?ms)^\s*import\s*\{(?<spec>[^}]+)\}\s*from\s*["''](?!lucide-react)["''][^"''\r\n]+["'']\s*;?\s*$')) {
    foreach ($p in ($m.Groups['spec'].Value -split ',')) {
      $sp = Parse-Spec $p
      if ($sp) { [void]$otherImportIdents.Add( ($sp.alias -ne '' ? $sp.alias : $sp.base) ) }
    }
  }

  # C) Find ALL lucide-react import blocks (single or multi-line)
  $lucideMatches = [regex]::Matches($code,'(?ms)^\s*import\s*\{(?<spec>[^}]+)\}\s*from\s*["'']lucide-react["'']\s*;?\s*$')
  if ($lucideMatches.Count -gt 0) {
    # Collect/normalize all specifiers
    $specList = @()
    foreach ($m in $lucideMatches) {
      $raw = $m.Groups['spec'].Value
      foreach ($token in ($raw -split ',')) {
        $sp = Parse-Spec $token
        if ($sp -eq $null) { continue }
        # If base collides with another imported identifier, ensure alias to <Name>Icon
        $desiredAlias = $collisionMap[$sp.base]
        $finalAlias = if ($sp.alias) { $sp.alias } elseif ($otherImportIdents.Contains($sp.base)) { $desiredAlias } else { $null }

        # If alias already used in this list, avoid duplicate by keeping first occurrence only
        $key = ($finalAlias ?? $sp.base)
        if (-not ($specList | Where-Object { $_.key -eq $key })) {
          $specList += [pscustomobject]@{ base=$sp.base; alias=$finalAlias; key=$key }
        }
      }
    }

    # Build unique import line
    if ($specList.Count -gt 0) {
      $specText = ($specList | ForEach-Object { if ($_.alias) { "$($_.base) as $($_.alias)" } else { "$($_.base)" } }) -join ', '
      $newImport = "import { $specText } from 'lucide-react';"

      # Replace first lucide import with the merged one; remove the rest
      $first = $lucideMatches[0]
      $start = $first.Index; $len = $first.Length
      $code = $code.Remove($start, $len).Insert($start, $newImport)
      for ($i = $lucideMatches.Count-1; $i -ge 1; $i--) {
        $m = $lucideMatches[$i]
        $code = $code.Remove($m.Index, $m.Length)
      }
      $modified = $true

      # Update JSX tags where we created an alias for a colliding icon (e.g., <User /> -> <UserIcon />)
      foreach ($s in $specList) {
        if ($s.alias -and $collisionMap.ContainsKey($s.base)) {
          $from = [regex]::Escape($s.base)
          $to   = $s.alias
          $code = $code -replace "<\s*$from(\b|[\s>/])","<$to`$1"
          $code = $code -replace "</\s*$from\s*>","</$to>"
          $modified = $true
        }
      }
    }
  }

  # D) Clean stray leading semicolons (rare babel trips)
  $code = [regex]::Replace($code,'^(;\s*\r?\n)+','', 'Multiline')

  if ($modified -and $code -ne $orig) {
    Copy-Item $f.FullName (Join-Path $backupDir $f.Name) -Force
    Set-Content $f.FullName $code -Encoding UTF8
    Write-Host "✅ Fixed imports in: $($f.FullName)"
  }
}

Write-Host "`n🚀 Restarting dev server (you can Ctrl+C to stop after it compiles)..."
npm run dev
