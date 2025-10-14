# Simple Render Deployment Script
# Fixes PowerShell syntax issues

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

$backendData = @{
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

$backendJson = $backendData | ConvertTo-Json -Depth 3

try {
    $backendResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers $headers -Body $backendJson
    Write-Host "Backend Service Created!" -ForegroundColor Green
    Write-Host "Backend URL: $($backendResponse.service.serviceDetails.url)" -ForegroundColor Cyan
    $BACKEND_URL = $backendResponse.service.serviceDetails.url
} catch {
    Write-Host "Error creating backend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create Frontend Service
Write-Host "Creating Frontend Service..." -ForegroundColor Yellow

$frontendData = @{
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

$frontendJson = $frontendData | ConvertTo-Json -Depth 3

try {
    $frontendResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers $headers -Body $frontendJson
    Write-Host "Frontend Service Created!" -ForegroundColor Green
    Write-Host "Frontend URL: $($frontendResponse.service.serviceDetails.url)" -ForegroundColor Cyan
    $FRONTEND_URL = $frontendResponse.service.serviceDetails.url
} catch {
    Write-Host "Error creating frontend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Update Backend CORS
Write-Host "Updating Backend CORS..." -ForegroundColor Yellow

$corsData = @{
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

$corsJson = $corsData | ConvertTo-Json -Depth 3

try {
    $corsResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$($backendResponse.service.id)" -Method PATCH -Headers $headers -Body $corsJson
    Write-Host "Backend CORS Updated!" -ForegroundColor Green
} catch {
    Write-Host "Error updating CORS: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "Backend: $BACKEND_URL" -ForegroundColor Cyan
Write-Host "Frontend: $FRONTEND_URL" -ForegroundColor Cyan
Write-Host "Health Check: $BACKEND_URL/api/health" -ForegroundColor Cyan
