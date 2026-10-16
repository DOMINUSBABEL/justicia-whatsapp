@echo off
title JusticIA WhatsApp - Portal Web & Centro de Control Autonomo (Antioquia 2040)
echo ===============================================================================
echo   JUSTICIA WHATSAPP v2.5.0 - PORTAL WEB ^& PANEL DE OPERACION AUTONOMA
echo   Agenda Antioquia 2040 ^| Catedra G8 (UdeA, EAFIT, UPB, Unilasallista, UNAL)
echo ===============================================================================
echo.
start http://localhost:3080
node src/api-server.js
pause
