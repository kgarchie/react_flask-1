@echo off

if not exist .\backend\venv\Scripts\activate.bat (
    python3 -m venv .\backend\venv
    call .\backend\venv\Scripts\activate
    pip3 install -r .\backend\requirements.txt
) else (
    call .\backend\venv\Scripts\activate
)

start cmd /b /k "python .\backend\app.py"

if errorlevel 1 (
    echo Error
    exit 1
)

if not exist .\frontend\node_modules (
    cd frontend && npm install
)

if errorlevel 1 (
    echo Error
    exit 1
)

start cmd /b /k "cd frontend && npm run dev"