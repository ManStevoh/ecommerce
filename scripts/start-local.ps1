# Nexora Commerce — local bootstrap (PowerShell)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Starting Docker infrastructure..."
docker compose -f infrastructure/docker/docker-compose.yml up -d

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env from .env.example"
}

Write-Host "Pushing database schema..."
pnpm db:push
pnpm db:generate
pnpm db:seed

Write-Host ""
Write-Host "Ready. Start services in separate terminals:"
Write-Host "  pnpm dev:core      # gateway + commerce services"
Write-Host "  pnpm dev:frontends # storefront, admin, super-admin"
Write-Host ""
Write-Host "URLs:"
Write-Host "  Gateway     http://localhost:3000/health"
Write-Host "  Storefront  http://localhost:3100"
Write-Host "  Admin       http://localhost:3200"
Write-Host "  Super-admin http://localhost:3300"
