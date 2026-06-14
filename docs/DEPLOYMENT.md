# Production Hosting Guide: kenwafula.cv
### Optimized for Kali Linux & Host-based Cloudflare Tunnel

This guide provides the exact configuration updates and CLI commands to host Nexora Commerce on your Kali Linux server.

---

## 1. Why the Single-Container Approach?
In a standard containerized setup, you would spin up 18 separate Node.js Docker containers (15 microservices + 3 frontends). On a single VM, this creates **massive memory overhead** (each Node runtime consumes 200MB-350MB of RAM just idling, total ~5GB+ of RAM overhead).

By running the databases separately but launching the monorepo platform services in a single container managed by **pnpm** and **Turbo**, we run all services inside a single node process tree. This reduces memory overhead to **less than 600MB total**, which is essential for single-server hosting.

---

## 2. In-Place Cloudflare Tunnel Configuration Update

To add the e-commerce subdomains to your `/etc/cloudflared/config.yml` file without opening a text editor, copy and paste this command into your Kali terminal:

```bash
sudo python3 -c '
path = "/etc/cloudflared/config.yml"
with open(path, "r") as f:
    content = f.read()

new_rules = """  # API Gateway
  - hostname: api-ecommerce.kenwafula.cv
    service: http://127.0.0.1:3000

  # Store Admin Panel
  - hostname: admin-ecommerce.kenwafula.cv
    service: http://127.0.0.1:3200

  # Super Admin Panel
  - hostname: superadmin-ecommerce.kenwafula.cv
    service: http://127.0.0.1:3300

  # Storefront & Tenant Wildcard Subdomains
  - hostname: ecommerce.kenwafula.cv
    service: http://127.0.0.1:3100
  - hostname: "*.kenwafula.cv"
    service: http://127.0.0.1:3100

  # Catch-all: return 404 for any other domain
  - service: http_status:404"""

if "- service: http_status:404" in content and "api-ecommerce.kenwafula.cv" not in content:
    content = content.replace("  - service: http_status:404", new_rules)
    with open(path, "w") as f:
        f.write(content)
    print("Success: /etc/cloudflared/config.yml updated successfully!")
else:
    print("Status: Ingress rules already updated or config file does not match default structure.")
'
```

---

## 3. DNS Record Setup (Two Options)

To map the domains to your tunnel, choose **one** of the options below:

### Option A: CLI-Based Generation (Run WITHOUT sudo)
Since your login certificate is located in your user's home folder (`/home/staticlumen/.cloudflared/cert.pem`), running these commands with `sudo` will fail (as it searches in `/root/`). 

Run them **without `sudo`** as your standard `staticlumen` user:

```bash
# Register CNAMEs for the e-commerce subdomains (Run as normal user)
cloudflared tunnel route dns 5374ce68-6c73-4e11-8861-e76f4351f45e ecommerce.kenwafula.cv
cloudflared tunnel route dns 5374ce68-6c73-4e11-8861-e76f4351f45e api-ecommerce.kenwafula.cv
cloudflared tunnel route dns 5374ce68-6c73-4e11-8861-e76f4351f45e admin-ecommerce.kenwafula.cv
cloudflared tunnel route dns 5374ce68-6c73-4e11-8861-e76f4351f45e superadmin-ecommerce.kenwafula.cv
cloudflared tunnel route dns 5374ce68-6c73-4e11-8861-e76f4351f45e *.kenwafula.cv
```

### Option B: Manual Web Dashboard (Alternative)
If you prefer, you can manually add the CNAME records in the Cloudflare Web Dashboard:

* **CNAME** `ecommerce` -> `5374ce68-6c73-4e11-8861-e76f4351f45e.cfargotunnel.com` (Proxied)
* **CNAME** `api-ecommerce` -> `5374ce68-6c73-4e11-8861-e76f4351f45e.cfargotunnel.com` (Proxied)
* **CNAME** `admin-ecommerce` -> `5374ce68-6c73-4e11-8861-e76f4351f45e.cfargotunnel.com` (Proxied)
* **CNAME** `superadmin-ecommerce` -> `5374ce68-6c73-4e11-8861-e76f4351f45e.cfargotunnel.com` (Proxied)
* **CNAME** `*` -> `5374ce68-6c73-4e11-8861-e76f4351f45e.cfargotunnel.com` (Proxied)

---

## 4. Running the Platform

The `docker-compose.prod.yml` has already been created in the root of the repository, so it will be downloaded automatically when you push the current code and clone it onto your server.

### Step 4.1: Replicate env templates
```bash
# In the cloned directory root, copy all env templates
find . -name ".env.example" -exec sh -c 'cp "$1" "${1%.example}"' _ {} \;
```

### Step 4.2: Start Database & Seed Data
```bash
# Spin up databases in the background
docker compose -f docker-compose.prod.yml up -d postgres redis meilisearch

# Wait 10 seconds, then generate prisma clients and seed database
sleep 10
docker compose -f docker-compose.prod.yml run --rm platform sh -c "corepack enable && pnpm install && pnpm db:push && pnpm db:seed"
```

### Step 4.3: Start Platform & Reload Tunnel
```bash
# Boot the e-commerce platform
docker compose -f docker-compose.prod.yml up -d

# Reload the cloudflared daemon to apply the new config.yml routes
sudo systemctl restart cloudflared
```

---

## 5. Updating the Platform (Deployment Updates)

When you make changes to your codebase, push them to GitHub, and want to deploy them to your production server:

### Step 5.1: Pull latest changes on the host
```bash
# Pull the latest code
git pull origin main
```

### Step 5.2: Apply database updates and dependency changes
```bash
# Update dependencies and run schema synchronization
docker compose -f docker-compose.prod.yml run --rm platform sh -c "corepack enable && pnpm install && pnpm db:push"
```

### Step 5.3: Restart the platform container
```bash
# Restart the container to rebuild and launch the updated production assets
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### Alternatively: Automate Updates with a Script

For convenience, a script is provided at [scripts/update-platform.sh](file:///home/staticlumen/Projects/ecommerce/scripts/update-platform.sh) that consolidates all of the steps above.

To run the automated update:
```bash
# Make it executable (if not already done)
chmod +x scripts/update-platform.sh

# Run the update script
./scripts/update-platform.sh
```

### 5.4: Fully Automate Deployment via Git Polling (Cron)
If you do not have Admin permissions on the GitHub repository to configure GitHub Actions/Runners, you can automate deployments directly on the server by running a background cron job that polls GitHub for updates.

A polling script is located at [scripts/poll-deploy.sh](file:///home/staticlumen/Projects/ecommerce/scripts/poll-deploy.sh).

#### Setup Instructions on the Server:
1. Make sure the polling script is executable:
   ```bash
   chmod +x /home/staticlumen/Websites/ecommerce/scripts/poll-deploy.sh
   ```
2. Open your user's crontab scheduler:
   ```bash
   crontab -e
   ```
3. Add the following line to check for updates every 5 minutes (adjust the schedule as needed). Using `flock -n /tmp/deploy.lock` ensures that only one build/deployment runs on the server at any given time to prevent resource exhaustion:
   ```cron
   */5 * * * * flock -n /tmp/deploy.lock /bin/bash /home/staticlumen/Websites/ecommerce/scripts/poll-deploy.sh >> /home/staticlumen/Websites/ecommerce/deploy.log 2>&1
   ```
4. Save and exit. The deployment status and updates will be logged to `/home/staticlumen/Websites/ecommerce/deploy.log`.



