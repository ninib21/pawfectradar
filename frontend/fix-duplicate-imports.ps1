# 📦 FIX DUPLICATE REACT IMPORTS (run in C:\Pawfectradar\frontend)

# 1) Ensure we're in the frontend
if (-not (Test-Path package.json) -and (Test-Path ..\package.json)) { Set-Location .. }
if (-not (Test-Path package.json)) { Write-Error "Run this inside your FRONTEND folder (where package.json is)."; exit 1 }

Write-Host "🔍 Finding files with duplicate React imports..." -ForegroundColor Blue

# 2) Find files that import BOTH "* as React" and "React" default, then remove the default import.
$targets = Get-ChildItem -Recurse -File -Include *.jsx,*.tsx,*.js,*.ts | Where-Object {
  $content = Get-Content $_.FullName -Raw
  ($content -match 'import\s+\*\s+as\s+React\s+from\s+["'']react["'']') -and
  ($content -match 'import\s+React\s+from\s+["'']react["'']')
}

Write-Host "Found $($targets.Count) files with duplicate imports" -ForegroundColor Yellow

foreach ($f in $targets) {
  Write-Host "Fixing: $($f.Name)" -ForegroundColor Cyan
  
  $code = Get-Content $f.FullName -Raw

  # Remove the default React import line ONLY (keep the "* as React" import)
  $code = $code -replace 'import\s+React\s+from\s+["'']react["'']\s*;?\s*\r?\n',''

  # Clean any stray leading semicolon-only lines
  $code = $code -replace '^\s*;\s*\r?\n',''

  Set-Content $f.FullName $code -Encoding UTF8
  Write-Host "  ✅ Fixed" -ForegroundColor Green
}

Write-Host "`n✅ Duplicate React imports fixed!" -ForegroundColor Green
Write-Host "Now you can run: npm run dev" -ForegroundColor Yellow
