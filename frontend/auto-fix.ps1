# 🧹 Pawfectradar Frontend Auto-Fix (Windows PowerShell) — makes Vite+React run cleanly
# Run from: C:\Pawfectradar\frontend

# 0) Sanity: require package.json
if (-not (Test-Path package.json)) { Write-Error "Run this inside your FRONTEND folder (where package.json is)."; exit 1 }

# 1) Read package.json and ensure core deps/scripts for Vite React
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
$pkg.scripts = $pkg.scripts ?? @{}
$pkg.scripts.dev      = $pkg.scripts.dev      ?? "vite"
$pkg.scripts.build    = $pkg.scripts.build    ?? "vite build"
$pkg.scripts.preview  = $pkg.scripts.preview  ?? "vite preview"

# Ensure deps exist (no-op if already installed). Keep it minimal & safe.
#   - react, react-dom: core
#   - vite, @vitejs/plugin-react: bundler & React transform
#   - lucide-react, class-variance-authority, clsx, tailwind-merge, date-fns: common UI deps used across files
$ensureDeps = @(
  "react","react-dom","lucide-react","class-variance-authority","clsx","tailwind-merge","date-fns"
)
$ensureDevDeps = @(
  "vite","@vitejs/plugin-react"
)
# Write back scripts first (so npm can run)
$pkg | ConvertTo-Json -Depth 99 | Set-Content package.json -Encoding UTF8

Write-Host "📦 Installing/ensuring frontend dependencies..."
npm i $ensureDeps  | Out-Null
npm i -D $ensureDevDeps | Out-Null

# 2) Vite config (ESM) with alias "@": resolve to src
# Prefer vite.config.mjs in ESM projects; create if missing
$viteMjs = "vite.config.mjs"
if (-not (Test-Path $viteMjs)) {
@'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
});
'@ | Set-Content $viteMjs -Encoding UTF8
  Write-Host "🛠️  Created vite.config.mjs with @ alias"
} else {
  # Patch alias if missing
  $v = Get-Content $viteMjs -Raw
  if ($v -notmatch "@vitejs/plugin-react") { $v = "import react from '@vitejs/plugin-react';`n" + $v }
  if ($v -notmatch "alias") {
    $inject = @"
resolve: {
  alias: {
    '@': require('node:path').resolve(process.cwd(), 'src'),
  },
},
"@
    $v = $v -replace "defineConfig\(\{", "defineConfig({`n  $inject"
  }
  Set-Content $viteMjs $v -Encoding UTF8
  Write-Host "🛠️  Patched vite.config.mjs"
}

# 3) js/ts config to support @ alias and modern JSX runtime
$tsconfig = "tsconfig.json"
$jsconfig = "jsconfig.json"
function PatchConfig($file) {
  if (Test-Path $file) {
    $cfg = Get-Content $file -Raw | ConvertFrom-Json
  } else {
    $cfg = [ordered]@{}
  }
  if (-not $cfg.compilerOptions) { $cfg | Add-Member -NotePropertyName compilerOptions -NotePropertyValue ([ordered]@{}) }
  $co = $cfg.compilerOptions
  if (-not $co.baseUrl) { $co.baseUrl = "." }
  if (-not $co.jsx) { $co.jsx = "react-jsx" }
  if (-not $co.moduleResolution) { $co.moduleResolution = "bundler" }
  if (-not $co.paths) { $co.paths = @{} }
  $co.paths."@/*" = @("src/*")
  if (-not $cfg.include) { $cfg.include = @("src") }
  $cfg | ConvertTo-Json -Depth 99 | Set-Content $file -Encoding UTF8
  Write-Host "🧭 Patched $file"
}
if (Test-Path $tsconfig) { PatchConfig $tsconfig } else { PatchConfig $jsconfig }

# 4) Code fixes — make imports consistent & remove known breakages

# 4a) Remove duplicate default React import when "* as React" is present (keeps namespace import).
$files = Get-ChildItem -Recurse -File -Include *.jsx,*.tsx,*.js,*.ts
foreach ($f in $files) {
  $code = Get-Content $f.FullName -Raw

  $hasStarReact   = [regex]::IsMatch($code, '(?m)^\s*import\s+\*\s+as\s+React\s+from\s+[\'"]react[\'"]\s*;?\s*$')
  $hasDefaultReact= [regex]::IsMatch($code, '(?m)^\s*import\s+React\s+from\s+[\'"]react[\'"]\s*;?\s*$')
  $orig = $code

  if ($hasStarReact -and $hasDefaultReact) {
    $code = [regex]::Replace($code, '(?m)^\s*import\s+React\s+from\s+[\'"]react[\'"]\s*;?\s*\r?\n', '')
  }

  # 4b) Clean stray leading semicolon lines that sometimes appear
  $code = [regex]::Replace($code, '^(;\s*\r?\n)+', '', 'Multiline')

  if ($code -ne $orig) { Set-Content $f.FullName $code -Encoding UTF8 }
}

# 4c) lucide-react: alias 'Review' icon if present to avoid name collisions; update JSX tags.
$lucideFiles = $files | Where-Object {
  (Select-String -Path $_.FullName -Pattern 'from\s+[\'"]lucide-react[\'"]' -Quiet)
}
foreach ($f in $lucideFiles) {
  $code = Get-Content $f.FullName -Raw
  $orig = $code

  # In the lucide import line(s), replace bare "Review" with "Review as ReviewIcon"
  $code = [regex]::Replace($code, '(?m)^(.*from\s*[\'"]lucide-react[\'"].*)$', {
    param($m)
    $line = $m.Groups[1].Value
    if ($line -match '\{[^}]*\bReview\b[^}]*\}') {
      if ($line -notmatch '\bReview as ReviewIcon\b') {
        return ($line -replace '\bReview\b','Review as ReviewIcon')
      }
    }
    return $line
  })

  # Replace JSX usages <Review ...> and </Review> with ReviewIcon
  $code = $code -replace '<\s*Review(\b|[\s>])','<ReviewIcon$1'
  $code = $code -replace '</\s*Review\s*>','</ReviewIcon>'

  if ($code -ne $orig) { Set-Content $f.FullName $code -Encoding UTF8 }
}

# 4d) Ensure import paths using '@/' work even in JS files (some editors complain)
# (Handled by vite alias + js/tsconfig above)

# 5) Optional tidy: remove lockfile conflicts and reinstall clean
# If you prefer not to nuke node_modules, comment out the next two lines.
if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
if (Test-Path package-lock.json) { Remove-Item package-lock.json -Force }

Write-Host "📦 Reinstalling dependencies..."
npm install | Out-Null

# 6) Start the dev server once to verify (you can Ctrl+C after it starts)
Write-Host "`n🚀 Starting dev server (press Ctrl+C to stop after it compiles)..."
npm run dev
