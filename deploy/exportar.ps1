# Compila las dos imagenes y las deja en un solo .tar.gz listo para subir al droplet.
# Uso:  .\exportar.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$tar = Join-Path $PSScriptRoot "mercadito-images.tar"
$gz = "$tar.gz"

Write-Host "==> Compilando imagenes (la primera vez tarda: descarga Maven y npm)..."
docker compose build
if ($LASTEXITCODE -ne 0) { throw "Fallo 'docker compose build'" }

Write-Host "==> Exportando imagenes..."
if (Test-Path $tar) { Remove-Item $tar -Force }
docker save mercadito-app:latest mercadito-web:latest -o $tar
if ($LASTEXITCODE -ne 0) { throw "Fallo 'docker save'" }

Write-Host "==> Comprimiendo (baja el tar a menos de la mitad)..."
if (Test-Path $gz) { Remove-Item $gz -Force }
$entrada = [System.IO.File]::OpenRead($tar)
$salida = [System.IO.File]::Create($gz)
$gzip = New-Object System.IO.Compression.GZipStream($salida, [System.IO.Compression.CompressionMode]::Compress)
try {
    $entrada.CopyTo($gzip)
}
finally {
    $gzip.Dispose()
    $salida.Dispose()
    $entrada.Dispose()
}
Remove-Item $tar -Force

$mb = [math]::Round((Get-Item $gz).Length / 1MB, 1)
Write-Host ""
Write-Host "Listo: $gz ($mb MB)"
Write-Host "Ahora:  .\subir.ps1 -Servidor root@IP_DEL_DROPLET"
