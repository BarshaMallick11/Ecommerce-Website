#!/usr/bin/env pwsh
# Troubleshooting script for Product Link & Routing Issues

Write-Host "`n=== Premium.Store - Routing Troubleshoot ===" -ForegroundColor Green
Write-Host ""

# Check if ports are in use
Write-Host "Checking server status..." -ForegroundColor Yellow
Write-Host ""

$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
$port5000 = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "✅ Frontend server is running on port 3000" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend server is NOT running on port 3000" -ForegroundColor Red
    Write-Host "   Run: cd frontend && npm start" -ForegroundColor Yellow
}

if ($port5000) {
    Write-Host "✅ Backend server is running on port 5000" -ForegroundColor Green
} else {
    Write-Host "❌ Backend server is NOT running on port 5000" -ForegroundColor Red
    Write-Host "   Run: cd backend && node server.js" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Important Notes ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Always access your app at: http://localhost:3000" -ForegroundColor White
Write-Host "✓ Do NOT use: http://localhost:5000 (that's only for API)" -ForegroundColor White
Write-Host ""
Write-Host "✓ Product links should work like: http://localhost:3000/product/12345" -ForegroundColor White
Write-Host "✓ Refreshing any page should work without 'Not Found' errors" -ForegroundColor White
Write-Host ""
Write-Host "=== Testing URLs ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Try these URLs in your browser:" -ForegroundColor White
Write-Host "  • http://localhost:3000" -ForegroundColor Gray
Write-Host "  • http://localhost:3000/products" -ForegroundColor Gray
Write-Host "  • http://localhost:3000/product/[any-product-id]" -ForegroundColor Gray
Write-Host ""
Write-Host "If you still see issues:" -ForegroundColor Yellow
Write-Host "  1. Clear browser cache (Ctrl + Shift + Del)" -ForegroundColor Gray
Write-Host "  2. Hard refresh the page (Ctrl + F5)" -ForegroundColor Gray
Write-Host "  3. Ensure you're using port 3000, not 5000" -ForegroundColor Gray
Write-Host ""
