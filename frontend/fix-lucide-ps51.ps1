# 🔧 Pawfectradar — Lucide Import & JSX Auto-Fix (PowerShell 5.1 safe)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path package.json)) { Write-Error "Run this INSIDE your FRONTEND folder."; exit 1 }

# Backup dir
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "scripts\backup-frontend-$stamp"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# Icons that should ALWAYS be aliased to <Name>Icon to avoid name collisions
$aliasList = @(
  'User','Review','Calendar','Settings','Star','Shield','MapPin','DollarSign','CheckCircle','TrendingUp',
  'Bell','Search','Heart','X','Plus','Minus','Edit','Trash','Upload','Download'
)

function Parse-Spec([string]$s) {
  $m = [regex]::Match(($s).Trim(), '^(?<base>[A-Za-z_]\w*)(?:\s+as\s+(?<alias>[A-Za-z_]\w*))?$')
  if ($m.Success) {
    return [pscustomobject]@{ base = $m.Groups['base'].Value; alias = $m.Groups['alias'].Value }
  }
  return $null
}

# All source files
$files = Get-ChildItem -Recurse -File -Include *.jsx,*.tsx,*.js,*.ts | Where-Object { $_.FullName -match '\\src\\' }

foreach ($f in $files) {
  $code = Get-Content $f.FullName -Raw
  $orig = $code
  $modified = $false

  # 1) Remove duplicate default React import if "* as React" exists
  $hasStar    = [regex]::IsMatch($code,'(?m)^\s*import\s+\*\s+as\s+React\s+from\s+["'']react["'']\s*;?\s*$')
  $hasDefault = [regex]::IsMatch($code,'(?m)^\s*import\s+React\s+from\s+["'']react["'']\s*;?\s*$')
  if ($hasStar -and $hasDefault) {
    $code = [regex]::Replace($code,'(?m)^\s*import\s+React\s+from\s+["'']react["'']\s*;?\s*\r?\n','')
    $modified = $true
  }

  # 2) Gather other imported identifiers (NOT lucide) to detect collisions
  $otherIdents = New-Object System.Collections.Generic.HashSet[string]
  $rxOther = '(?ms)^\s*import\s*\{(?<spec>[^}]+)\}\s*from\s*["''](?!lucide-react)["''][^"''\r\n]+["'']\s*;?\s*$'
  foreach ($m in [regex]::Matches($code,$rxOther)) {
    $spec = $m.Groups['spec'].Value
    foreach ($tok in ($spec -split ',')) {
      $sp = Parse-Spec $tok
      if ($sp -ne $null) {
        $name = if ([string]::IsNullOrEmpty($sp.alias)) { $sp.base } else { $sp.alias }
        [void]$otherIdents.Add($name)
      }
    }
  }

  # 3) Find all lucide-react imports
  $rxLucide = '(?ms)^\s*import\s*\{(?<spec>[^}]*)\}\s*from\s*["'']lucide-react["'']\s*;?\s*$'
  $lucideMatches = [regex]::Matches($code,$rxLucide)

  if ($lucideMatches.Count -gt 0) {

    # Parse & normalize all specifiers; build unique list with an "eff" (effective) name
    $items = @()  # each: @{ base=..; alias=..; eff=.. }
    foreach ($m in $lucideMatches) {
      $spec = ($m.Groups['spec'].Value) -replace '\r',''
      foreach ($tok in ($spec -split ',')) {
        $sp = Parse-Spec $tok
        if ($sp -eq $null) { continue }

        # Desired alias: <Base>Icon for names in aliasList
        $targetAlias = $null
        if ($aliasList -contains $sp.base) { $targetAlias = ($sp.base + 'Icon') }

        if (-not [string]::IsNullOrEmpty($sp.alias)) {
          if ($targetAlias -ne $null) {
            if (($sp.alias -notmatch '^[A-Za-z_]\w*$') -or ($sp.alias -ne $targetAlias)) {
              $sp.alias = $targetAlias
            }
          }
        } elseif ($targetAlias -ne $null) {
          $sp.alias = $targetAlias
        }

        # Effective name used in code
        $eff = if ([string]::IsNullOrEmpty($sp.alias)) { $sp.base } else { $sp.alias }

        # If effective name collides with other imports, rename to <Base>LucideIcon
        if ($otherIdents.Contains($eff)) {
          $sp.alias = ($sp.base + 'LucideIcon')
          $eff = $sp.alias
        }

        # De-dupe by effective name
        $exists = $false
        foreach ($it in $items) {
          if ($it.eff -eq $eff) { $exists = $true; break }
        }
        if (-not $exists) {
          $items += @{ base = $sp.base; alias = $sp.alias; eff = $eff }
        }
      }
    }

    if ($items.Count -gt 0) {
      # Build clean import text
      $specParts = @()
      foreach ($it in $items) {
        if ([string]::IsNullOrEmpty($it.alias)) { $specParts += $it.base } else { $specParts += ("{0} as {1}" -f $it.base, $it.alias) }
      }
      $newImport = "import { {0} } from 'lucide-react';" -f ($specParts -join ', ')

      # Remove ALL lucide imports in the file
      $codeNoLucide = [regex]::Replace($code,$rxLucide,'')
      # Insert the new import at the top, but after 'use client' if present
      $useClientMatch = [regex]::Match($codeNoLucide, '^(?<uc>\s*["'']use client["''];?\s*\r?\n)')
      if ($useClientMatch.Success) {
        $prefix = $useClientMatch.Groups['uc'].Value
        $rest = $codeNoLucide.Substring($prefix.Length)
        $code = $prefix + $newImport + "`r`n" + $rest
      } else {
        $code = $newImport + "`r`n" + $codeNoLucide
      }
      $modified = $true

      # Update JSX tags for icons we aliased/changed (e.g., <User> -> <UserIcon>)
      foreach ($it in $items) {
        if (-not [string]::IsNullOrEmpty($it.alias) -and $it.alias -ne $it.base) {
          $from = [regex]::Escape($it.base)
          $to   = $it.alias
          $code = $code -replace ("<\s*{0}(\b|[\s>/])" -f $from), ("<{0}$1" -f $to)
          $code = $code -replace ("</\s*{0}\s*>" -f $from), ("</{0}>" -f $to)
        }
      }
    }
  }

  # 4) Clean stray "as" without alias (turn "X as" into "X")
  $code = [regex]::Replace($code, '(?m)(\{[^}]*)(\b[A-Za-z_]\w*\s+as\s*)([,}\r\n])', '$1$3')

  # 5) Remove stray leading semicolons
  $code = [regex]::Replace($code, '^(;\s*\r?\n)+', '', 'Multiline')

  if ($modified -and $code -ne $orig) {
    Copy-Item $f.FullName (Join-Path $backupDir $f.Name) -Force
    Set-Content $f.FullName $code -Encoding UTF8
    Write-Host "✅ Fixed: $($f.FullName)"
  }
}

Write-Host "`n🎉 Done. Now restart dev:"
Write-Host "  npm run dev"
Write-Host "Backups in: $backupDir"
