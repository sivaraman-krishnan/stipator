# Google Maps API Key Updater Script
# Run this after you get your API key from Google Cloud Console

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

Write-Host "`n🗺️  Updating Google Maps API Key in Stipator project...`n" -ForegroundColor Cyan

$projectPath = "c:\stipator\stipator-mobile"
$envFile = Join-Path $projectPath ".env"
$appJsonFile = Join-Path $projectPath "app.json"

# Validate API key format (basic check)
if ($ApiKey -notmatch '^AIza[0-9A-Za-z_-]{35}$') {
    Write-Host "⚠️  Warning: API key format doesn't match expected pattern" -ForegroundColor Yellow
    Write-Host "   Expected format: AIzaSy... (39 characters total)" -ForegroundColor Yellow
    $continue = Read-Host "   Continue anyway? (Y/N)"
    if ($continue -ne 'Y' -and $continue -ne 'y') {
        Write-Host "❌ Aborted" -ForegroundColor Red
        exit
    }
}

# Update .env file
Write-Host "📝 Updating .env file..." -ForegroundColor Yellow
try {
    $envContent = Get-Content $envFile -Raw
    $envContent = $envContent -replace 'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=.*', "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=$ApiKey"
    $envContent | Set-Content $envFile -NoNewline
    Write-Host "   ✅ .env updated successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to update .env: $_" -ForegroundColor Red
    exit 1
}

# Update app.json file
Write-Host "📝 Updating app.json file..." -ForegroundColor Yellow
try {
    $appJsonContent = Get-Content $appJsonFile -Raw
    # Update iOS config
    $appJsonContent = $appJsonContent -replace '"googleMapsApiKey":\s*".*?"', "`"googleMapsApiKey`": `"$ApiKey`""
    # Update Android config
    $appJsonContent = $appJsonContent -replace '"apiKey":\s*"YOUR_GOOGLE_MAPS_API_KEY_HERE"', "`"apiKey`": `"$ApiKey`""
    $appJsonContent | Set-Content $appJsonFile -NoNewline
    Write-Host "   ✅ app.json updated successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to update app.json: $_" -ForegroundColor Red
    exit 1
}

# Verify updates
Write-Host "`n🔍 Verifying updates..." -ForegroundColor Yellow
$envCheck = Get-Content $envFile | Select-String "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"
$appJsonCheck = Get-Content $appJsonFile | Select-String "googleMapsApiKey"

Write-Host "`n✅ Configuration Updated Successfully!`n" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ".env file:" -ForegroundColor Cyan
Write-Host "  $envCheck" -ForegroundColor White
Write-Host "`napp.json file:" -ForegroundColor Cyan
Write-Host "  Lines updated: 2 (iOS + Android configs)" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "📱 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Restart Metro bundler if it's running (Ctrl+C)" -ForegroundColor White
Write-Host "   2. Run: npm start" -ForegroundColor White
Write-Host "   3. Test the map functionality`n" -ForegroundColor White

Write-Host "🎉 Google Maps API is now configured!`n" -ForegroundColor Green
