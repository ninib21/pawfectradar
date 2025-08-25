# 🔧 Pawfectradar — Lucide/React import sanitizer (PS 5.1 compatible)
# Run INSIDE: C:\Pawfectradar\frontend

$ErrorActionPreference = 'Stop'
if (-not (Test-Path package.json)) { Write-Error 'Run this inside your FRONTEND folder.'; exit 1 }

# Backup
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDir = "scripts\backup-frontend-$stamp"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# Icons we'll alias to ...Icon to avoid name clashes
$iconPool = @('User','Review','Calendar','Settings','Star','Shield','MapPin','DollarSign','CheckCircle','TrendingUp','Bell','Search','Heart','X','Plus','Minus','Edit','Trash','Upload','Download')

# Regex (use single quotes; escape single quotes by doubling)
$rxLucideImport      = '(?ms)^\s*import\s*\{[^}]*\}\s*from\s*([''"])lucide-react\1\s*;?\s*(//.*)?$'
$rxOtherImportBlock  = '(?ms)^\s*import\s*\{(?<spec>[^}]+)\}\s*from\s*([''"])(?!lucide-react)[^''"\r\n]+\2\s*;?\s*$'
$rxDupReactStar      = '(?m)^\s*import\s+\*\s+as\s+React\s+from\s+[''"]react[''"]\s*;?\s*$'
$rxDupReactDefault   = '(?m)^\s*import\s+React\s+from\s+[''"]react[''"]\s*;?\s*$'
$rxHalfAliasFix      = '(?m)\bas\s+([A-Za-z_]\w*)I(\b)'   # turns "as MapPinI" -> "as MapPinIcon"

function Parse-Spec([string]$s) {
  $m = [regex]::Match(($s).Trim(), '^(?<base>[A-Za-z_]\w*)(?:\s+as\s+(?<alias>[A-Za-z_]\w*))?$')
  if ($m.Success) {
    return [pscustomobject]@{ base=$m.Groups['base'].Value; alias=$m.Groups['alias'].Value }
  }
  return $null
}

function Detect-UsedIcons([string]$code, [string[]]$names) {
  $set = New-Object System.Collections.Generic.HashSet[string]
  foreach ($n in $names) {
    $patOpen = ('<\s*{0}(\b|[\s>/])' -f [regex]::Escape($n))
    $patClose= ('</\s*{0}\s*>'      -f [regex]::Escape($n))
    if ($code -match $patOpen -or $code -match $patClose) { [void]$set.Add($n) }
  }
  return $set
}

$files = Get-ChildItem -Recurse -File -Include *.jsx,*.tsx,*.js,*.ts | Where-Object { $_.FullName -match '\\src\\' }

foreach ($f in $files) {
  $code = Get-Content $f.FullName -Raw
  $orig = $code
  $changed = $false

  # 0) Fix any half-typed aliases like "as MapPinI"
  $code = [regex]::Replace($code, $rxHalfAliasFix, { param($m) "as $($m.Groups[1].Value)Icon$($m.Groups[2].Value)" })

  # 1) Remove duplicate default React when namespace React exists
  if ($code -match $rxDupReactStar -and $code -match $rxDupReactDefault) {
    $code = [regex]::Replace($code, $rxDupReactDefault, '')
    $changed = $true
  }

  # 2) Track other imported identifiers (NOT lucide) to avoid alias collisions
  $otherNames = New-Object System.Collections.Generic.HashSet[string]
  foreach ($m in [regex]::Matches($code,$rxOtherImportBlock)) {
    $spec = $m.Groups['spec'].Value
    foreach ($tok in ($spec -split ',')) {
      $p = Parse-Spec $tok
      if ($p -ne $null) {
        $name = if ([string]::IsNullOrEmpty($p.alias)) { $p.base } else { $p.alias }
        [void]$otherNames.Add($name)
      }
    }
  }

  # 3) If there are lucide imports or JSX using icons, rebuild clean import
  $hasLucideImport = [regex]::IsMatch($code,$rxLucideImport)
  $usedIcons       = Detect-UsedIcons $code $iconPool

  if ($hasLucideImport -or $usedIcons.Count -gt 0) {
    # Remove ALL lucide imports (handles multi-line and broken ones)
    $code = [regex]::Replace($code,$rxLucideImport,'')
    $changed = $true

    # If none detected, provide a minimal safe set commonly used
    if ($usedIcons.Count -eq 0) {
      $null = $usedIcons.Add('User')
      $null = $usedIcons.Add('Star')
      $null = $usedIcons.Add('MapPin')
      $null = $usedIcons.Add('CheckCircle')
      $null = $usedIcons.Add('TrendingUp')
    }

    # 4) Convert JSX tags to Icon variants (e.g., <User> -> <UserIcon>)
    foreach ($n in $usedIcons) {
      $from = [regex]::Escape($n)
      $openPat = ('<\s*{0}(\b|[\s>/])' -f $from)
      $openRep = ('<{0}`$1' -f ($n + 'Icon'))  # `$1 to keep attrs/spaces
      $closePat= ('</\s*{0}\s*>' -f $from)
      $closeRep= ('</{0}>' -f ($n + 'Icon'))
      $code = $code -replace $openPat, $openRep
      $code = $code -replace $closePat, $closeRep
    }

    # 5) Build import spec parts with safe alias; if alias collides, use <Base>LucideIcon
    $specParts = @()
    foreach ($n in ($usedIcons | Sort-Object)) {
      $alias = "$n" + 'Icon'
      if ($otherNames.Contains($alias)) { $alias = "$n" + 'LucideIcon' }
      $specParts += ('{0} as {1}' -f $n, $alias)
      # Make sure JSX matches the alias we chose
      $code = $code -replace ('<\s*{0}Icon(\b|[\s>/])' -f [regex]::Escape($n)), ('<{0}`$1' -f $alias)
      $code = $code -replace ('</\s*{0}Icon\s*>' -f [regex]::Escape($n)), ('</{0}>' -f $alias)
    }

    $newImport = "import { " + ($specParts -join ', ') + " } from 'lucide-react';"

    # Insert after "use client" if present, else at very top
    $mUC = [regex]::Match($code, '^(?<uc>\s*[''"]use client[''"];?\s*\r?\n)')
    if ($mUC.Success) {
      $prefix = $mUC.Groups['uc'].Value
      $rest = $code.Substring($prefix.Length)
      $code = $prefix + $newImport + "`r`n" + $rest
    } else {
      $code = $newImport + "`r`n" + $code
    }

    # 6) Clean any stray "as" without alias: turn "X as }" or "X as ," into "X"
    $code = [regex]::Replace($code,'(?m)(\{[^}]*)(\b[A-Za-z_]\w*\s+as\s*)([,}\r\n])','$1$3')

    # 7) Remove leading semicolon-only lines
    $code = [regex]::Replace($code,'^(;\s*\r?\n)+','', 'Multiline')
  }

  if ($changed -or $code -ne $orig) {
    Copy-Item $f.FullName (Join-Path $backupDir $f.Name) -Force
    Set-Content $f.FullName $code -Encoding UTF8
    Write-Host "✅ Fixed: $($f.FullName)"
  }
}

Write-Host "`n🎉 Done. Now restart the dev server:"
Write-Host "  npm run dev"
Write-Host "Backups saved to: $backupDir"
