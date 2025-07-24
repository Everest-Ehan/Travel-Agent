Write-Host "Starting Fora Travel Hotel Search Application..." -ForegroundColor Green
Write-Host ""

# Check if .env file exists in backend
if (-not (Test-Path "backend\.env")) {
    Write-Host "WARNING: .env file not found in backend directory!" -ForegroundColor Yellow
    Write-Host "Please create backend\.env with your Bearer token and session cookie." -ForegroundColor Yellow
    Write-Host "See README.md for instructions on how to obtain these tokens." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; if (-not (Test-Path 'venv')) { python -m venv venv }; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt; uvicorn main:app --reload --host 0.0.0.0 --port 8000"

Write-Host ""
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm install; npm run dev"

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:8000" -ForegroundColor White
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 