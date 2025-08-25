# 🔧 Pawfectradar — One-shot fix for lucide-react import/JSX collisions (PS 5.1 safe)
# Run INSIDE: C:\Pawfectradar\frontend

$ErrorActionPreference = 'Stop'
if (-not (Test-Path package.json)) { Write-Error "Run this INSIDE your FRONTEND folder."; exit 1 }

# Backup folder
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "scripts\backup-frontend-$stamp"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# Icons we support + will alias to <Name>Icon (add more if needed)
$iconNames = @(
  'User','Review','Calendar','Settings','Star','Shield','MapPin','DollarSign','CheckCircle','TrendingUp',
  'Bell','Search','Heart','X','Plus','Minus','Edit','Trash','Upload','Download'
)

# Regex helpers
$rxLucideImport = '(?ms)^\s*import\s*\{[^}]*\}\s*from\s*[''"]lucide-react[''"]\s*;?\s*$'
$rxOtherImportBlock = '(?ms)^\s*import\s*\{(?<spec>[^}]+)\}\s*from\s*[''"](?!lucide-react)['''][^''"\r\n]+[''"]\s*;?\s*$'
$rxDupReactStar = '(?m)^\s*import\s+\*\s+as\s+React\s+from\s+[''"]react[''"]\s*;?\s*$'
$rxDupReactDefault = '(?m)^\s*import\s+React\s+from\s+[''"]react[''"]\s*;?\s*$'

function Get-UsedIcons([string]$code, [string[]]$names) {
  $used = New-Object System.Collections.Generic.HashSet[string]
  foreach ($n in $names) {
    # Detect as JSX component tag OR named usage in JSX (<n ...> or </n>)
    if ($code -match ("<\s*{0}(\b|[\s>/])" -f [regex]::Escape($n)) -or
        $code -match ("</\s*{0}\s*>" -f [regex]::Escape($n))) {
      [void]$used.Add($n)
    }
  }
  return $used
}

# Parse "Foo as Bar" pieces
function Parse-ImportSpecs([string]$spec) {
  $list = @()
  foreach ($tok in ($spec -split ',')) {
    $t = $tok.Trim()
    if ($t -eq '') { continue }
    $m = [regex]::Match($t, '^(?<base>[A-Za-z_]\w*)(?:\s+as\s+(?<alias>[A-Za-z_]\w*))?$')
    if ($m.Success) {
      $base = $m.Groups['base'].Value
      $alias = $m.Groups['alias'].Value
      $list += ,@{ base=$base; alias=$alias }
    }
  }
  return ,$list
}

# Process all source files
$files = Get-ChildItem -Recurse -File -Include *.jsx,*.tsx,*.js,*.ts | Where-Object { $_.FullName -match '\\src\\' }

foreach ($f in $files) {
  $code = Get-Content $f.FullName -Raw
  $orig = $code
  $changed = $false

  # 0) Remove duplicate default React when namespace React exists
  if ($code -match $rxDupReactStar -and $code -match $rxDupReactDefault) {
    $code = [regex]::Replace($code, $rxDupReactDefault, '')
    $changed = $true
  }

  # 1) Determine if file uses lucide icons (either existing import or JSX tags)
  $hasLucideImport = [regex]::IsMatch($code, $rxLucideImport)
  $usedIcons = Get-UsedIcons $code $iconNames

  if ($hasLucideImport -or $usedIcons.Count -gt 0) {
    # 2) Remove ALL existing lucide imports (handles broken lines like "MapPin as MapPinI")
    $code = [regex]::Replace($code, $rxLucideImport, '')
    $changed = $true

    # 3) Build a canonical import from used icons; if none detected, keep a safe small set seen commonly
    if ($usedIcons.Count -eq 0) {
      # Safe default set; adjust if you know file-specific needs
      $null = $usedIcons.Add('User')
      $null = $usedIcons.Add('Star')
      $null = $usedIcons.Add('MapPin')
      $null = $usedIcons.Add('CheckCircle')
      $null = $usedIcons.Add('TrendingUp')
    }

    # 4) Convert JSX usage to Icon variant: <User> -> <UserIcon>
    foreach ($n in $usedIcons) {
      $from = [regex]::Escape($n)
      $to   = "$n" + "Icon"
      $code = $code -replace ("<\s*{0}(\b|[\s>/])" -f $from), ("<{0}$1" -f $to)
      $code = $code -replace ("</\s*{0}\s*>" -f $from), ("</{0}>" -f $to)
    }

    # 5) Build the clean import line: import { Name as NameIcon, ... } from 'lucide-react';
    $specParts = @()
    foreach ($n in $usedIcons) {
      $specParts += ("{0} as {0}Icon" -f $n)
    }
    $newImport = "import { {0} } from 'lucide-react';" -f (($specParts | Sort-Object) -join ', ')

    # 6) Insert it after "use client" if present, else at the very top (before other code)
    $inserted = $false
    $mUC = [regex]::Match($code, '^(?<uc>\s*["'']use client["''];?\s*\r?\n)')
    if ($mUC.Success) {
      $prefix = $mUC.Groups['uc'].Value
      $rest = $code.Substring($prefix.Length)
      $code = $prefix + $newImport + "`r`n" + $rest
      $inserted = $true
    }
    if (-not $inserted) {
      $code = $newImport + "`r`n" + $code
    }

    # 7) Clean any stray "as" tokens without alias that may remain: turn "X as ," or "X as }" into "X"
    $code = [regex]::Replace($code, '(?m)(\{[^}]*)(\b[A-Za-z_]\w*\s+as\s*)([,}\r\n])', '$1$3')

    # 8) Remove leading semicolon lines
    $code = [regex]::Replace($code, '^(;\s*\r?\n)+', '', 'Multiline')

    $changed = $true
  }

  if ($changed -and $code -ne $orig) {
    Copy-Item $f.FullName (Join-Path $backupDir $f.Name) -Force
    Set-Content $f.FullName $code -Encoding UTF8
    Write-Host "✅ Fixed imports in: $($f.FullName)"
  }
}

Write-Host "`n🎯 All lucide imports normalized and JSX updated."
Write-Host "Now restart the dev server:"
Write-Host "  npm run dev"
Write-Host "Backups saved to: $backupDir"
