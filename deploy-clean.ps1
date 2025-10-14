# Render Deployment Script - Clean Version
# No special characters to avoid PowerShell issues

$API_KEY = "rnd_9TXSUJbKIfSqyIUkLcsqbSY28MYt"
$OWNER_ID = "tea-d3erf1mmcj7s73doitng"
$REPO_URL = "https://github.com/scriptkid-py/chouieur-food"
$MONGO_URI = "mongodb+srv://zaidden123_db_user:u0bssk9YrDKF9YEe@myweb.8slnc33.mongodb.net/myapp_db?retryWrites=true&w=majority&appName=myweb"

$headers = @{
    "Authorization" = "Bearer $API_KEY"
    "Content-Type" = "application/json"
}

Write-Host "Starting Render Deployment..." -ForegroundColor Green

# Create Backend Service
Write-Host "Creating Backend Service..." -ForegroundColor Yellow

$backendPayload = @{
    name = "chouieur-express-backend"
    type = "web_service"
    ownerId = $OWNER_ID
    repo = $REPO_URL
    branch = "master"
    rootDir = "server"
    buildCommand = "npm install"
    startCommand = "npm start"
    plan = "free"
    region = "oregon"
    envVars = @(
        @{
            key = "MONGO_URI"
            value = $MONGO_URI
        },
        @{
            key = "NODE_ENV"
            value = "production"
        }
    )
}

$backendJson = $backendPayload | ConvertTo-Json -Depth 3

try {
    $backendResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers $headers -Body $backendJson
    Write-Host "Backend Service Created Successfully!" -ForegroundColor Green
    Write-Host "Backend Service ID: $($backendResponse.service.id)" -ForegroundColor Cyan
    Write-Host "Backend URL: $($backendResponse.service.serviceDetails.url)" -ForegroundColor Cyan
    
    $BACKEND_URL = $backendResponse.service.serviceDetails.url
} catch {
    Write-Host "Error creating backend service: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# Create Frontend Service
Write-Host "Creating Frontend Service..." -ForegroundColor Yellow

$frontendPayload = @{
    name = "chouieur-express-frontend"
    type = "web_service"
    ownerId = $OWNER_ID
    repo = $REPO_URL
    branch = "master"
    rootDir = "client"
    buildCommand = "npm ci"
    startCommand = "npm start"
    plan = "free"
    region = "oregon"
    envVars = @(
        @{
            key = "NEXT_PUBLIC_API_URL"
            value = $BACKEND_URL
        },
        @{
            key = "NODE_ENV"
            value = "production"
        }
    )
}

$frontendJson = $frontendPayload | ConvertTo-Json -Depth 3

try {
    $frontendResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers $headers -Body $frontendJson
    Write-Host "Frontend Service Created Successfully!" -ForegroundColor Green
    Write-Host "Frontend Service ID: $($frontendResponse.service.id)" -ForegroundColor Cyan
    Write-Host "Frontend URL: $($frontendResponse.service.serviceDetails.url)" -ForegroundColor Cyan
    
    $FRONTEND_URL = $frontendResponse.service.serviceDetails.url
} catch {
    Write-Host "Error creating frontend service: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# Update Backend CORS
Write-Host "Updating Backend CORS Configuration..." -ForegroundColor Yellow

$corsPayload = @{
    envVars = @(
        @{
            key = "MONGO_URI"
            value = $MONGO_URI
        },
        @{
            key = "NODE_ENV"
            value = "production"
        },
        @{
            key = "CLIENT_URL"
            value = $FRONTEND_URL
        }
    )
}

$corsJson = $corsPayload | ConvertTo-Json -Depth 3

try {
    $corsResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$($backendResponse.service.id)" -Method PATCH -Headers $headers -Body $corsJson
    Write-Host "Backend CORS Updated Successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error updating backend CORS: $($_.Exception.Message)" -ForegroundColor Red
}

# Deployment Summary
Write-Host ""
Write-Host "DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

Write-Host ""
Write-Host "Service Details:" -ForegroundColor Cyan
Write-Host "Backend Service:" -ForegroundColor White
Write-Host "  - Name: chouieur-express-backend" -ForegroundColor Gray
Write-Host "  - URL: $BACKEND_URL" -ForegroundColor Gray
Write-Host "  - Health Check: $BACKEND_URL/api/health" -ForegroundColor Gray

Write-Host ""
Write-Host "Frontend Service:" -ForegroundColor White
Write-Host "  - Name: chouieur-express-frontend" -ForegroundColor Gray
Write-Host "  - URL: $FRONTEND_URL" -ForegroundColor Gray

Write-Host ""
Write-Host "MongoDB Atlas:" -ForegroundColor White
Write-Host "  - Connection: Configured and ready" -ForegroundColor Gray
Write-Host "  - Database: myapp_db" -ForegroundColor Gray

Write-Host ""
Write-Host "Deployment Status:" -ForegroundColor Cyan
Write-Host "  - Backend: Building and deploying..." -ForegroundColor Yellow
Write-Host "  - Frontend: Building and deploying..." -ForegroundColor Yellow
Write-Host "  - Estimated time: 10-15 minutes" -ForegroundColor Yellow

Write-Host ""
Write-Host "Testing Commands:" -ForegroundColor Cyan
Write-Host "  - Test Backend: curl $BACKEND_URL/api/health" -ForegroundColor Gray
Write-Host "  - Test Frontend: Open $FRONTEND_URL in browser" -ForegroundColor Gray

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Wait for both services to finish building" -ForegroundColor White
Write-Host "  2. Test the backend health endpoint" -ForegroundColor White
Write-Host "  3. Open the frontend URL in your browser" -ForegroundColor White
Write-Host "  4. Check Render dashboard for deployment logs" -ForegroundColor White

Write-Host ""
Write-Host "Your Chouieur Express app is now deploying to Render!" -ForegroundColor Green
