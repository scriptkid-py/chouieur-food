# 🚀 Render Deployment Script - Clean Next.js Project
# This script helps deploy the cleaned Next.js project to Render

Write-Host "🚀 Chouieur Express - Render Deployment Helper" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "src/app")) {
    Write-Host "❌ Error: src/app directory not found. Please ensure the project is properly structured." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project structure verified" -ForegroundColor Green

# Test build locally
Write-Host "`n🔨 Testing local build..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Local build successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Local build failed. Please fix build errors before deploying." -ForegroundColor Red
    exit 1
}

# Clean up build artifacts
Write-Host "`n🧹 Cleaning up build artifacts..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Build artifacts cleaned" -ForegroundColor Green
}

# Check git status
Write-Host "`n📋 Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
    Write-Host $gitStatus -ForegroundColor Gray
    Write-Host "`n💡 Consider committing your changes before deploying:" -ForegroundColor Cyan
    Write-Host "   git add ." -ForegroundColor Gray
    Write-Host "   git commit -m 'Your commit message'" -ForegroundColor Gray
    Write-Host "   git push origin master" -ForegroundColor Gray
} else {
    Write-Host "✅ Working directory is clean" -ForegroundColor Green
}

# Display deployment instructions
Write-Host "`n🎯 Render Deployment Instructions:" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to your Render dashboard" -ForegroundColor White
Write-Host "2. Find your frontend service" -ForegroundColor White
Write-Host "3. Update the configuration:" -ForegroundColor White
Write-Host "   - Root Directory: Leave EMPTY (not 'src/client' anymore)" -ForegroundColor Gray
Write-Host "   - Build Command: npm ci && npm run build" -ForegroundColor Gray
Write-Host "   - Start Command: npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Update environment variables if needed" -ForegroundColor White
Write-Host "5. Deploy manually or push to trigger auto-deploy" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see: RENDER_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan

# Check if backend service exists
Write-Host "`n🔍 Backend Service Check:" -ForegroundColor Yellow
Write-Host "If you have a backend service, make sure it's configured with:" -ForegroundColor White
Write-Host "- Root Directory: Leave empty" -ForegroundColor Gray
Write-Host "- Build Command: npm ci" -ForegroundColor Gray
Write-Host "- Start Command: npm start" -ForegroundColor Gray
Write-Host "- Environment Variables: GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, etc." -ForegroundColor Gray

Write-Host "`n🎉 Deployment preparation complete!" -ForegroundColor Green
Write-Host "Your clean Next.js project is ready for Render deployment." -ForegroundColor Green
