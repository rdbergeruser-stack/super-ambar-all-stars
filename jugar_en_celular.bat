@echo off
chcp 65001 >nul
title Super Ambar All-Stars - Servidor Movil Wi-Fi
echo =====================================================================
echo        ★ SUPER AMBAR ALL-STARS - VERSION MOVIL POR WI-FI ★
echo =====================================================================
echo.
echo Buscando la direccion IP de tu PC en la red Wi-Fi...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
  for /f "tokens=1" %%b in ("%%a") do (
    echo   ► Abre en el navegador de tu celular:  http://%%b:8080
  )
)
echo.
echo (Asegurate de que tu celular este conectado al mismo Wi-Fi que esta PC)
echo Presiona Ctrl+C para detener el servidor cuando termines de jugar.
echo =====================================================================
echo.
npx --yes http-server -p 8080 -c-1
pause

