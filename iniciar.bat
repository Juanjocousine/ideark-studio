@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js no esta instalado.
  echo Instala Node.js 20 o superior desde https://nodejs.org y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo npm install ha fallado.
    pause
    exit /b 1
  )
)
echo.
echo Ideark Studio estara en http://localhost:5173
echo Cierra esta ventana para detener la aplicacion.
echo.
call npm run dev
if errorlevel 1 (
  echo.
  echo No se ha podido arrancar. Si el puerto 5173 esta ocupado, cierra el otro proceso y repite.
  pause
  exit /b 1
)
endlocal
