#!/bin/bash
# Script to automate deployment updates on the host

# Exit immediately if a command exits with a non-zero status
set -e

echo "========================================="
echo "  Nexora Platform - Deployment Update    "
echo "========================================="

echo "Step 1: Pulling latest changes from origin main..."
git pull origin main

echo "Step 2: Syncing dependencies and database schemas..."
docker compose -f docker-compose.prod.yml run --rm platform sh -c "corepack enable && pnpm install && pnpm db:push"

echo "Step 3: Restarting the platform containers..."
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

echo "========================================="
echo "  Platform update completed successfully! "
echo "========================================="
