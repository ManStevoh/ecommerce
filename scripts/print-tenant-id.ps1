# Prints demo tenant id after seed for .env.local
Set-Location $PSScriptRoot\..

$env:DATABASE_URL = (Get-Content .env -ErrorAction SilentlyContinue | Where-Object { $_ -match '^DATABASE_URL=' }) -replace '^DATABASE_URL=', '' -replace '"', ''
if (-not $env:DATABASE_URL) {
  $env:DATABASE_URL = 'postgresql://nexora:nexora_secret@localhost:5432/nexora?schema=public'
}

Write-Host "Demo tenant subdomain: freshfish"
Write-Host "Add to apps/storefront/.env.local:"
Write-Host "NEXT_PUBLIC_TENANT_ID=<run db:seed and copy tenant id from output>"
