# Sube el tar.gz al droplet, carga las imagenes y levanta el stack.
# Uso:  .\subir.ps1 -Servidor root@143.198.1.2

param(
    [Parameter(Mandatory = $true)][string]$Servidor,
    [string]$RutaRemota = "/opt/mercadito"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$gz = Join-Path $PSScriptRoot "mercadito-images.tar.gz"
if (-not (Test-Path $gz)) { throw "No existe mercadito-images.tar.gz. Corre primero .\exportar.ps1" }

Write-Host "==> Creando $RutaRemota en el droplet..."
ssh $Servidor "mkdir -p $RutaRemota"
if ($LASTEXITCODE -ne 0) { throw "Fallo la conexion SSH" }

Write-Host "==> Subiendo compose..."
scp docker-compose.prod.yml "${Servidor}:$RutaRemota/docker-compose.yml"
if ($LASTEXITCODE -ne 0) { throw "Fallo el scp del compose" }

Write-Host "==> Subiendo initdb..."
scp -r initdb "${Servidor}:$RutaRemota/"
if ($LASTEXITCODE -ne 0) { throw "Fallo el scp de initdb" }

Write-Host "==> Subiendo imagenes (esto es lo que tarda)..."
scp $gz "${Servidor}:$RutaRemota/"
if ($LASTEXITCODE -ne 0) { throw "Fallo el scp de las imagenes" }

# El .env no se sube: se crea una sola vez a mano en el droplet y ahi se queda.
Write-Host "==> Cargando imagenes y levantando el stack..."
ssh $Servidor "cd $RutaRemota && gunzip -f mercadito-images.tar.gz && docker load -i mercadito-images.tar && rm -f mercadito-images.tar && docker compose up -d && docker compose ps"
if ($LASTEXITCODE -ne 0) { throw "Fallo el despliegue remoto" }

Write-Host ""
Write-Host "Desplegado. Revisa los logs con:"
Write-Host "  ssh $Servidor `"cd $RutaRemota && docker compose logs -f app`""
