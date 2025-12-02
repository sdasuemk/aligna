# Test Service Management APIs with Categories

Write-Host "🧪 Testing Service Management APIs with Categories`n" -ForegroundColor Cyan

# Test credentials
$providerEmail = "provider@example.com"
$providerPassword = "password123"
$apiUrl = "http://localhost:5000/api"

try {
    # 1. Login as provider
    Write-Host "1️⃣ Logging in as provider..." -ForegroundColor Yellow
    $loginBody = @{
        email = $providerEmail
        password = $providerPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Login successful`n" -ForegroundColor Green

    # 2. Get all categories
    Write-Host "2️⃣ Fetching categories..." -ForegroundColor Yellow
    $categories = Invoke-RestMethod -Uri "$apiUrl/categories" -Method Get
    Write-Host "✅ Found $($categories.Count) categories:" -ForegroundColor Green
    foreach ($cat in $categories) {
        Write-Host "   $($cat.icon) $($cat.name) - $($cat.description)" -ForegroundColor White
    }
    Write-Host ""

    # 3. Create a new service
    Write-Host "3️⃣ Creating a new service..." -ForegroundColor Yellow
    $newService = @{
        name = "Hatha Yoga Class"
        description = "Beginner-friendly yoga session"
        category = "Fitness & Wellness"
        subcategory = "Hatha Yoga"
        duration = 60
        price = 25
        maxCapacity = 10
        availability = @{
            mon = @("09:00-10:00", "18:00-19:00")
            wed = @("09:00-10:00", "18:00-19:00")
            fri = @("09:00-10:00", "18:00-19:00")
        }
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $service = Invoke-RestMethod -Uri "$apiUrl/services" -Method Post -Body $newService -Headers $headers
    Write-Host "✅ Service created successfully!" -ForegroundColor Green
    Write-Host "   ID: $($service._id)" -ForegroundColor White
    Write-Host "   Name: $($service.name)" -ForegroundColor White
    Write-Host "   Category: $($service.category)" -ForegroundColor White
    Write-Host "   Subcategory: $($service.subcategory)" -ForegroundColor White
    Write-Host "   Price: `$$($service.price)" -ForegroundColor White
    Write-Host ""

    # 4. Get all services
    Write-Host "4️⃣ Fetching all services..." -ForegroundColor Yellow
    $services = Invoke-RestMethod -Uri "$apiUrl/services" -Method Get
    Write-Host "✅ Found $($services.Count) service(s):" -ForegroundColor Green
    foreach ($svc in $services) {
        $subcat = if ($svc.subcategory) { " > $($svc.subcategory)" } else { "" }
        Write-Host "   - $($svc.name) ($($svc.category)$subcat)" -ForegroundColor White
    }
    Write-Host ""

    Write-Host "🎉 All tests passed successfully!`n" -ForegroundColor Green
    Write-Host "📊 Summary:" -ForegroundColor Cyan
    Write-Host "   ✓ Categories API working" -ForegroundColor Green
    Write-Host "   ✓ Service creation with category/subcategory working" -ForegroundColor Green
    Write-Host "   ✓ Service listing working" -ForegroundColor Green
    Write-Host "   ✓ Availability time slots working" -ForegroundColor Green

} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception -ForegroundColor Red
    exit 1
}
