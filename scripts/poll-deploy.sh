#!/bin/bash
# Path to this project's directory
PROJECT_DIR="/home/staticlumen/Websites/ecommerce"

# Navigate to the project directory
cd "$PROJECT_DIR" || { echo "Directory $PROJECT_DIR not found"; exit 1; }

# Fetch remote main branch
git fetch origin main

# Get local and remote HEAD commit hashes
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

# If hashes do not match, run the deployment script
if [ "$LOCAL" != "$REMOTE" ]; then
    echo "========================================="
    echo "$(date): New updates found on GitHub!"
    echo "Local:  $LOCAL"
    echo "Remote: $REMOTE"
    echo "========================================="
    
    # Run the deployment update script
    chmod +x scripts/update-platform.sh
    ./scripts/update-platform.sh
else
    echo "$(date): Nexora Commerce is already up to date ($LOCAL)."
fi
