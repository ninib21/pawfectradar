# 🛠️ Pawfectradar FULL STACK AUTO-FIX & RUN (Windows PowerShell)

$ErrorActionPreference = 'Stop'

# --- Paths ---
$root   = "C:\Pawfectradar"
$be     = Join-Path $root "backend"
$fe     = Join-Path $root "frontend"

if (-not (Test-Path $be)) { Write-Error "Backend folder not found at $be"; exit 1 }
if (-not (Test-Path $fe)) { Write-Error "Frontend folder not found at $fe"; exit 1 }

# --- Put Docker CLI on PATH for this session & start Docker Desktop if needed ---
$cliDirs = @('C:\ProgramData\DockerDesktop\version-bin','C:\Program Files\Docker\Docker\resources\bin') | ? { Test-Path $_ }
foreach ($d in $cliDirs) { if (-not (($env:Path -split ';') -contains $d)) { $env:Path = "$d;$env:Path" } }
$dockerOk = $false; try { docker info *> $null; if ($LASTEXITCODE -eq 0) { $dockerOk = $true } } catch {}
if (-not $dockerOk) {
  $desktop = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
  if (Test-Path $desktop) {
    Start-Process -FilePath $desktop | Out-Null
    for ($i=0; $i -lt 40 -and -not $dockerOk; $i++) { Start-Sleep 2; try { docker info *> $null; if ($LASTEXITCODE -eq 0){ $dockerOk=$true } } catch {} }
  }
}
if (-not $dockerOk) { Write-Error "Docker not available. Install/start Docker Desktop and re-run."; exit 1 }

# --- Session env (NO .env files needed) ---
# Backend API
$env:PORT        = '3001'
$env:NODE_ENV    = 'development'
# Dev DB on 5434 (container maps 5432->5434)
$env:DB_HOST     = '127.0.0.1'
$env:DB_PORT     = '5434'
$env:DB_USER     = 'postgres'
$env:DB_PASS     = 'postgres'
$env:DB_NAME     = 'pawfectradar_dev'
# Test DB on 55432
$env:TEST_PORT   = '0'
$env:TEST_DB_HOST= '127.0.0.1'
$env:TEST_DB_PORT= '55432'
$env:TEST_DB_USER= 'postgres'
$env:TEST_DB_PASS= 'postgres'
$env:TEST_DB_NAME= 'pawfectradar_test'

# Prisma URLs (if used)
$env:DATABASE_URL      = "postgresql://postgres:postgres@127.0.0.1:5434/pawfectradar_dev?schema=public"
$env:TEST_DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:55432/pawfectradar_test?schema=public"
$env:PRISMA_HIDE_UPDATE_MESSAGE = "true"

# --- Write/patch docker-compose for DBs ---
Set-Location $be
$compose = @"
services:
  db:
    image: postgres:15-alpine
    container_name: pawfect_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: pawfectradar_dev
    ports: [ '5434:5432' ]
    healthcheck:
      test: ['CMD-SHELL','pg_isready -U postgres']
      interval: 3s
      timeout: 3s
      retries: 40
    networks: [ pawfectsitters-network ]

  db_test:
    image: postgres:15-alpine
    container_name: pawfect_db_test
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: pawfectradar_test
    ports: [ '55432:5432' ]
    healthcheck:
      test: ['CMD-SHELL','pg_isready -U postgres']
      interval: 3s
      timeout: 3s
      retries: 40
    networks: [ pawfectsitters-network ]

networks:
  pawfectsitters-network:
    name: pawfectsitters-network
    driver: bridge
"@

$backup = ".\docker-compose.backup.$((Get-Date).ToString('yyyyMMdd-HHmmss')).yml"
if (Test-Path .\docker-compose.yml) { Copy-Item .\docker-compose.yml $backup }
$compose | Set-Content .\docker-compose.yml -Encoding UTF8

# --- Start DB containers ---
Write-Host "🐳 Starting PostgreSQL containers..."
$useV2=$true; try { docker compose version *> $null } catch { $useV2=$false }
if ($useV2) { docker compose down --remove-orphans } else { docker-compose down --remove-orphans }
if ($useV2) { docker compose up -d db db_test } else { docker-compose up -d db db_test }

# --- Wait for DBs to be ready ---
function Wait-Pg([string]$name,[int]$seconds=180){
  $ok=$false
  for($i=0;$i -lt $seconds;$i++){
    $out = docker exec $name pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0 -and $out -match 'accepting connections'){
      $ok=$true; break
    }
    Start-Sleep 1
  }
  if (-not $ok){ throw "❌ $name failed to become ready" }
  Write-Host "✅ $name is accepting connections"
}

Wait-Pg 'pawfect_db' 180
Wait-Pg 'pawfect_db_test' 180

# --- Setup Backend ---
Write-Host "🔧 Setting up backend..."
if (Test-Path .\prisma\schema.prisma) {
  npx prisma generate | Out-Null
  npx prisma db push --skip-generate | Out-Null
  Write-Host "✅ Prisma schema pushed to dev DB"
}

# --- Install backend deps & start backend ---
Write-Host "📦 Installing backend dependencies..."
npm install | Out-Null

Write-Host "🚀 Starting backend server on port 3001..."
Start-Job -ScriptBlock {
  Set-Location $using:be
  $env:PORT = '3001'
  $env:NODE_ENV = 'development'
  $env:DB_HOST = '127.0.0.1'
  $env:DB_PORT = '5434'
  $env:DB_USER = 'postgres'
  $env:DB_PASS = 'postgres'
  $env:DB_NAME = 'pawfectradar_dev'
  $env:DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5434/pawfectradar_dev?schema=public"
  npm run start:dev
} | Out-Null

# --- Wait for backend to start ---
Write-Host "⏳ Waiting for backend to start..."
for ($i=0; $i -lt 30; $i++) {
  try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
      Write-Host "✅ Backend is running on http://localhost:3001"
      break
    }
  } catch {
    Start-Sleep 2
  }
}

# --- Setup Frontend ---
Set-Location $fe
Write-Host "🎨 Setting up frontend..."

# --- Fix frontend package.json scripts ---
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
$pkg.scripts = $pkg.scripts ?? @{}
$pkg.scripts.dev = "vite"
$pkg.scripts.build = "vite build"
$pkg.scripts.preview = "vite preview"
$pkg | ConvertTo-Json -Depth 99 | Set-Content package.json -Encoding UTF8

# --- Create/update Vite config ---
$viteConfig = @"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
"@

$viteConfig | Set-Content vite.config.js -Encoding UTF8

# --- Install frontend deps ---
Write-Host "📦 Installing frontend dependencies..."
npm install | Out-Null

# --- Start frontend ---
Write-Host "🚀 Starting frontend server on port 5173..."
Start-Job -ScriptBlock {
  Set-Location $using:fe
  npm run dev
} | Out-Null

# --- Wait for frontend to start ---
Write-Host "⏳ Waiting for frontend to start..."
for ($i=0; $i -lt 30; $i++) {
  try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
      Write-Host "✅ Frontend is running on http://localhost:5173"
      break
    }
  } catch {
    Start-Sleep 2
  }
}

# --- Show status ---
Write-Host ""
Write-Host "🎉 PAWFECTRADAR APPLICATION IS RUNNING!"
Write-Host "=========================================="
Write-Host "🌐 Frontend: http://localhost:5173"
Write-Host "🔧 Backend API: http://localhost:3001"
Write-Host "📊 Health Check: http://localhost:3001/health"
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers"
Write-Host ""

# --- Keep script running ---
try {
  while ($true) {
    Start-Sleep 10
    $backendJob = Get-Job | Where-Object { $_.Name -like "*backend*" }
    $frontendJob = Get-Job | Where-Object { $_.Name -like "*frontend*" }
    
    if ($backendJob.State -eq "Failed" -or $frontendJob.State -eq "Failed") {
      Write-Host "❌ One of the servers failed. Check the logs above."
      break
    }
  }
} catch {
  Write-Host "Stopping servers..."
  Get-Job | Stop-Job
  Get-Job | Remove-Job
}
