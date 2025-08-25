# 📱 Mobile App Build Script for PawfectRadar
# Creates APK/IPA files for app store submission

Write-Host "🚀 Starting Mobile App Build Process..." -ForegroundColor Green

# 0) Ensure we're in the frontend directory
if (-not (Test-Path package.json) -and (Test-Path ..\package.json)) { Set-Location .. }
if (-not (Test-Path app.json)) { Write-Error "Run this from C:\Pawfectradar\frontend"; exit 1 }

# 1) Check if EAS CLI is installed
$easInstalled = $false
try {
    $easVersion = eas --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        $easInstalled = $true
        Write-Host "✅ EAS CLI found: $easVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ EAS CLI not found, installing..." -ForegroundColor Yellow
}

if (-not $easInstalled) {
    Write-Host "📦 Installing EAS CLI..." -ForegroundColor Blue
    npm install -g @expo/eas-cli
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install EAS CLI"
        exit 1
    }
}

# 2) Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
}

# 3) Build Android APK (Preview build)
Write-Host "🤖 Building Android APK..." -ForegroundColor Blue
Write-Host "This will create an APK file for Google Play Store submission" -ForegroundColor Cyan

try {
    eas build --platform android --profile preview --non-interactive
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Android APK build completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Android APK build failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Android APK build failed with error: $_" -ForegroundColor Red
}

# 4) Build Android App Bundle (Production build)
Write-Host "🤖 Building Android App Bundle..." -ForegroundColor Blue
Write-Host "This will create an AAB file for Google Play Store submission" -ForegroundColor Cyan

try {
    eas build --platform android --profile production --non-interactive
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Android App Bundle build completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Android App Bundle build failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Android App Bundle build failed with error: $_" -ForegroundColor Red
}

# 5) Build iOS IPA (Production build)
Write-Host "🍎 Building iOS IPA..." -ForegroundColor Blue
Write-Host "This will create an IPA file for Apple App Store submission" -ForegroundColor Cyan

try {
    eas build --platform ios --profile production --non-interactive
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ iOS IPA build completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ iOS IPA build failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ iOS IPA build failed with error: $_" -ForegroundColor Red
}

# 6) Create build summary
Write-Host "`n📋 Build Summary:" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Yellow

# Check for build artifacts
$buildDir = ".\builds"
if (Test-Path $buildDir) {
    Write-Host "📁 Build artifacts found in: $buildDir" -ForegroundColor Green
    Get-ChildItem $buildDir -Recurse | ForEach-Object {
        Write-Host "   📄 $($_.Name)" -ForegroundColor Cyan
    }
} else {
    Write-Host "📁 Build artifacts will be available in EAS dashboard" -ForegroundColor Cyan
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "==============" -ForegroundColor Yellow
Write-Host "1. 📱 Download builds from EAS dashboard" -ForegroundColor White
Write-Host "2. 🏪 Submit APK/AAB to Google Play Console" -ForegroundColor White
Write-Host "3. 🍎 Submit IPA to Apple App Store Connect" -ForegroundColor White
Write-Host "4. ✅ Complete app store review process" -ForegroundColor White

Write-Host "`n🚀 Mobile app builds completed!" -ForegroundColor Green
