# 🔧 Pawfectradar — Lucide Import & JSX Auto-Fix
# Run inside: C:\Pawfectradar\frontend

$ErrorActionPreference = 'Stop'

if (-not (Test-Path package.json)) { Write-Error "Run this INSIDE your FRONTEND folder."; exit 1 }

# Backup dir
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "scripts\backup-frontend-$stamp"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# Icons we always alias to <Name>Icon (avoids collisions with app symbols)
$aliasList = @(
  'User','Review','Calendar','Settings','Star','Shield','MapPin','DollarSign','CheckCircle','TrendingUp',
  'Bell','Search','Heart','X','Plus','Minus','Edit','Trash','Upload','Download'
)

# Helpers
function Parse-Spec([string]$s){
  $m = [regex]::Match($s.Trim(), '^(?<base>[A-Za-z_]\w*)(?:\s+as\s+(?<alias>[A-Za-z_]\w*))?$')
  if ($m.Success){ return [pscustomobject]@{ base=$m.Groups['base'].Value; alias=$m.Groups['alias'].Value } }
  return $null
}

# Collect all source files
$files = Get-ChildItem -Recurse -File -Include *.jsx,*.tsx,*.js,*.ts | Where-Object { $_.FullName -match '\\src\\' }

foreach ($f in $files) {
  $code = Get-Content $f.FullName -Raw
  $orig = $code
  $modified = $false

  # 1) Remove duplicate default React import when "* as React" also exists
  $hasStar   = [regex]::IsMatch($code,'(?m)^\s*import\s+\*\s+as\s+React\s+from\s+["'']react["'']\s*;?\s*$')
  $hasDefault= [regex]::IsMatch($code,'(?m)^\s*import\s+React\s+from\s+["'']react["'']\s*;?\s*$')
  if ($hasStar -and $hasDefault) {
    $code = [regex]::Replace($code,'(?m)^\s*import\s+React\s+from\s+["'']react["'']\s*;?\s*\r?\n','')
    $modified = $true
  }

  # 2) Track other imported identifiers (to avoid collisions)
  $otherIdents = New-Object System.Collections.Generic.HashSet[string]
  foreach ($m in [regex]::Matches($code,'(?ms)^\s*import\s*\{(?<spec>[^}]+)\}\s*from\s*["''](?!lucide-react)["''][^"''\r\n]+["'']\s*;?\s*$')) {
    foreach ($tok in ($m.Groups['spec'].Value -split ',')) {
      $sp = Parse-Spec $tok; if ($sp){
        [void]$otherIdents.Add( ($sp.alias -ne '' ? $sp.alias : $sp.base) )
      }
    }
  }

  # 3) Gather every lucide-react import in the file (single or multi-line)
  $lucide = [regex]::Matches($code,'(?ms)^\s*import\s*\{(?<spec>[^}]*)\}\s*from\s*["'']lucide-react["'']\s*;?\s*$')
  if ($lucide.Count -gt 0) {
    # Parse all specifiers and normalize them
    $items = New-Object System.Collections.Generic.List[object]
    foreach ($m in $lucide) {
      # Split across commas safely
      $spec = $m.Groups['spec'].Value -replace '\r',''
      foreach ($tok in ($spec -split ',')) {
        $sp = Parse-Spec $tok; if (-not $sp) { continue }

        # Fix half-written aliases like "MapPin as MapPinI" -> MapPinIcon
        $targetAlias = $null
        if ($aliasList -contains $sp.base) { $targetAlias = "$($sp.base)Icon" }

        if ($sp.alias -and $targetAlias) {
          if ($sp.alias -notmatch '^[A-Za-z_]\w*$' -or $sp.alias -notlike "$($sp.base)Icon") { $sp.alias = $targetAlias }
        } elseif ($targetAlias) {
          # always alias these icon names
          $sp.alias = $targetAlias
        }

        # If alias would collide with an existing identifier, append "Lucide"
        $effective = ($sp.alias ? $sp.alias : $sp.base)
        if ($otherIdents.Contains($effective)) {
          $sp.alias = ($sp.base + 'LucideIcon')
          $effective = $sp.alias
        }

        # Store unique by effective name
        if (-not ($items | Where-Object { ($_.alias ? $_.alias : $_.base) -eq $effective })) {
          $items.Add([pscustomobject]@{ base=$sp.base; alias=$sp.alias })
        }
      }
    }

    if ($items.Count -gt 0) {
      # Build new clean import
      $specText = ($items | ForEach-Object { if ($_.alias) { "$($_.base) as $($_.alias)" } else { "$($_.base)" } }) -join ', '
      $newImport = "import { $specText } from 'lucide-react';"

      # Replace the first lucide import with the merged one; remove the rest
      $first = $lucide[0]
      $code = $code.Remove($first.Index, $first.Length).Insert($first.Index, $newImport)
      for ($i = $lucide.Count-1; $i -ge 1; $i--) {
        $m = $lucide[$i]
        $code = $code.Remove($m.Index, $m.Length)
      }
      $modified = $true

      # 4) Update JSX usages when we applied/changed aliases
      foreach ($it in $items) {
        if ($it.alias -and $it.alias -ne $it.base) {
          $from = [regex]::Escape($it.base)
          $to   = $it.alias
          # Opening tags: <Base ...> -> <Alias ...>
          $code = $code -replace "<\s*$from(\b|[\s>/])","<$to`$1"
          # Closing tags: </Base> -> </Alias>
          $code = $code -replace "</\s*$from\s*>","</$to>"
          $modified = $true
        }
      }
    }
  }

  # 5) Clean stray "as" without alias (rare) — turn "X as" into just "X"
  $code = [regex]::Replace($code, '(?m)(\{[^}]*)(\b[A-Za-z_]\w*\s+as\s*)([,}\r\n])', '$1$3')

  # 6) Remove stray leading semicolons
  $code = [regex]::Replace($code, '^(;\s*\r?\n)+', '', 'Multiline')

  if ($modified -and $code -ne $orig) {
    Copy-Item $f.FullName (Join-Path $backupDir $f.Name) -Force
    Set-Content $f.FullName $code -Encoding UTF8
    Write-Host "✅ Fixed imports in: $($f.FullName)"
  }
}

Write-Host "`n🚀 Re-run the dev server:"
Write-Host "  npm run dev"
Write-Host "Backups saved to: $backupDir"
