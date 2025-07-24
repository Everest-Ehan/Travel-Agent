@echo off
echo Starting Fora Travel Hotel Search Application...
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo Starting Frontend Server...
cd ..\frontend
start "Frontend Server" cmd /k "npm install && npm run dev"

echo.
echo Both servers are starting...
echo Backend will be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:3000
echo.
echo IMPORTANT: Make sure you have created the .env file in the backend directory
echo with your Bearer token and session cookie before starting the servers.
echo.
pause 