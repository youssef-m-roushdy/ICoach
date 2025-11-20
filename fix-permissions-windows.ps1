# Permission Fix & Cleanup Script for Windows
# Run this in PowerShell AS ADMINISTRATOR if you have permission issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "iCoach App - Permission Fix & Cleanup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  WARNING: This will delete temporary files!" -ForegroundColor Yellow
Write-Host "   - .expo folders" -ForegroundColor Gray
Write-Host "   - node_modules folders" -ForegroundColor Gray
Write-Host "   - Build cache" -ForegroundColor Gray
Write-Host ""

$confirmation = Read-Host "Continue? (yes/no)"
if ($confirmation -ne 'yes') {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Starting cleanup..." -ForegroundColor Yellow
Write-Host ""

# Function to safely remove directory
function Remove-SafeDirectory {
    param($path)
    if (Test-Path $path) {
        Write-Host "Removing: $path" -ForegroundColor Yellow
        try {
            Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
            Write-Host "✅ Removed: $path" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Could not remove: $path" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
            Write-Host "   Try running PowerShell as Administrator" -ForegroundColor Gray
        }
    } else {
        Write-Host "⏭️  Skipped (not found): $path" -ForegroundColor Gray
    }
}

# Clean application folder
Write-Host "Cleaning application folder..." -ForegroundColor Cyan
Remove-SafeDirectory "application\.expo"
Remove-SafeDirectory "application\node_modules"
Remove-SafeDirectory "application\android"
Remove-SafeDirectory "application\ios"
Remove-SafeDirectory "application\.expo-shared"

# Clean server folder
Write-Host "`nCleaning server folder..." -ForegroundColor Cyan
Remove-SafeDirectory "server\.expo"
Remove-SafeDirectory "server\node_modules"

# Clean AI folder
Write-Host "`nCleaning AI folder..." -ForegroundColor Cyan
Remove-SafeDirectory "AI\.expo"
Remove-SafeDirectory "AI\node_modules"

# Clean root
Write-Host "`nCleaning root folder..." -ForegroundColor Cyan
Remove-SafeDirectory ".expo"
Remove-SafeDirectory "node_modules"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Reinstall dependencies (application):" -ForegroundColor White
Write-Host "   cd application" -ForegroundColor Gray
Write-Host "   npm install" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Reinstall dependencies (server - if needed):" -ForegroundColor White
Write-Host "   cd server" -ForegroundColor Gray
Write-Host "   npm install" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Try building again:" -ForegroundColor White
Write-Host "   cd application" -ForegroundColor Gray
Write-Host "   eas build --profile development --platform android --clear-cache" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Never use 'sudo' or run as Admin for npm/expo commands!" -ForegroundColor Yellow
Write-Host ""
