Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "powershell -ExecutionPolicy Bypass -File ""C:\Users\trisd\clawd\scripts\start-mission-control.ps1""", 0, False
