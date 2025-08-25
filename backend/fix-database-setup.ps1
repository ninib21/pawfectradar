# 🚀 ONE-STEP FIX: correct DB ports without .env + code fallback + start DB + run tests

# 0) Be in backend
if (-not (Test-Path package.json) -and (Test-Path ..\package.json)) { Set-Location .. }
if (-not (Test-Path package.json)) { Write-Error "Run this from C:\Pawfectradar\backend"; exit 1 }

# 1) Put Docker CLI on PATH for this session & start Docker Desktop if needed
$cliDirs = @('C:\ProgramData\DockerDesktop\version-bin','C:\Program Files\Docker\Docker\resources\bin') | ? { Test-Path $_ }
foreach ($d in $cliDirs) { if (-not (($env:Path -split ';') -contains $d)) { $env:Path = "$d;$env:Path" } }
$dockerOk = $false; try { docker info *> $null; if ($LASTEXITCODE -eq 0) { $dockerOk=$true } } catch {}
if (-not $dockerOk) {
  $desktop = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
  if (Test-Path $desktop) {
    Start-Process "$desktop" | Out-Null
    for ($i=0;$i -lt 40 -and -not $dockerOk;$i++){ Start-Sleep 2; try { docker info *> $null; if ($LASTEXITCODE -eq 0){$dockerOk=$true} } catch {} }
  }
}
if (-not $dockerOk) { Write-Error "Docker not available. Install/start Docker Desktop, then re-run."; exit 1 }

# 2) Session env (no .env needed): set the right ports and creds for dev & test
$env:NODE_ENV='development'
$env:DB_HOST='127.0.0.1'
$env:DB_PORT='5434'
$env:DB_USER='postgres'
$env:DB_PASS='postgres'
$env:DB_NAME='pawfectradar_dev'

$env:TEST_PORT='0'
$env:TEST_DB_HOST='127.0.0.1'
$env:TEST_DB_PORT='55432'
$env:TEST_DB_USER='postgres'
$env:TEST_DB_PASS='postgres'
$env:TEST_DB_NAME='pawfectradar_test'

# 3) Write a code-based env fallback (works even when .env files are blocked)
New-Item -Force -ItemType Directory -Path src | Out-Null
@'
/**
 * Safe env bootstrap that does NOT rely on .env files.
 * Provides sane defaults for dev/test DB so the app connects even if .env is blocked.
 */
const isTest = process.env.NODE_ENV === 'test';

function setIfMissing(key: string, val: string) {
  if (!process.env[key] || process.env[key] === '') process.env[key] = val;
}

if (isTest) {
  setIfMissing('TEST_DB_HOST', '127.0.0.1');
  setIfMissing('TEST_DB_PORT', '55432');
  setIfMissing('TEST_DB_USER', 'postgres');
  setIfMissing('TEST_DB_PASS', 'postgres');
  setIfMissing('TEST_DB_NAME', 'pawfectradar_test');
} else {
  setIfMissing('DB_HOST', '127.0.0.1');
  setIfMissing('DB_PORT', '5434');
  setIfMissing('DB_USER', 'postgres');
  setIfMissing('DB_PASS', 'postgres');
  setIfMissing('DB_NAME', 'pawfectradar_dev');
}

// Derive Prisma DATABASE_URL if missing
const host = isTest ? process.env.TEST_DB_HOST : process.env.DB_HOST;
const port = isTest ? process.env.TEST_DB_PORT : process.env.DB_PORT;
const user = isTest ? process.env.TEST_DB_USER : process.env.DB_USER;
const pass = isTest ? process.env.TEST_DB_PASS : process.env.DB_PASS;
const name = isTest ? process.env.TEST_DB_NAME : process.env.DB_NAME;

function enc(v?: string) { return encodeURIComponent(v ?? ''); }
const pgUrl = `postgresql://${user}:${enc(pass)}@${host}:${port}/${name}?schema=public`;

if (isTest) {
  if (!process.env.TEST_DATABASE_URL) process.env.TEST_DATABASE_URL = pgUrl;
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = process.env.TEST_DATABASE_URL!;
} else {
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = pgUrl;
}
'@ | Set-Content .\src\loadEnv.ts -Encoding UTF8

# 4) Ensure your app loads the fallback FIRST
node -e "const fs=require('fs');['src/main.ts','src/server.ts','src/app.ts'].forEach(f=>{if(fs.existsSync(f)){let s=fs.readFileSync(f,'utf8');if(!s.includes(\"import './loadEnv'\")){fs.writeFileSync(f,`import './loadEnv'\n${s}`)}}}); console.log('loadEnv wired');"

# 5) Start Postgres containers on 5434(dev)/55432(test) and wait until accepting connections
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
$useV2=$true; try { docker compose version *> $null } catch { $useV2=$false }
if ($useV2) { docker compose down --remove-orphans } else { docker-compose down --remove-orphans }
if ($useV2) { docker compose up -d db db_test } else { docker-compose up -d db db_test }

function Wait-Pg([string]$name,[int]$seconds=180){
  $ok=$false
  for($i=0;$i -lt $seconds;$i++){
    $out = docker exec $name pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0 -and $out -match 'accepting connections'){ $ok=$true; break }
    Start-Sleep 1
  }
  if (-not $ok){ throw "$name failed to become ready" }
  Write-Host "$name is accepting connections"
}
Wait-Pg 'pawfect_db' 180
Wait-Pg 'pawfect_db_test' 180

# 6) Prisma users: generate client + push schema to TEST DB
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
$hasPrisma = (Test-Path .\prisma\schema.prisma) -or ($pkg.dependencies.PSObject.Properties.Name -contains 'prisma') -or ($pkg.devDependencies.PSObject.Properties.Name -contains 'prisma')
if ($hasPrisma) {
  $env:TEST_DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:55432/pawfectradar_test?schema=public"
  npx prisma generate | Out-Null
  npx prisma db push --skip-generate | Out-Null
  Write-Host "Prisma schema pushed to test DB"
}

# 7) Run integration tests
npm test
