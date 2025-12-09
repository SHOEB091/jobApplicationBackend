# Quick API Test Script for Category System
# This script tests the category endpoints

Write-Host "`n🚀 Testing Category System API" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Test 1: Get all categories (should be empty initially)
Write-Host "📝 Test 1: GET /api/categories (Public)" -ForegroundColor Yellow
try {
    $categories = Invoke-RestMethod -Uri "http://localhost:5000/api/categories" -Method GET
    Write-Host "✅ Success! Count: $($categories.count)" -ForegroundColor Green
    Write-Host "   Response: $($categories | ConvertTo-Json -Depth 3)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $_`n" -ForegroundColor Red
}

# Test 2: Try to create category without authentication (should fail)
Write-Host "📝 Test 2: POST /api/categories (No Auth - Should Fail)" -ForegroundColor Yellow
try {
    $body = @{
        name = "Test Category"
        description = "This should fail"
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "http://localhost:5000/api/categories" -Method POST -ContentType "application/json" -Body $body
    Write-Host "❌ Test Failed - Should have been blocked!`n" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Correctly blocked! (401 Unauthorized)`n" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unexpected error: $_`n" -ForegroundColor Yellow
    }
}

# Test 3: Get all jobs (should show empty or existing jobs)
Write-Host "📝 Test 3: GET /api/jobs (Public)" -ForegroundColor Yellow
try {
    $jobs = Invoke-RestMethod -Uri "http://localhost:5000/api/jobs" -Method GET
    Write-Host "✅ Success! Total jobs: $($jobs.total)" -ForegroundColor Green
    Write-Host "   Response: $($jobs | ConvertTo-Json -Depth 2)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $_`n" -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "📊 Basic API Tests Complete!" -ForegroundColor Cyan
Write-Host "`nℹ️  To test authenticated endpoints:" -ForegroundColor Yellow
Write-Host "   1. Create a superadmin user" -ForegroundColor White
Write-Host "   2. Login to get session cookie" -ForegroundColor White
Write-Host "   3. Use the cookie to create categories" -ForegroundColor White
Write-Host "`nSee API_TEST_COMMANDS.md for detailed testing instructions.`n" -ForegroundColor White
