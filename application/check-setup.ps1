# Quick Setup Script for Team Members
# Run this in PowerShell from the application folder

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "iCoach App - Team Setup Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}

# Check Java
Write-Host "Checking Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✅ Java installed: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found! Please install JDK 17" -ForegroundColor Red
}

# Check Android SDK
Write-Host "Checking Android SDK..." -ForegroundColor Yellow
if ($env:ANDROID_HOME) {
    Write-Host "✅ ANDROID_HOME set: $env:ANDROID_HOME" -ForegroundColor Green
} else {
    Write-Host "⚠️  ANDROID_HOME not set. Android Studio might not be configured." -ForegroundColor Yellow
    Write-Host "   Expected path: C:\Users\$env:USERNAME\AppData\Local\Android\Sdk" -ForegroundColor Gray
}

# Check adb
Write-Host "Checking ADB..." -ForegroundColor Yellow
try {
    $adbVersion = adb version 2>&1 | Select-String "Android Debug Bridge version"
    Write-Host "✅ ADB available: $adbVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ADB not found! Add Android SDK platform-tools to PATH" -ForegroundColor Red
}

# Check for running emulator
Write-Host "`nChecking for running emulator..." -ForegroundColor Yellow
try {
    $devices = adb devices | Select-String "device$"
    if ($devices) {
        Write-Host "✅ Emulator/Device found:" -ForegroundColor Green
        adb devices
    } else {
        Write-Host "⚠️  No emulator running. Please start an emulator first!" -ForegroundColor Yellow
        Write-Host "   Run: emulator -list-avds" -ForegroundColor Gray
        Write-Host "   Then: emulator -avd <emulator_name>" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Cannot check devices" -ForegroundColor Red
}

# Check backend server
Write-Host "`nChecking backend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api" -TimeoutSec 3 -UseBasicParsing
    Write-Host "✅ Backend server is running!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend server not responding at http://localhost:5000/api" -ForegroundColor Yellow
    Write-Host "   Make sure Docker containers are running:" -ForegroundColor Gray
    Write-Host "   cd ../server && docker-compose up -d" -ForegroundColor Gray
}

# Check .env file
Write-Host "`nChecking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "EXPO_PUBLIC_API_URL") {
        Write-Host "✅ API URL configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  .env file might be incomplete" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .env file NOT found!" -ForegroundColor Red
    Write-Host "   Create .env file from .env.example" -ForegroundColor Gray
    Write-Host "   cp .env.example .env" -ForegroundColor Gray
}

# Check node_modules
Write-Host "`nChecking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules not found. Run: npm install" -ForegroundColor Yellow
}

# Check if app is installed on device
Write-Host "`nChecking if app is installed..." -ForegroundColor Yellow
try {
    $appInstalled = adb shell pm list packages | Select-String "com.icoach.application"
    if ($appInstalled) {
        Write-Host "✅ App is installed on emulator" -ForegroundColor Green
    } else {
        Write-Host "⚠️  App NOT installed on emulator!" -ForegroundColor Yellow
        Write-Host "   This is the most common issue!" -ForegroundColor Red
        Write-Host "   You MUST run: npx expo run:android" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  Cannot check app installation" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Check Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. If emulator is not running:" -ForegroundColor White
Write-Host "   - Start Android Studio → Device Manager → Start emulator" -ForegroundColor Gray
Write-Host ""
Write-Host "2. If backend is not running:" -ForegroundColor White
Write-Host "   cd ../server" -ForegroundColor Gray
Write-Host "   docker-compose up -d" -ForegroundColor Gray
Write-Host ""
Write-Host "3. If app is NOT installed (most important!):" -ForegroundColor White
Write-Host "   npx expo run:android" -ForegroundColor Cyan
Write-Host "   (This takes 5-10 minutes the first time)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. After app is installed, run port forwarding:" -ForegroundColor White
Write-Host "   .\reverse-ports-forwarding" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Then start development:" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
