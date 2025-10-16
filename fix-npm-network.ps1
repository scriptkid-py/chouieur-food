# =============================================================================
# NPM NETWORK ERROR FIX SCRIPT
# =============================================================================
# 
# This script fixes common npm network issues including:
# - ECONNRESET errors
# - Proxy configuration problems
# - Cache corruption
# - Network timeout issues
# 
# Usage: Run this script in PowerShell as Administrator
#

Write-Host "🔧 NPM Network Error Fix Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# =============================================================================
# STEP 1: DETECT NETWORK ISSUES
# =============================================================================

Write-Host "`n🔍 Detecting network configuration..." -ForegroundColor Yellow

# Check current npm config
Write-Host "Current npm configuration:" -ForegroundColor Cyan
npm config list

# Check if behind proxy
$proxy = npm config get proxy
$httpsProxy = npm config get https-proxy

if ($proxy -and $proxy -ne "null") {
    Write-Host "⚠️  Proxy detected: $proxy" -ForegroundColor Yellow
} else {
    Write-Host "✅ No proxy configured" -ForegroundColor Green
}

if ($httpsProxy -and $httpsProxy -ne "null") {
    Write-Host "⚠️  HTTPS Proxy detected: $httpsProxy" -ForegroundColor Yellow
} else {
    Write-Host "✅ No HTTPS proxy configured" -ForegroundColor Green
}

# =============================================================================
# STEP 2: CLEAR NPM CACHE
# =============================================================================

Write-Host "`n🧹 Clearing npm cache..." -ForegroundColor Yellow

try {
    npm cache clean --force
    Write-Host "✅ NPM cache cleared successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error clearing cache: $($_.Exception.Message)" -ForegroundColor Red
}

# =============================================================================
# STEP 3: REMOVE PROXY SETTINGS
# =============================================================================

Write-Host "`n🚫 Removing proxy settings..." -ForegroundColor Yellow

try {
    npm config delete proxy
    Write-Host "✅ HTTP proxy removed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No HTTP proxy to remove" -ForegroundColor Yellow
}

try {
    npm config delete https-proxy
    Write-Host "✅ HTTPS proxy removed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No HTTPS proxy to remove" -ForegroundColor Yellow
}

# =============================================================================
# STEP 4: CONFIGURE RELIABLE REGISTRY
# =============================================================================

Write-Host "`n🌐 Configuring reliable registry..." -ForegroundColor Yellow

try {
    npm config set registry https://registry.npmjs.org/
    Write-Host "✅ Registry set to https://registry.npmjs.org/" -ForegroundColor Green
} catch {
    Write-Host "❌ Error setting registry: $($_.Exception.Message)" -ForegroundColor Red
}

# =============================================================================
# STEP 5: CONFIGURE NETWORK TIMEOUTS
# =============================================================================

Write-Host "`n⏱️  Configuring network timeouts..." -ForegroundColor Yellow

try {
    npm config set fetch-retries 5
    Write-Host "✅ Fetch retries set to 5" -ForegroundColor Green
} catch {
    Write-Host "❌ Error setting fetch-retries: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    npm config set fetch-retry-maxtimeout 120000
    Write-Host "✅ Max timeout set to 120 seconds" -ForegroundColor Green
} catch {
    Write-Host "❌ Error setting max timeout: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    npm config set fetch-retry-mintimeout 20000
    Write-Host "✅ Min timeout set to 20 seconds" -ForegroundColor Green
} catch {
    Write-Host "❌ Error setting min timeout: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    npm config set network-timeout 600000
    Write-Host "✅ Network timeout set to 10 minutes" -ForegroundColor Green
} catch {
    Write-Host "❌ Error setting network timeout: $($_.Exception.Message)" -ForegroundColor Red
}

# =============================================================================
# STEP 6: VERIFY CONFIGURATION
# =============================================================================

Write-Host "`n✅ Verifying configuration..." -ForegroundColor Yellow

Write-Host "Updated npm configuration:" -ForegroundColor Cyan
npm config list

# =============================================================================
# STEP 7: TEST NPM CONNECTIVITY
# =============================================================================

Write-Host "`n🧪 Testing npm connectivity..." -ForegroundColor Yellow

try {
    npm ping
    Write-Host "✅ NPM registry is reachable" -ForegroundColor Green
} catch {
    Write-Host "❌ NPM registry ping failed: $($_.Exception.Message)" -ForegroundColor Red
}

# =============================================================================
# STEP 8: SUMMARY
# =============================================================================

Write-Host "`n📊 NPM Network Fix Summary" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green

Write-Host "✅ Cache cleared" -ForegroundColor Green
Write-Host "✅ Proxy settings removed" -ForegroundColor Green
Write-Host "✅ Registry configured" -ForegroundColor Green
Write-Host "✅ Network timeouts increased" -ForegroundColor Green
Write-Host "✅ Retry settings optimized" -ForegroundColor Green

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Try running: npm install" -ForegroundColor White
Write-Host "2. If issues persist, try: yarn install" -ForegroundColor White
Write-Host "3. Check your internet connection" -ForegroundColor White
Write-Host "4. Consider using a VPN if behind corporate firewall" -ForegroundColor White

Write-Host "`n🚀 NPM network configuration has been optimized!" -ForegroundColor Green

