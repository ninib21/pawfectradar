# 🚀 PawfectRadar Application Starter
# Run from: C:\Pawfectradar

Write-Host "🚀 Starting PawfectRadar Application..." -ForegroundColor Green

# Set environment variables
$env:PORT = "3001"
$env:NODE_ENV = "development"
$env:DB_HOST = "127.0.0.1"
$env:DB_PORT = "5434"
$env:DB_USER = "postgres"
$env:DB_PASS = "postgres"
$env:DB_NAME = "pawfectradar_dev"
$env:DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5434/pawfectradar_dev?schema=public"

# Start backend
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run start:dev" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep 5

# Start frontend
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "🎉 PawfectRadar Application Starting!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "🔧 Backend:  http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Please wait 30-60 seconds for servers to fully start..." -ForegroundColor Yellow
Write-Host "📱 Then open your browser to: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
