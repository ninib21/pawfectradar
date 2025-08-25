# Android Build Environment Setup Script
# PawfectRadar Mobile App

Write-Host "🔧 Setting up Android Build Environment for PawfectRadar..." -ForegroundColor Green
Write-Host ""

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script requires administrator privileges. Please run as administrator." -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as administrator'" -ForegroundColor Yellow
    exit 1
}

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to set environment variable
function Set-EnvVar($name, $value) {
    try {
        [Environment]::SetEnvironmentVariable($name, $value, "Machine")
        Write-Host "✅ Set $name = $value" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to set $name`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Function to add to PATH
function Add-ToPath($path) {
    try {
        $currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
        if ($currentPath -notlike "*$path*") {
            $newPath = "$currentPath;$path"
            [Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
            Write-Host "✅ Added $path to PATH" -ForegroundColor Green
        } else {
            Write-Host "ℹ️  $path already in PATH" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Failed to add $path to PATH: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "📋 Checking current environment..." -ForegroundColor Cyan

# Check Java
Write-Host "🔍 Checking Java installation..." -ForegroundColor Yellow
if (Test-Command "java") {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✅ Java found: $javaVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Java not found. Please install Java JDK 17+ first." -ForegroundColor Red
    Write-Host "Download from: https://adoptium.net/" -ForegroundColor Yellow
    Write-Host "Make sure to check 'Add to PATH' during installation." -ForegroundColor Yellow
}

# Check Android SDK
Write-Host "🔍 Checking Android SDK..." -ForegroundColor Yellow
$androidHome = $env:ANDROID_HOME
if ($androidHome -and (Test-Path $androidHome)) {
    Write-Host "✅ ANDROID_HOME found: $androidHome" -ForegroundColor Green
} else {
    Write-Host "❌ ANDROID_HOME not found. Please install Android Studio first." -ForegroundColor Red
    Write-Host "Download from: https://developer.android.com/studio" -ForegroundColor Yellow
}

# Check ADB
Write-Host "🔍 Checking ADB..." -ForegroundColor Yellow
if (Test-Command "adb") {
    $adbVersion = adb version | Select-String "version"
    Write-Host "✅ ADB found: $adbVersion" -ForegroundColor Green
} else {
    Write-Host "❌ ADB not found. Please install Android Studio and SDK." -ForegroundColor Red
}

Write-Host ""
Write-Host "🔧 Setting up environment variables..." -ForegroundColor Cyan

# Try to find Java installation
$javaPaths = @(
    "C:\Program Files\Eclipse Adoptium\jdk-17*",
    "C:\Program Files\Java\jdk-17*",
    "C:\Program Files\OpenJDK\jdk-17*"
)

$javaHome = $null
foreach ($path in $javaPaths) {
    $found = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $javaHome = $found.FullName
        break
    }
}

if ($javaHome) {
    Set-EnvVar "JAVA_HOME" $javaHome
    Add-ToPath "$javaHome\bin"
} else {
    Write-Host "⚠️  Could not find Java installation. Please set JAVA_HOME manually." -ForegroundColor Yellow
}

# Try to find Android SDK
$androidPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk",
    "C:\Android\Sdk"
)

$androidHome = $null
foreach ($path in $androidPaths) {
    if (Test-Path $path) {
        $androidHome = $path
        break
    }
}

if ($androidHome) {
    Set-EnvVar "ANDROID_HOME" $androidHome
    Add-ToPath "$androidHome\platform-tools"
    Add-ToPath "$androidHome\tools"
    Add-ToPath "$androidHome\tools\bin"
} else {
    Write-Host "⚠️  Could not find Android SDK. Please set ANDROID_HOME manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔍 Verifying setup..." -ForegroundColor Cyan

# Refresh environment variables
$env:JAVA_HOME = [Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine")
$env:ANDROID_HOME = [Environment]::GetEnvironmentVariable("ANDROID_HOME", "Machine")

Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor White
Write-Host "ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Green
Write-Host "1. Close and reopen PowerShell to refresh environment variables" -ForegroundColor White
Write-Host "2. Navigate to the frontend directory: cd frontend" -ForegroundColor White
Write-Host "3. Run the build: npm run build:android:local" -ForegroundColor White
Write-Host "4. Connect your Android device with USB debugging enabled" -ForegroundColor White

Write-Host ""
Write-Host "📱 To enable USB debugging on your Android device:" -ForegroundColor Cyan
Write-Host "1. Go to Settings > About Phone" -ForegroundColor White
Write-Host "2. Tap Build Number 7 times" -ForegroundColor White
Write-Host "3. Go back to Settings > Developer Options" -ForegroundColor White
Write-Host "4. Enable USB Debugging" -ForegroundColor White

Write-Host ""
Write-Host "✅ Setup script completed!" -ForegroundColor Green
Write-Host "If you encounter issues, please refer to ANDROID_BUILD_SETUP.md" -ForegroundColor Yellow
