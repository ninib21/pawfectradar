# 🔧 ONE-SHOT: Reliable Postgres + Correct test command (Windows PowerShell)

# 0) Ensure we're in backend
if (-not (Test-Path package.json) -and (Test-Path ..\package.json)) { Set-Location .. }
if (-not (Test-Path package.json)) { Write-Error "Run this inside C:\Pawfectradar\backend"; exit 1 }

# 1) Make Docker CLI available in this session & start Docker Desktop if needed
$cliDirs = @('C:\ProgramData\DockerDesktop\version-bin','C:\Program Files\Docker\Docker\resources\bin') | ? { Test-Path $_ }
foreach ($d in $cliDirs) { if (-not (($env:Path -split ';') -contains $d)) { $env:Path = "$d;$env:Path" } }
$dockerOk = $false; try { docker --version *> $null; if ($LASTEXITCODE -eq 0) { $dockerOk=$true } } catch {}
if (-not $dockerOk) {
  $desktop = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
  if (Test-Path $desktop) {
    Start-Process "$desktop" | Out-Null
    for ($i=0;$i -lt 40 -and -not $dockerOk;$i++){ Start-Sleep 2; try { docker info *> $null; if ($LASTEXITCODE -eq 0){$dockerOk=$true} } catch {} }
  }
}
if (-not $dockerOk) { Write-Error "Docker not available. Install/start Docker Desktop, then re-run."; exit 1 }

# 2) Free up typical conflicting services (optional safety)
Get-Service -Name 'postgresql*' -ErrorAction SilentlyContinue | ? {$_.Status -eq 'Running'} | % { Write-Host "Stopping Windows Postgres service: $($_.Name)"; Stop-Service $_ -Force }

# 3) Write a clean compose with defined network & safe host ports (dev: 5434, test: 55432)
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
    ports:
      - "5434:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 3s
      timeout: 3s
      retries: 40
    networks:
      - pawfectsitters-network

  db_test:
    image: postgres:15-alpine
    container_name: pawfect_db_test
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: pawfectradar_test
    ports:
      - "55432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 3s
      timeout: 3s
      retries: 40
    networks:
      - pawfectsitters-network

  redis:
    image: redis:7-alpine
    container_name: pawfect_redis
    command: ["redis-server","--save","","--appendonly","no"]
    ports:
      - "6379:6379"
    networks:
      - pawfectsitters-network

volumes:
  db_data:

networks:
  pawfectsitters-network:
    name: pawfectsitters-network
    driver: bridge
"@
$backup = ".\docker-compose.backup.$((Get-Date).ToString('yyyyMMdd-HHmmss')).yml"
if (Test-Path .\docker-compose.yml) { Copy-Item .\docker-compose.yml $backup }
$compose | Set-Content .\docker-compose.yml -Encoding UTF8

# 4) Tear down old containers/volumes and recreate cleanly
$useV2 = $true; try { docker compose version *> $null } catch { $useV2 = $false }
if ($useV2) { docker compose down --remove-orphans } else { docker-compose down --remove-orphans }

# If old volume is corrupted from a prior major PG version, drop it now (safe for dev)
docker volume ls --format "{{.Name}}" | ? { $_ -match "db_data" } | % { docker volume rm $_ } *> $null

if ($useV2) { docker compose up -d db db_test redis } else { docker-compose up -d db db_test redis }

# 5) Wait until Postgres containers truly accept connections (beyond "healthy")
function Wait-Pg([string]$name,[int]$seconds=120){
  $ok=$false
  for($i=0;$i -lt $seconds;$i++){
    $out = docker exec $name pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0 -and $out -match "accepting connections"){ $ok=$true; break }
    Start-Sleep -Seconds 1
  }
  if (-not $ok) { throw "❌ $name failed to become ready in $seconds seconds" }
  Write-Host "✅ $name is accepting connections"
}
Wait-Pg "pawfect_db" 180
Wait-Pg "pawfect_db_test" 180

# 6) Ensure your test env points at the test DB port 55432 and uses test mode
@"
TEST_PORT=0
NODE_ENV=test
TEST_DB_HOST=127.0.0.1
TEST_DB_PORT=55432
TEST_DB_USER=postgres
TEST_DB_PASS=postgres
TEST_DB_NAME=pawfectradar_test
"@ | Set-Content .\.env.test -Encoding UTF8

# Optional: write/update dev DB port for local runs
if (-not (Test-Path .\.env)) {
@"
PORT=3001
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=5434
DB_USER=postgres
DB_PASS=postgres
DB_NAME=pawfectradar_dev
"@ | Set-Content .\.env -Encoding UTF8
}

Write-Host "`n🎯 Postgres dev on localhost:5434, test on localhost:55432"

# 7) If you're using Prisma, generate & push schema to the test DB (skip if not using)
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
$hasPrisma = (Test-Path .\prisma\schema.prisma) -or ($pkg.dependencies.PSObject.Properties.Name -contains "prisma") -or ($pkg.devDependencies.PSObject.Properties.Name -contains "prisma")
if ($hasPrisma) {
  $env:TEST_DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:55432/pawfectradar_test?schema=public"
  npx prisma generate | Out-Null
  npx prisma db push --skip-generate | Out-Null
  Write-Host "Prisma schema pushed to test DB"
}

# 8) Run integration tests (correct command; no dot)
npm test
