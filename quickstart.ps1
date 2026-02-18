# ==============================================
# FoodBridge - Quick Start Script (Windows)
# ==============================================
# This script helps you verify your setup
# Run: .\quickstart.ps1

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     FoodBridge - Quick Start Check    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "`nChecking npm..." -ForegroundColor Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "✗ npm not found" -ForegroundColor Red
    exit 1
}

# Check server dependencies
Write-Host "`nChecking server setup..." -ForegroundColor Yellow
if (Test-Path "server/package.json") {
    Write-Host "✓ Server package.json found" -ForegroundColor Green
    
    if (Test-Path "server/node_modules") {
        Write-Host "✓ Server dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "! Server dependencies not installed" -ForegroundColor Yellow
        Write-Host "  Run: cd server && npm install" -ForegroundColor Gray
    }
    
    if (Test-Path "server/.env") {
        Write-Host "✓ Server .env file found" -ForegroundColor Green
    } else {
        Write-Host "! Server .env file missing" -ForegroundColor Yellow
        Write-Host "  Run: cd server && cp .env.example .env" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ Server package.json not found" -ForegroundColor Red
}

# Check client dependencies
Write-Host "`nChecking client setup..." -ForegroundColor Yellow
if (Test-Path "client/package.json") {
    Write-Host "✓ Client package.json found" -ForegroundColor Green
    
    if (Test-Path "client/node_modules") {
        Write-Host "✓ Client dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "! Client dependencies not installed" -ForegroundColor Yellow
        Write-Host "  Run: cd client && npm install" -ForegroundColor Gray
    }
    
    if (Test-Path "client/.env.local") {
        Write-Host "✓ Client .env.local file found" -ForegroundColor Green
    } else {
        Write-Host "! Client .env.local file missing" -ForegroundColor Yellow
        Write-Host "  Run: cd client && cp .env.example .env.local" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ Client package.json not found" -ForegroundColor Red
}

# Next steps
Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           Next Steps                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "1. Set up Supabase database (see SETUP.md)" -ForegroundColor White
Write-Host "2. Configure environment variables" -ForegroundColor White
Write-Host "3. Start backend:  cd server  && npm run dev" -ForegroundColor White
Write-Host "4. Start frontend: cd client  && npm run dev" -ForegroundColor White
Write-Host "`nFor detailed instructions, see SETUP.md`n" -ForegroundColor Gray
