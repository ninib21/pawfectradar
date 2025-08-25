# Android Build Environment Verification Script
# PawfectRadar Mobile App

Write-Host "🔍 Verifying Android Build Environment..." -ForegroundColor Green
Write-Host ""

$allGood = $true

# Function to check command
function Test-Command($cmdname, $description) {
    if ([bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)) {
        Write-Host ("✅ " + $description + ": Found") -ForegroundColor Green
        return $true
    } else {
        Write-Host ("❌ " + $description + ": Not found") -ForegroundColor Red
        return $false
    }
}

# Function to check environment variable
function Test-EnvVar($name, $description) {
    $value = [Environment]::GetEnvironmentVariable($name, "Machine")
    if ($value -and (Test-Path $value)) {
        Write-Host ("✅ " + $description + ": " + $value) -ForegroundColor Green
        return $true
    } else {
        Write-Host ("❌ " + $description + ": Not set or invalid path") -ForegroundColor Red
        return $false
    }
}

# Check Java
Write-Host "📋 Checking Java..." -ForegroundColor Cyan
if (Test-Command "java" "Java Runtime") {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "   Version: $javaVersion" -ForegroundColor White
} else {
    $allGood = $false
}

if (Test-Command "javac" "Java Compiler") {
    $javacVersion = javac -version 2>&1
    Write-Host "   Compiler: $javacVersion" -ForegroundColor White
} else {
    $allGood = $false
}

if (-not (Test-EnvVar "JAVA_HOME" "JAVA_HOME")) {
    $allGood = $false
}

# Check Android SDK
Write-Host ""
Write-Host "📋 Checking Android SDK..." -ForegroundColor Cyan
if (Test-Command "adb" "ADB (Android Debug Bridge)") {
    $adbVersion = adb version | Select-String "version"
    Write-Host "   Version: $adbVersion" -ForegroundColor White
} else {
    $allGood = $false
}

if (-not (Test-EnvVar "ANDROID_HOME" "ANDROID_HOME")) {
    $allGood = $false
}

# Check Android SDK components
$androidHome = [Environment]::GetEnvironmentVariable("ANDROID_HOME", "Machine")
if ($androidHome) {
    $platformTools = "$androidHome\platform-tools"
    $buildTools = "$androidHome\build-tools"
    $platforms = "$androidHome\platforms"
    
    if (Test-Path $platformTools) {
        Write-Host "✅ Platform Tools: Found" -ForegroundColor Green
    } else {
        Write-Host "❌ Platform Tools: Not found" -ForegroundColor Red
        $allGood = $false
    }
    
    if (Test-Path $buildTools) {
        Write-Host "✅ Build Tools: Found" -ForegroundColor Green
    } else {
        Write-Host "❌ Build Tools: Not found" -ForegroundColor Red
        $allGood = $false
    }
    
    if (Test-Path $platforms) {
        Write-Host "✅ Android Platforms: Found" -ForegroundColor Green
    } else {
        Write-Host "❌ Android Platforms: Not found" -ForegroundColor Red
        $allGood = $false
    }
}

# Check Expo CLI
Write-Host ""
Write-Host "📋 Checking Expo CLI..." -ForegroundColor Cyan
if (Test-Command "expo" "Expo CLI") {
    $expoVersion = expo --version
    Write-Host "   Version: $expoVersion" -ForegroundColor White
} else {
    Write-Host "⚠️  Expo CLI not found globally, but should work with npx" -ForegroundColor Yellow
}

# Check Node.js
Write-Host ""
Write-Host "📋 Checking Node.js..." -ForegroundColor Cyan
if (Test-Command "node" "Node.js") {
    $nodeVersion = node --version
    Write-Host "   Version: $nodeVersion" -ForegroundColor White
} else {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    $allGood = $false
}

if (Test-Command "npm" "npm") {
    $npmVersion = npm --version
    Write-Host "   npm Version: $npmVersion" -ForegroundColor White
} else {
    Write-Host "❌ npm not found" -ForegroundColor Red
    $allGood = $false
}

# Check if we're in the right directory
Write-Host ""
Write-Host "📋 Checking project setup..." -ForegroundColor Cyan
if (Test-Path "app.json") {
    Write-Host "✅ app.json: Found" -ForegroundColor Green
} else {
    Write-Host "❌ app.json: Not found (run this from frontend directory)" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path "package.json") {
    Write-Host "✅ package.json: Found" -ForegroundColor Green
} else {
    Write-Host "❌ package.json: Not found" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path "eas.json") {
    Write-Host "✅ eas.json: Found" -ForegroundColor Green
} else {
    Write-Host "❌ eas.json: Not found" -ForegroundColor Red
    $allGood = $false
}

# Summary
Write-Host ""
Write-Host "📊 Environment Summary:" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "🎉 All checks passed! Environment is ready for Android builds." -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Next steps:" -ForegroundColor Green
    Write-Host "1. Connect your Android device with USB debugging enabled" -ForegroundColor White
    Write-Host "2. Run: npm run build:android:local" -ForegroundColor White
    Write-Host "3. Or run: npx expo run:android" -ForegroundColor White
} else {
    Write-Host "❌ Some checks failed. Please fix the issues above." -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 To fix:" -ForegroundColor Yellow
    Write-Host "1. Install missing components (Java JDK 17+, Android Studio)" -ForegroundColor White
    Write-Host "2. Set environment variables (JAVA_HOME, ANDROID_HOME)" -ForegroundColor White
    Write-Host "3. Run setup-android-build.ps1 as administrator" -ForegroundColor White
    Write-Host "4. Refer to ANDROID_BUILD_SETUP.md for detailed instructions" -ForegroundColor White
}

Write-Host ""
Write-Host "📱 To enable USB debugging on Android device:" -ForegroundColor Cyan
Write-Host "1. Settings > About Phone > Tap Build Number 7 times" -ForegroundColor White
Write-Host "2. Settings > Developer Options > Enable USB Debugging" -ForegroundColor White
Write-Host "3. Connect device via USB and allow debugging" -ForegroundColor White
