Set-Location -Path $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js no esta instalado. Instala Node.js 20 o superior desde https://nodejs.org"
  exit 1
}
if (-not (Test-Path "node_modules")) {
  Write-Host "Instalando dependencias..."
  npm install
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
Write-Host "Ideark Studio estara en http://localhost:5173"
npm run dev
