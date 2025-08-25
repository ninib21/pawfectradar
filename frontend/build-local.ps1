# 📱 Local Mobile App Build Script for PawfectRadar
# Creates local builds for testing

Write-Host "🚀 Starting Local Mobile App Build Process..." -ForegroundColor Green

# 0) Ensure we're in the frontend directory
if (-not (Test-Path package.json) -and (Test-Path ..\package.json)) { Set-Location .. }
if (-not (Test-Path app.json)) { Write-Error "Run this from C:\Pawfectradar\frontend"; exit 1 }

# 1) Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
}

# 2) Start development server
Write-Host "🔄 Starting development server..." -ForegroundColor Blue
Write-Host "This will start the Expo development server for local testing" -ForegroundColor Cyan

try {
    # Start the development server in the background
    Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -PassThru
    Write-Host "✅ Development server started!" -ForegroundColor Green
    Write-Host "📱 You can now test the app using:" -ForegroundColor Yellow
    Write-Host "   - Expo Go app on your phone" -ForegroundColor White
    Write-Host "   - Android emulator" -ForegroundColor White
    Write-Host "   - iOS simulator (macOS only)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed to start development server: $_" -ForegroundColor Red
}

# 3) Alternative: Build for web
Write-Host "`n🌐 Building for web..." -ForegroundColor Blue
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Web build completed successfully!" -ForegroundColor Green
        Write-Host "📁 Web build available in: dist/" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Web build failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Web build failed with error: $_" -ForegroundColor Red
}

Write-Host "`n🎯 Local Development Options:" -ForegroundColor Yellow
Write-Host "==========================" -ForegroundColor Yellow
Write-Host "1. 📱 Use Expo Go app to scan QR code" -ForegroundColor White
Write-Host "2. 🤖 Use Android Studio emulator" -ForegroundColor White
Write-Host "3. 🍎 Use Xcode simulator (macOS)" -ForegroundColor White
Write-Host "4. 🌐 Open web version in browser" -ForegroundColor White

Write-Host "`n🚀 Local build setup completed!" -ForegroundColor Green
