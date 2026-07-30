# Sube solo el codigo fuente (~700 KB) y compila en el droplet.
# Conviene cuando tu conexion de subida es lenta: el droplet baja las imagenes base
# mucho mas rapido que tu, y tu solo mandas el fuente.
# Uso:  .\subir-fuente.ps1 -Servidor root@143.198.1.2

param(
    [Parameter(Mandatory = $true)][string]$Servidor,
    [string]$RutaRemota = "/opt/mercadito"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$raiz = Split-Path $PSScriptRoot -Parent
$tar = Join-Path $PSScriptRoot "fuente.tar.gz"

Write-Host "==> Empaquetando fuente (sin node_modules, target ni dist)..."
if (Test-Path $tar) { Remove-Item $tar -Force }
tar -czf $tar --exclude=node_modules --exclude=target --exclude=dist --exclude=.env --exclude=*.tar.gz -C $raiz mercaditolibre mercaditolibre_frontend deploy
if ($LASTEXITCODE -ne 0) { throw "Fallo el empaquetado" }
Write-Host ("    " + [math]::Round((Get-Item $tar).Length / 1KB, 0) + " KB")

Write-Host "==> Subiendo..."
ssh $Servidor "mkdir -p $RutaRemota"
if ($LASTEXITCODE -ne 0) { throw "Fallo la conexion SSH" }
scp $tar "${Servidor}:$RutaRemota/"
if ($LASTEXITCODE -ne 0) { throw "Fallo el scp" }

# El .env no viaja en el tar: se sube una sola vez a mano y se queda en el droplet.
# Se compila un servicio a la vez: en 2 GB compartidos, Maven y Vite en paralelo se quedan sin RAM.
Write-Host "==> Compilando en el droplet (la primera vez tarda unos minutos)..."
ssh $Servidor "cd $RutaRemota && tar xzf fuente.tar.gz && rm -f fuente.tar.gz && cd deploy && COMPOSE_BAKE=false docker compose build app && COMPOSE_BAKE=false docker compose build web && docker compose up -d && docker compose ps"
if ($LASTEXITCODE -ne 0) { throw "Fallo el build o el arranque remoto" }

Remove-Item $tar -Force
Write-Host ""
Write-Host "Desplegado."
Write-Host "  Logs:  ssh $Servidor `"cd $RutaRemota/deploy && docker compose logs -f app`""
