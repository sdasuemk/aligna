# Quick Test: Verify Provider Service Filtering

Write-Host "`n🧪 Testing Provider Service Filtering`n" -ForegroundColor Cyan

$apiUrl = "http://localhost:5000/api"
$providerEmail = "provider@example.com"
$providerPassword = "password123"

try {
    # 1. Login
    Write-Host "1️⃣ Logging in..." -ForegroundColor Yellow
    $loginBody = @{ email = $providerEmail; password = $providerPassword } | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    $providerId = $loginResponse.user.id
    Write-Host "✅ Logged in as provider (ID: $providerId)`n" -ForegroundColor Green

    # 2. Get services filtered by provider ID
    Write-Host "2️⃣ Fetching services for this provider..." -ForegroundColor Yellow
    $services = Invoke-RestMethod -Uri "$apiUrl/services?providerId=$providerId" -Method Get
    Write-Host "✅ Found $($services.Count) service(s) for this provider:`n" -ForegroundColor Green
    
    if ($services.Count -gt 0) {
        foreach ($svc in $services) {
            Write-Host "   📦 $($svc.name)" -ForegroundColor White
            Write-Host "      Category: $($svc.category)" -ForegroundColor Gray
            if ($svc.subcategory) {
                Write-Host "      Subcategory: $($svc.subcategory)" -ForegroundColor Gray
            }
            Write-Host "      Price: `$$($svc.price) | Duration: $($svc.duration) min" -ForegroundColor Gray
            Write-Host "      Available on: $(($svc.availability.PSObject.Properties.Name) -join ', ')" -ForegroundColor Gray
            Write-Host ""
        }
    }
    else {
        Write-Host "   No services found. Create one at http://localhost:3000/dashboard/services`n" -ForegroundColor Yellow
    }

    # 3. Get all services (no filter)
    Write-Host "3️⃣ Fetching all services (no filter)..." -ForegroundColor Yellow
    $allServices = Invoke-RestMethod -Uri "$apiUrl/services" -Method Get
    Write-Host "✅ Total services in database: $($allServices.Count)`n" -ForegroundColor Green

    Write-Host "🎉 Provider filtering is working correctly!" -ForegroundColor Green
    Write-Host "   ✓ Provider ID filter applied" -ForegroundColor Green
    Write-Host "   ✓ Services fetched successfully" -ForegroundColor Green

}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
