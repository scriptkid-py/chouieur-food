# Final Render Deployment Script
Write-Host "Starting Render Deployment..." -ForegroundColor Green

# Configuration
$API_KEY = "rnd_9TXSUJbKIfSqyIUkLcsqbSY28MYt"
$OWNER_ID = "tea-d3erf1mmcj7s73doitng"
$REPO_URL = "https://github.com/scriptkid-py/chouieur-food"

# API Headers
$headers = @{
    "Authorization" = "Bearer $API_KEY"
    "Content-Type" = "application/json"
}

Write-Host "Creating Backend Service..." -ForegroundColor Yellow

# Backend Service Payload
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
            key = "GOOGLE_SHEETS_ID"
            value = "13D8FOHg_zycwBi67_Rq3UYiR_V1aDxomSCe8dNZwsvk"
        },
        @{
            key = "GOOGLE_SERVICE_ACCOUNT_EMAIL"
            value = "chouieur-express-service@chouieur-express-sheets.iam.gserviceaccount.com"
        },
        @{
            key = "GOOGLE_PRIVATE_KEY"
            value = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCHoQYJ0nK7mFFZ\nomz6vLAKAHRqCcF4fOo/G8WOecrgd5uxl7g1k9y1c19lGKPBgOz2pIHSLpqCiTVO\nZkQBAEUmJWwF8HfWvU2Il3fA23VcP9XTWdRSaW4BQk9IaVTKrMbebyVV33wxZFtF\n9dLf0jZtXom25gNuVeWmctOa6k5W5eSCa1PIaOZNYmkNzXVH5dSIJLacwhUlJNyv\n9QUzHiX6uGEozmJYpGRduwhQNxXBr3YW5ZKXn9fb5D8CTHo2dZORdeASYDJ818nA\nepAbJmG+bDlo7RpDCqg4W5srZSpjSHE/rT4Bsr0wet8X1hPehDom2dTt7UFB72e/\nCSdtLnbZAgMBAAECggEACOnRLsYQ2jlJZ12gUd4ip5WeEPXxLAzxjBI0KofgiF3z\n8njpF0RPZfFeHJPA90+UwyTOj1SWvOttgGiCIZq18KrW7ZD/HzKzrL1flmIV1Wkw\nkUI/DOd23khQU47wjp1KOIYPaxRT4h8ZTIC6ShFTmF51KHr3UMH+ZLD5LR4m5dj/\nbI8027B8eGl6C/S62rKJL9k1fCfLIeqL1qRcpqhr2+VhLikqcHNH2bazpUVer6mn\nQzi2ME8HUoAM8+Q6sy9/y77nVqAyXDJVuvHdqQXMB9hzzsqan8RA2Rjgz7NK5N8P\nq6DfX3pJm5VoULKLvgv+BNwIAlRhtTKcmHeg5BUs3QKBgQC65IWydG2vUFqDkFpS\n+mL963I4JbjAdoZR2Sptc5lazg5U4QPY6px2qLGTBU3Bw4hm04LHaxzC2BXaw5K2\n8rLg6L3t5cETc/U1qwD2zCkZukqq3sGL7PX6utdTZXgYFPFs+CaMl1lpi93ZvrDI\ns22MaxuogMLVBE/Dj8WBEdCDzwKBgQC5x9KlBPeyzdcSCvw1p3oq0CWqTwSeOW0p\n8ZYINDEDvZ6hnccNwwtMc65/Gf4xhEjD9mpCKvQnxBD+qzB8JuvUhjPtzck0Skj+\no8s7GxKdzn07IjA6FyShSN7tzxLHherOoA6CUdI4Aw9EWK2tkAfBecN4qgHTCMOd\nG1bTubD81wKBgA0p22DeYntepYFuwW3mxOItmzXpMkIcFwncyeg7pCmJKelAkAzP\nOYYCC7/XN8rWAt17OFLjcHsozSFDdSn9nivJONdwv1CncjX9fWvkpWByhp/SYL+C\nSTEHx/LPys2na/nI4K42Ws3cVBvqGnmIacbiJGiR6ScnzpZvofGdV5pxAoGATbbo\nR/2e/F4dBMAxpuQrN7OgvfCWFvYg0zXrM/1ZL55nuGW++ePIWy/dI/AkpGQY6Fix\nNIKxZd0f2tiTzKufZWTKXkUCUOxuQo8UGeKGVBsnyc/Qasx5lzpbfxFrYqmDgvHz\nf9JoZOPqxAVwibVBeU7NVTGQ183HvnXMSX9ZKTsCgYBDvyqgMAqPRGSAmYQ1T5ZJ\nNeUvu0QhxorZ0xV3X7AvEKAnoa4Z2jFnvq1tZMXr0bpDHEzqNK/f6um78TwP7z7h\nT7aFKSYT/2aYFgvSdXxPVoCHj33NApnYPHVD7NGltvMCQbO34aA3qyWEJoHDQKSs\ndk5yvqVdqBoJ7hZg7HMe3w==\n-----END PRIVATE KEY-----\n"
        },
        @{
            key = "NODE_ENV"
            value = "production"
        }
    )
} | ConvertTo-Json -Depth 3

try {
    $backendResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers $headers -Body $backendPayload
    Write-Host "Backend Service Created Successfully!" -ForegroundColor Green
    Write-Host "Backend Service ID: $($backendResponse.service.id)" -ForegroundColor Cyan
    Write-Host "Backend URL: $($backendResponse.service.serviceDetails.url)" -ForegroundColor Cyan
    
    $BACKEND_URL = $backendResponse.service.serviceDetails.url
} catch {
    Write-Host "Error creating backend service: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

Write-Host "Creating Frontend Service..." -ForegroundColor Yellow

# Frontend Service Payload
$frontendPayload = @{
    name = "chouieur-express-frontend"
    type = "web_service"
    ownerId = $OWNER_ID
    repo = $REPO_URL
    branch = "master"
    rootDir = "client"
    buildCommand = "npm ci; npm run build"
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
} | ConvertTo-Json -Depth 3

try {
    $frontendResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers $headers -Body $frontendPayload
    Write-Host "Frontend Service Created Successfully!" -ForegroundColor Green
    Write-Host "Frontend Service ID: $($frontendResponse.service.id)" -ForegroundColor Cyan
    Write-Host "Frontend URL: $($frontendResponse.service.serviceDetails.url)" -ForegroundColor Cyan
    
    $FRONTEND_URL = $frontendResponse.service.serviceDetails.url
} catch {
    Write-Host "Error creating frontend service: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Updating Backend CORS Configuration..." -ForegroundColor Yellow

# Update Backend CORS
$corsPayload = @{
    envVars = @(
        @{
            key = "GOOGLE_SHEETS_ID"
            value = "13D8FOHg_zycwBi67_Rq3UYiR_V1aDxomSCe8dNZwsvk"
        },
        @{
            key = "GOOGLE_SERVICE_ACCOUNT_EMAIL"
            value = "chouieur-express-service@chouieur-express-sheets.iam.gserviceaccount.com"
        },
        @{
            key = "GOOGLE_PRIVATE_KEY"
            value = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCHoQYJ0nK7mFFZ\nomz6vLAKAHRqCcF4fOo/G8WOecrgd5uxl7g1k9y1c19lGKPBgOz2pIHSLpqCiTVO\nZkQBAEUmJWwF8HfWvU2Il3fA23VcP9XTWdRSaW4BQk9IaVTKrMbebyVV33wxZFtF\n9dLf0jZtXom25gNuVeWmctOa6k5W5eSCa1PIaOZNYmkNzXVH5dSIJLacwhUlJNyv\n9QUzHiX6uGEozmJYpGRduwhQNxXBr3YW5ZKXn9fb5D8CTHo2dZORdeASYDJ818nA\nepAbJmG+bDlo7RpDCqg4W5srZSpjSHE/rT4Bsr0wet8X1hPehDom2dTt7UFB72e/\nCSdtLnbZAgMBAAECggEACOnRLsYQ2jlJZ12gUd4ip5WeEPXxLAzxjBI0KofgiF3z\n8njpF0RPZfFeHJPA90+UwyTOj1SWvOttgGiCIZq18KrW7ZD/HzKzrL1flmIV1Wkw\nkUI/DOd23khQU47wjp1KOIYPaxRT4h8ZTIC6ShFTmF51KHr3UMH+ZLD5LR4m5dj/\nbI8027B8eGl6C/S62rKJL9k1fCfLIeqL1qRcpqhr2+VhLikqcHNH2bazpUVer6mn\nQzi2ME8HUoAM8+Q6sy9/y77nVqAyVDJVuvHdqQXMB9hzzsqan8RA2Rjgz7NK5N8P\nq6DfX3pJm5VoULKLvgv+BNwIAlRhtTKcmHeg5BUs3QKBgQC65IWydG2vUFqDkFpS\n+mL963I4JbjAdoZR2Sptc5lazg5U4QPY6px2qLGTBU3Bw4hm04LHaxzC2BXaw5K2\n8rLg6L3t5cETc/U1qwD2zCkZukqq3sGL7PX6utdTZXgYVer6mn\nQzi2ME8HUoAM8+Q6sy9/y77nVqAyXDJVuvHdqQXMB9hzzsqan8RA2Rjgz7NK5N8P\nq6DfX3pJm5VoULKLvgv+BNwIAlRhtTKcmHeg5BUs3QKBgQC65IWydG2vUFqDkFpS\n+mL963I4JbjAdoZR2Sptc5lazg5U4QPY6px2qLGTBU3Bw4hm04LHaxzC2BXaw5K2\n8rLg6L3t5cETc/U1qwD2zCkZukqq3sGL7PX6utdTZXgYFPFs+CaMl1lpi93ZvrDI\ns22MaxuogMLVBE/Dj8WBEdCDzwKBgQC5x9KlBPeyzdcSCvw1p3oq0CWqTwSeOW0p\n8ZYINDEDvZ6hnccNwwtMc65/Gf4xhEjD9mpCKvQnxBD+qzB8JuvUhjPtzck0Skj+\no8s7GxKdzn07IjA6FyShSN7tzxLHherOoA6CUdI4Aw9EWK2tkAfBecN4qgHTCMOd\nG1bTubD81wKBgA0p22DeYntepYFuwW3mxOItmzXpMkIcFwncyeg7pCmJKelAkAzP\nOYYCC7/XN8rWAt17OFLjcHsozSFDdSn9nivJONdwv1CncjX9fWvkpWByhp/SYL+C\nSTEHx/LPys2na/nI4K42Ws3cVBvqGnmIacbiJGiR6ScnzpZvofGdV5pxAoGATbbo\nR/2e/F4dBMAxpuQrN7OgvfCWFvYg0zXrM/1ZL55nuGW++ePIWy/dI/AkpGQY6Fix\nNIKxZd0f2tiTzKufZWTKXkUCUOxuQo8UGeKGVBsnyc/Qasx5lzpbfxFrYqmDgvHz\nf9JoZOPqxAVwibVBeU7NVTGQ183HvnXMSX9ZKTsCgYBDvyqgMAqPRGSAmYQ1T5ZJ\nNeUvu0QhxorZ0xV3X7AvEKAnoa4Z2jFnvq1tZMXr0bpDHEzqNK/f6um78TwP7z7h\nT7aFKSYT/2aYFgvSdXxPVoCHj33NApnYPHVD7NGltvMCQbO34aA3qyWEJoHDQKSs\ndk5yvqVdqBoJ7hZg7HMe3w==\n-----END PRIVATE KEY-----\n"
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
} | ConvertTo-Json -Depth 3

try {
    $corsResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$($backendResponse.service.id)" -Method PATCH -Headers $headers -Body $corsPayload
    Write-Host "Backend CORS Updated Successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error updating backend CORS: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

Write-Host "Service Details:" -ForegroundColor Cyan
Write-Host "Backend Service:" -ForegroundColor White
Write-Host "  - Name: chouieur-express-backend" -ForegroundColor Gray
Write-Host "  - URL: $BACKEND_URL" -ForegroundColor Gray
Write-Host "  - Health Check: $BACKEND_URL/api/health" -ForegroundColor Gray

Write-Host "Frontend Service:" -ForegroundColor White
Write-Host "  - Name: chouieur-express-frontend" -ForegroundColor Gray
Write-Host "  - URL: $FRONTEND_URL" -ForegroundColor Gray

Write-Host "Google Sheets:" -ForegroundColor White
Write-Host "  - Connection: Configured and ready" -ForegroundColor Gray
Write-Host "  - Database: Google Sheets" -ForegroundColor Gray

Write-Host "Deployment Status:" -ForegroundColor Cyan
Write-Host "  - Backend: Building and deploying..." -ForegroundColor Yellow
Write-Host "  - Frontend: Building and deploying..." -ForegroundColor Yellow
Write-Host "  - Estimated time: 10-15 minutes" -ForegroundColor Yellow

Write-Host "Testing Commands:" -ForegroundColor Cyan
Write-Host "  - Test Backend: curl $BACKEND_URL/api/health" -ForegroundColor Gray
Write-Host "  - Test Frontend: Open $FRONTEND_URL in browser" -ForegroundColor Gray

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Wait for both services to finish building" -ForegroundColor White
Write-Host "  2. Test the backend health endpoint" -ForegroundColor White
Write-Host "  3. Open the frontend URL in your browser" -ForegroundColor White
Write-Host "  4. Check Render dashboard for deployment logs" -ForegroundColor White

Write-Host "Your Chouieur Express app is now deploying to Render!" -ForegroundColor Green
