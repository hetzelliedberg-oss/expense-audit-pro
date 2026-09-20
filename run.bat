@echo off
title ExpenseAudit Pro - AI Expense Auditor
echo ======================================================================
echo    ExpenseAudit Pro - AI Financial Audit & Expense Management
echo ======================================================================
echo.
echo Checking dependencies...
python -c "import flask, openpyxl, google.genai" 2>nul
if %errorlevel% neq 0 (
    echo Installing required packages...
    pip install -r requirements.txt
)

echo.
echo Starting Web Server at http://127.0.0.1:5000 ...
echo Press Ctrl+C to stop.
echo.
start http://127.0.0.1:5000
python app.py
pause
