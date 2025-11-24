@echo off
REM Google Maps Data Extractor - Windows Installation Script

echo ==================================================
echo   Google Maps Data Extractor - Installation
echo ==================================================
echo.

REM Check Node.js
echo Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo X Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo √ Node.js version: %NODE_VERSION%
echo.

REM Check npm
echo Checking npm installation...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo X npm is not installed. Please install npm first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo √ npm version: %NPM_VERSION%
echo.

REM Check MongoDB
echo Checking MongoDB installation...
where mongod >nul 2>nul
if %errorlevel% neq 0 (
    echo ! Warning: MongoDB is not found in PATH.
    echo   Please make sure MongoDB is installed and running.
) else (
    echo √ MongoDB found
)
echo.

REM Install Backend Dependencies
echo ==================================================
echo   Installing Backend Dependencies
echo ==================================================
cd backend
call npm install
if %errorlevel% neq 0 (
    echo X Failed to install backend dependencies
    pause
    exit /b 1
)
echo √ Backend dependencies installed successfully
echo.

REM Setup Backend .env
if not exist .env (
    echo Creating backend .env file...
    copy .env.example .env >nul
    echo √ Backend .env file created
    echo ! Please edit backend\.env and configure your settings
) else (
    echo √ Backend .env file already exists
)
echo.

cd ..

REM Install Frontend Dependencies
echo ==================================================
echo   Installing Frontend Dependencies
echo ==================================================
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo X Failed to install frontend dependencies
    pause
    exit /b 1
)
echo √ Frontend dependencies installed successfully
echo.

REM Setup Frontend .env.local
if not exist .env.local (
    echo Creating frontend .env.local file...
    copy .env.example .env.local >nul
    echo √ Frontend .env.local file created
) else (
    echo √ Frontend .env.local file already exists
)
echo.

cd ..

REM Final Instructions
echo ==================================================
echo   Installation Complete!
echo ==================================================
echo.
echo Next steps:
echo.
echo 1. Make sure MongoDB is running:
echo    mongod
echo.
echo 2. Edit configuration files if needed:
echo    - backend\.env
echo    - frontend\.env.local
echo.
echo 3. Start the backend server:
echo    cd backend
echo    npm run start:dev
echo.
echo 4. In a new terminal, start the frontend:
echo    cd frontend
echo    npm run dev
echo.
echo 5. Open your browser at:
echo    http://localhost:3000
echo.
echo ==================================================
echo For more information, see:
echo   - README.md
echo   - QUICK_START.md
echo   - PROJECT_SUMMARY.md
echo ==================================================
echo.
pause
