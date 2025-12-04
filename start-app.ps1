# PowerShell script to start both backend and frontend
# Run this from the project root directory

Write-Host "=== Starting Parking Slot Application ===" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    exit 1
}

# Check if MongoDB connection is configured
if (Test-Path "backend\.env") {
    Write-Host "✅ Backend .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend .env file not found!" -ForegroundColor Yellow
    Write-Host "   Please create backend/.env file" -ForegroundColor Yellow
}

# Check if frontend .env exists
if (Test-Path "frontend\.env") {
    Write-Host "✅ Frontend .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend .env file not found!" -ForegroundColor Yellow
    Write-Host "   Creating frontend/.env..." -ForegroundColor Yellow
    @"
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
"@ | Out-File -FilePath "frontend\.env" -Encoding utf8
    Write-Host "✅ Created frontend/.env" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Backend will start on: http://localhost:5000" -ForegroundColor Yellow
Write-Host "🌐 Frontend will start on: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Gray
Write-Host ""

# Start backend in new window
Write-Host "Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in new window
Write-Host "Starting frontend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm start"

Write-Host ""
Write-Host "✅ Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "Wait for:" -ForegroundColor Cyan
Write-Host "  - Backend: 'MongoDB Connected' and 'Server running on port 5000'" -ForegroundColor White
Write-Host "  - Frontend: 'Compiled successfully!' and browser opens" -ForegroundColor White
Write-Host ""
Write-Host "Close the windows or press Ctrl+C in each to stop the servers." -ForegroundColor Gray

